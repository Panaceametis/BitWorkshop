const $ = (s) => document.querySelector(s);
const FACES = ["👻", "💀", "🎃", "🦇", "🕷️", "🧟"];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let levels = [];
let current = 0;
let started = false;
let soundOn = localStorage.getItem("manor.sound") !== "off";
let scaresOn = localStorage.getItem("manor.scares") !== "off";
const hintsShown = {};

const getSolved = () => JSON.parse(localStorage.getItem("manor.solved") || "[]");
const setSolved = (v) => localStorage.setItem("manor.solved", JSON.stringify(v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Sound (generated with Web Audio, no files needed) ---------- */
let actx;
let drone = null;
const audio = () => (actx ||= new (window.AudioContext || window.webkitAudioContext)());

function tone(type, f0, f1, dur, vol, delay = 0) {
  const a = audio(), t = a.currentTime + delay;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

function noise(dur, vol) {
  const a = audio(), n = a.sampleRate * dur;
  const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), g = a.createGain();
  s.buffer = buf;
  g.gain.value = vol;
  s.connect(g).connect(a.destination);
  s.start();
}

const sfx = {
  scare() { if (!soundOn) return; noise(0.7, 0.5); tone("sawtooth", 700, 50, 0.8, 0.35); tone("square", 1200, 2400, 0.5, 0.12); },
  win() { if (!soundOn) return; [523, 659, 784, 1047].forEach((f, i) => tone("triangle", f, f * 1.01, 0.35, 0.15, i * 0.1)); },
  nope() { if (!soundOn) return; tone("sawtooth", 160, 70, 0.4, 0.15); },
  creak() { if (!soundOn) return; tone("sawtooth", 80, 130, 0.6, 0.04); },
};

function updateDrone() {
  const want = started && soundOn;
  if (want && !drone) {
    const a = audio(), g = a.createGain();
    g.gain.value = 0.025;
    g.connect(a.destination);
    const oscs = [55, 55.8, 82.4].map((f) => {
      const o = a.createOscillator();
      o.frequency.value = f;
      o.connect(g);
      o.start();
      return o;
    });
    drone = { oscs };
  } else if (!want && drone) {
    drone.oscs.forEach((o) => o.stop());
    drone = null;
  }
}

/* ---------- Jumpscares ---------- */
function jumpscare() {
  if (!scaresOn) return;
  const el = $("#scare");
  el.textContent = pick(FACES);
  el.className = "";
  void el.offsetWidth; // restart the animation
  el.className = reduceMotion ? "show calm" : "show";
  sfx.scare();
  setTimeout(() => (el.className = "hidden"), 900);
}

function scheduleRandomScare() {
  setTimeout(() => {
    if (started && !document.hidden) jumpscare();
    scheduleRandomScare();
  }, 45000 + Math.random() * 75000);
}

/* ---------- Rendering ---------- */
const fmt = (text) => text.replace(/`([^`]+)`/g, "<code>$1</code>");

function unlocked(i, solved) {
  return i === 0 || solved.includes(levels[i - 1].id);
}

function render() {
  const solved = getSolved();
  $("#bar").style.width = `${(solved.length / levels.length) * 100}%`;
  $("#ptext").textContent = `${solved.length} / ${levels.length} rooms cleared`;
  $("#snd").textContent = soundOn ? "🔊 Sound on" : "🔇 Sound off";
  $("#scr").textContent = scaresOn ? "😱 Scares on" : "😌 Scares off";

  $("#map").innerHTML = levels.map((l, i) => {
    const done = solved.includes(l.id), open = unlocked(i, solved);
    const icon = !open ? "🔒" : done ? "✅" : l.emoji;
    return `<button class="door ${i === current ? "active" : ""} ${done ? "done" : ""}"
              data-i="${i}" ${open ? "" : "disabled"}>${icon} ${i + 1}. ${l.name}</button>`;
  }).join("");

  const l = levels[current];
  const done = solved.includes(l.id);
  const shown = hintsShown[l.id] || 0;
  $("#room").innerHTML = `
    <h2>${l.emoji} ${l.name}</h2>
    <p class="story">${fmt(l.story)}</p>
    <div class="mission">🎯 ${fmt(l.mission)}</div>
    ${l.hints.slice(0, shown).map((h, i) => `<div class="hint">💡 Hint ${i + 1}: ${fmt(h)}</div>`).join("")}
    ${shown < l.hints.length && !done ? `<button id="hint" class="btn ghosty small">Need a hint? (${shown}/${l.hints.length})</button>` : ""}
    ${done
      ? `<div class="learned">👻 <b>Boo-ker says:</b> ${fmt(l.learned)}</div>
         ${current < levels.length - 1 ? `<form><button id="next" class="btn" type="button">Next room →</button></form>` : ""}`
      : `<form id="answer-form">
           <input id="answer" placeholder="Type the secret code..." autocomplete="off" autofocus>
           <button class="btn" type="submit">Unlock</button>
         </form>
         <div id="feedback" class="feedback"></div>`}
  `;
}

function goTo(i) {
  current = i;
  sfx.creak();
  render();
  if (Math.random() < 0.15) setTimeout(jumpscare, 1500 + Math.random() * 3000);
}

async function submit(e) {
  e.preventDefault();
  const l = levels[current];
  const answer = $("#answer").value;
  if (!answer.trim()) return;
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: l.id, answer }),
  }).then((r) => r.json());

  if (res.correct) {
    setSolved([...new Set([...getSolved(), l.id])]);
    sfx.win();
    render();
    if (getSolved().length === levels.length) {
      setTimeout(() => $("#victory").classList.remove("hidden"), 600);
    } else if (Math.random() < 0.5) {
      setTimeout(jumpscare, 900);
    }
  } else {
    sfx.nope();
    const room = $("#room");
    room.classList.remove("shake");
    void room.offsetWidth;
    room.classList.add("shake");
    const fb = $("#feedback");
    fb.className = "feedback bad";
    fb.textContent = pick([
      "The door doesn't budge...",
      "A cold breath on your neck. Wrong code.",
      "Something giggles in the dark. Try again.",
      "Nope. The ghost shakes its head.",
    ]);
    if (Math.random() < 0.25) setTimeout(jumpscare, 400);
  }
}

/* ---------- Events ---------- */
document.addEventListener("click", (e) => {
  const door = e.target.closest(".door");
  if (door) return goTo(Number(door.dataset.i));
  if (e.target.id === "hint") {
    const id = levels[current].id;
    hintsShown[id] = (hintsShown[id] || 0) + 1;
    sfx.creak();
    return render();
  }
  if (e.target.id === "next") return goTo(current + 1);
  if (e.target.tagName === "CODE") {
    navigator.clipboard?.writeText(e.target.textContent);
    e.target.classList.add("copied");
    setTimeout(() => e.target.classList.remove("copied"), 600);
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "answer-form") submit(e);
});

$("#enter").addEventListener("click", () => {
  started = true;
  $("#intro").classList.add("hidden");
  audio().resume();
  updateDrone();
  sfx.creak();
  scheduleRandomScare();
});

$("#snd").addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("manor.sound", soundOn ? "on" : "off");
  updateDrone();
  render();
});

$("#scr").addEventListener("click", () => {
  scaresOn = !scaresOn;
  localStorage.setItem("manor.scares", scaresOn ? "on" : "off");
  render();
});

$("#rst").addEventListener("click", () => {
  if (!confirm("Reset all progress? The ghosts will forget you.")) return;
  setSolved([]);
  current = 0;
  render();
});

$("#close-victory").addEventListener("click", () => $("#victory").classList.add("hidden"));

/* ---------- Boot ---------- */
fetch("/api/levels").then((r) => r.json()).then((data) => {
  levels = data;
  const solved = getSolved();
  // Resume at the first unsolved room
  current = Math.max(0, levels.findIndex((l) => !solved.includes(l.id)));
  if (solved.length === levels.length) current = levels.length - 1;
  render();
});
