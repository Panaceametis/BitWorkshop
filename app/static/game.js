const $ = (s) => document.querySelector(s);
const T = 16; // tile size in pixels

/* ---------- The map (20 x 15 tiles) ----------
   #  wall          .  wooden floor   ,  grass        -  dirt path
   T  tree          +  gravestone     ~  iron fence   B  bookshelf
   W  cobweb        r  carpet         L  table        K  candle
   R  barrel        P  coffin         J  jack-o'-lantern
   O  front door    2,4,5,6  door that opens once room (n-1) is solved
   a-g  the seven challenge spots (room 1-7)                            */
const MAP = [
  "####################",
  "#BBbBB#W..e.R#WP.f.#",
  "#W...W#K.....#....K#",
  "#.....####5#####6###",
  "#.....#...r.W#RW..R#",
  "#.LL..#.a.r..#.....#",
  "#.....2...r..4...d.#",
  "#K...K#K..r.K#K...R#",
  "##########O#########",
  "T,,,,,,J,,-,,,,,,,,T",
  "T,,c,,+,,,-,,+,,+,,T",
  "T,,,,,,,,,-,,,,,,,,T",
  "T,+,,+,,T,-,,+,,+,,T",
  "T,,,,,,,,,-,,,,J,,,T",
  "~~~~~~~~~~g~~~~~~~~~",
];
const COLS = MAP[0].length, ROWS = MAP.length;
const START = { x: 10, y: 13 };
const STATIONS = "abcdefg";
const DOORS = "2456";
const WALK = new Set([".", ",", "-", "O", "W", "r"]);

const WHERE = {
  1: "Talk to Boo-ker in the foyer, inside the manor.",
  2: "Find the glowing bookshelf in the library (west wing).",
  3: "Visit the crypt in the graveyard.",
  4: "Open the trapdoor in the cellar (east wing).",
  5: "Climb up to the attic (north of the foyer).",
  6: "Go down into the dungeon (through the cellar).",
  7: "Go back to the graveyard gate.",
};
const UNLOCKED = {
  1: "*click* The door to the library swings open...",
  2: "You hear scratching from the crypt in the graveyard...",
  3: "*click* The door to the cellar swings open...",
  4: "The attic stairs creak. The way up is open...",
  5: "Stairs from the cellar down to the dungeon appear...",
  6: "A cold wind blows from the graveyard gate...",
  7: "The gate creaks open. Walk through it to escape!",
};

// What the skeletons and spiders moan when you walk past (shown, spoken)
const PHRASES = [
  ["Teeeam... Fiiiirrrst...", "Teeeam... Fiiirst..."],
  ["Nooo prototyyype... nooo meeeeting...", "Nooo prototype... Nooo meeeting..."],
  ["Puuushing the staaatus quooooo...", "Puuushing... the staaatus quooo..."],
  // Spelled for the voice: "lead" would otherwise be read as "led"
  ["Weeehee... llllllead... We leaaar...nnnnn...", "Weee... heee... We leeeed... We lurrrrn..."],
];
const DAISY_LINES = ["Hiii!", "I'm Daisy!", "Hee hee hee!", "Wheee!", "Uh-oh!", "Boo!", "Daisy!", "Ooooh!"];
const SCARE_PHOTOS = ["scare-face.png", "scare-1.png", "scare-2.png", "scare-3.png",
  "scare-4.png", "scare-5.png", "scare-6.png", "scare-7.png"];

/* ---------- Sprites (16x16, '.' = transparent) ---------- */
// Baby Daisy: crown with gems, auburn hair, pacifier, yellow dress, white socks, red shoes
const PLAYER = [
  ".......cc.......",
  ".....rcjjcr.....",
  "....kcccccck....",
  "...khhhhhhhhk...",
  "..khhhhhhhhhhk..",
  "..khhsssssshhk..",
  ".hkseesssseeskh.",
  ".hkspssqqsspskh.",
  "..kssssqqssssk..",
  "...kkyygyykk....",
  "..ksyyyyyyyysk..",
  "..ksyyyyyyyysk..",
  "..kooooooooook..",
  "...kwwwkkwwwk...",
  "...kwwk..kwwk...",
  "...kRRk..kRRk...",
];
const PLAYER_PAL = {
  k: "#1a1022", c: "#ffc94a", r: "#e83a3a", j: "#3fc9a0", h: "#d9772b", s: "#fde8d0", e: "#2a5fd0",
  p: "#f0a0a0", q: "#e8b85a", y: "#f7d65a", g: "#3fb889", o: "#f0844a", w: "#ffffff", R: "#e04a2a",
};

const GHOST = [
  "................",
  ".....kkkkkk.....",
  "....kwwwwwwk....",
  "...kwwwwwwwwk...",
  "..kwwwwwwwwwwk..",
  "..kweewwwweewk..",
  "..kweewwwweewk..",
  "..kwpwwwwwwpwk..",
  "..kwwwwkkwwwwk..",
  "..kwwwwwwwwwwk..",
  "..kwwwwwwwwwgk..",
  "..kwwwwwwwwggk..",
  "..kwwgwwwgwwgk..",
  "..kwk.kwwk.kwk..",
  "...k...kk...k...",
  "................",
];
const GHOST_PAL = { k: "#1a1022", w: "#f4f0ff", g: "#b9b0e0", e: "#1a1022", p: "#ff9ad5" };
const SCARY_PAL = { k: "#000000", w: "#cfc8dc", g: "#7a7098", e: "#ff1a3c", p: "#ff1a3c" };

const SKELETON_TOP = [
  "................",
  ".....kkkkkk.....",
  "....kbbbbbbk....",
  "....kbrbbrbk....",
  "....kbbbbbbk....",
  ".....kbkkbk.....",
  "......kbbk......",
  "...kkbbbbbbkk...",
  "..kb.kbkkbk.bk..",
  "..kb.kbbbbk.bk..",
  "..kk..kbbk..kk..",
  "......kbbk......",
];
const SKELETON_LEGS = [
  [".....kb..bk.....", ".....kb..bk.....", ".....kb..bk.....", "....kbb..bbk...."],
  [".....kb..bk.....", "....kb....bk....", "....kb....bk....", "...kbb....bbk..."],
];
const SKELETON_PAL = { k: "#1a1022", b: "#e8e4d8", r: "#ff2a2a" };

const SPIDER = [
  "................",
  "................",
  "................",
  "..l..........l..",
  "...l..kkkk..l...",
  "l...lkbbbbkl...l",
  ".l..kbebbebk..l.",
  "..llkbbbbbbkll..",
  ".l..kbbbbbbk..l.",
  "l..l.kbbbbk.l..l",
  "...l..kkkk..l...",
  "..l..........l..",
  "................",
  "................",
  "................",
  "................",
];
const SPIDER_PAL = { k: "#000000", b: "#3a2450", e: "#ff3355", l: "#1a1022" };

// The crying nun: she sobs silently in the corner of the library (16 x 20, taller than a tile).
// Rows 0-11 are her head (they bob while she sobs), rows 12-19 her body.
const NUN = [
  "......oooo......",
  "....ookkkkoo....",
  "...okkkkkkkko...",
  "..okkwwwwwwkko..",
  "..okwwsssswwko..",
  "..okwsbssbswko..", // eyebrows: inner ends up = sad
  "..okwbssssbwko..",
  "..okwsesseswko..", // closed, crying eyes
  "..okwstsstswko..", // tear streaks
  "..okwstmmtswko..",
  "..okwsmssmswko..", // downturned mouth
  "..okkwwwwwwkko..",
  ".okkkshhhhskkko.", // hands clutching a handkerchief
  ".okkkkshhskkkko.",
  ".okkkkkrrkkkkko.", // rosary
  ".okkkkkkrkkkkko.",
  "okkkkkkkkkkkkkko",
  "okkkkkkkkkkkkkko",
  "okkkkkkkkkkkkkko",
  ".oooooooooooooo.",
];
const NUN_PAL = {
  o: "#0d0915", k: "#2a2040", w: "#ecebf2", s: "#f0d2b8", b: "#a8806e", e: "#3a2620",
  t: "#8fd3ff", m: "#8a3a4a", h: "#ffffff", r: "#c9a030",
};
const NUN_POS = { x: 1, y: 6 };

// Moving monsters. They walk through things, so they can never block the way.
const NPCS = [
  { kind: "skeleton", x: 1, y: 4, min: 1, max: 5, speed: 1.1, dir: 1, next: 0 },   // library
  { kind: "skeleton", x: 2, y: 11, min: 1, max: 8, speed: 0.9, dir: 1, next: 0 },  // graveyard
  { kind: "spider", x: 11, top: 4, range: 1.3, speed: 1.1, y: 4, next: 0 },        // foyer
  { kind: "spider", x: 16, top: 5, range: 1.0, speed: 0.8, y: 5, next: 0 },        // cellar
  { kind: "spider", x: 14, top: 1, range: 0.9, speed: 1.4, y: 1, next: 0 },        // dungeon
];

/* ---------- State ---------- */
let levels = [];
const solved = new Set(JSON.parse(localStorage.getItem("manor.solved") || "[]"));
// Sound and scares can't be switched off. The buttons are a prank (see troll()).
const soundOn = true;
const scaresOn = true;
let started = false;
let escaped = false;
let dialogLevel = null;
let talkNext = 0;
const hintsShown = {};
const held = [];
const player = { x: START.x, y: START.y, px: START.x, py: START.y, fx: 0, fy: 0, t: 0, moving: false, flip: false };
const STEP_MS = 150;
const stationPos = {};
const lights = [];
MAP.forEach((row, y) => [...row].forEach((ch, x) => {
  const i = STATIONS.indexOf(ch);
  if (i >= 0) stationPos[i + 1] = [x, y];
  if (ch === "K" || ch === "J") lights.push({ ch, x, y });
}));

const saveSolved = () => localStorage.setItem("manor.solved", JSON.stringify([...solved]));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nextLevel = () => [1, 2, 3, 4, 5, 6, 7].find((id) => !solved.has(id)) || null;
const tileAt = (x, y) => (MAP[y] && MAP[y][x]) || "#";

/* ---------- Sound (generated with Web Audio, no files needed) ---------- */
let actx;
let music = null;
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

/* Four different jumpscare sounds */
function shriek() {
  noise(0.7, 0.5);
  tone("sawtooth", 700, 50, 0.8, 0.35);
  tone("square", 1200, 2400, 0.5, 0.12);
}

// A deep "booooOOOO" that swells up: a buzzy voice through a filter that slowly opens
function boooo() {
  const a = audio(), t = a.currentTime;
  const voice = a.createOscillator(), filter = a.createBiquadFilter(), out = a.createGain();
  const lfo = a.createOscillator(), depth = a.createGain();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(70, t);
  voice.frequency.linearRampToValueAtTime(95, t + 0.9);
  voice.frequency.linearRampToValueAtTime(150, t + 1.5);
  lfo.frequency.value = 6;
  depth.gain.value = 4;
  lfo.connect(depth).connect(voice.frequency);
  filter.type = "lowpass";
  filter.Q.value = 8;
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.linearRampToValueAtTime(1100, t + 1.4);
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.3, t + 0.3);
  out.gain.linearRampToValueAtTime(0.7, t + 1.4);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 1.75);
  voice.connect(filter).connect(out).connect(a.destination);
  voice.start(t);
  lfo.start(t);
  voice.stop(t + 1.8);
  lfo.stop(t + 1.8);
}

function scream() {
  const a = audio(), t = a.currentTime, out = a.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  out.connect(a.destination);
  for (const detune of [0, 70, -50]) {
    const o = a.createOscillator(), wobble = a.createOscillator(), depth = a.createGain();
    o.type = "sawtooth";
    o.detune.value = detune;
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(1500, t + 0.3);
    o.frequency.exponentialRampToValueAtTime(900, t + 1.1);
    wobble.frequency.value = 13;
    depth.gain.value = 40;
    wobble.connect(depth).connect(o.frequency);
    o.connect(out);
    o.start(t);
    wobble.start(t);
    o.stop(t + 1.2);
    wobble.stop(t + 1.2);
  }
  noise(0.4, 0.3);
}

function thud() {
  tone("sine", 90, 30, 0.9, 0.7);
  tone("square", 50, 40, 0.6, 0.1);
  noise(0.25, 0.4);
}

// Creaky door: fast clicks (the wood rubbing) through a filter, slowing down and speeding up
function doorCreak(dur) {
  const a = audio(), t = a.currentTime;
  const clicks = a.createOscillator(), filter = a.createBiquadFilter(), out = a.createGain();
  clicks.type = "sawtooth";
  clicks.frequency.setValueAtTime(28, t);
  clicks.frequency.linearRampToValueAtTime(60, t + dur * 0.35);
  clicks.frequency.linearRampToValueAtTime(22, t + dur * 0.7);
  clicks.frequency.linearRampToValueAtTime(45, t + dur);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.linearRampToValueAtTime(1500, t + dur);
  filter.Q.value = 4;
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
  out.gain.linearRampToValueAtTime(0.35, t + dur * 0.8);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  clicks.connect(filter).connect(out).connect(a.destination);
  clicks.start(t);
  clicks.stop(t + dur + 0.05);
}

// "Ha-ha-ha-ha": short buzzy bursts, each one a bit lower. Higher and squeakier for the cat.
function synthLaugh(cat) {
  const a = audio(), base = cat ? 520 : 200;
  for (let i = 0; i < 8; i++) {
    const t = a.currentTime + i * 0.16;
    const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(base * (1.15 - i * 0.03), t);
    o.frequency.exponentialRampToValueAtTime(base * 0.8, t + 0.12);
    f.type = "bandpass";
    f.frequency.value = cat ? 1500 : 800;
    f.Q.value = 2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(f).connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 0.15);
  }
}

// The nun's soft crying: three breathy sniffles, then a small wobbly whimper
function breath(t, dur, vol) {
  const a = audio(), n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = buf;
  f.type = "bandpass";
  f.frequency.value = 1300;
  f.Q.value = 1.2;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(a.destination);
  s.start(t);
}

function whimper(t) {
  const a = audio(), o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
  const wobble = a.createOscillator(), depth = a.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(540, t);
  o.frequency.linearRampToValueAtTime(430, t + 1.1);
  wobble.frequency.value = 6;
  depth.gain.value = 14;
  wobble.connect(depth).connect(o.frequency);
  f.type = "lowpass";
  f.frequency.value = 1400;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.035, t + 0.25);
  g.gain.linearRampToValueAtTime(0, t + 1.2);
  o.connect(f).connect(g).connect(a.destination);
  o.start(t);
  wobble.start(t);
  o.stop(t + 1.3);
  wobble.stop(t + 1.3);
}

function sob() {
  const t = audio().currentTime;
  for (let i = 0; i < 3; i++) breath(t + i * 0.28, 0.16, 0.06);
  whimper(t + 0.95);
}

const sfx = {
  scare() { if (soundOn) shriek(); },
  sob() { if (soundOn) sob(); },
  door(dur = 1.3) { if (soundOn) doorCreak(dur); },
  win() { if (!soundOn) return; [523, 659, 784, 1047].forEach((f, i) => tone("square", f, f * 1.01, 0.18, 0.08, i * 0.09)); },
  nope() { if (!soundOn) return; tone("sawtooth", 160, 70, 0.4, 0.15); },
  creak() { if (!soundOn) return; tone("sawtooth", 80, 130, 0.6, 0.04); },
  step() { if (!soundOn) return; tone("square", 110, 80, 0.05, 0.025); },
  bump() { if (!soundOn) return; tone("square", 70, 50, 0.12, 0.06); },
  blip() { if (!soundOn) return; tone("square", 520, 530, 0.03, 0.02); },
};

/* Background music: a spooky-cute music box in A minor with an echo,
   plus a soft ghost "oooOOOooo" every now and then. 0 = rest. */
const BEAT_MS = 420;
const MELODY = [
  440, 523, 659, 523, 494, 0, 392, 0, 349, 440, 523, 440, 415, 0, 494, 0,
  440, 523, 659, 880, 784, 0, 659, 0, 698, 659, 523, 494, 440, 0, 0, 0,
];
const BASS = { 0: 110, 8: 87.31, 16: 110, 24: 82.41 };

function note(bus, type, freq, dur, vol) {
  const a = audio(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function ghostWail(bus) {
  const a = audio(), t = a.currentTime, base = 260 + Math.random() * 120;
  const o = a.createOscillator(), g = a.createGain();
  const lfo = a.createOscillator(), depth = a.createGain();
  o.frequency.setValueAtTime(base, t);
  o.frequency.linearRampToValueAtTime(base * 1.5, t + 1.2);
  o.frequency.linearRampToValueAtTime(base * 0.9, t + 2.6);
  lfo.frequency.value = 5;
  depth.gain.value = 10;
  lfo.connect(depth).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.6);
  g.gain.linearRampToValueAtTime(0, t + 2.8);
  o.connect(g).connect(bus);
  o.start(t);
  lfo.start(t);
  o.stop(t + 3);
  lfo.stop(t + 3);
}

function updateMusic() {
  const want = started && soundOn;
  if (want && !music) {
    const a = audio();
    const bus = a.createGain(), echo = a.createDelay(), feedback = a.createGain(), wet = a.createGain();
    echo.delayTime.value = 0.32;
    feedback.gain.value = 0.35;
    wet.gain.value = 0.35;
    bus.connect(a.destination);
    bus.connect(echo);
    echo.connect(feedback).connect(echo);
    echo.connect(wet).connect(a.destination);

    let step = 0, wail;
    const beat = setInterval(() => {
      const i = step % MELODY.length;
      if (MELODY[i]) note(bus, "triangle", MELODY[i], 1.1, 0.045);
      if (BASS[i]) note(bus, "sine", BASS[i], 3, 0.08);
      step++;
    }, BEAT_MS);
    const scheduleWail = () => {
      wail = setTimeout(() => { ghostWail(bus); scheduleWail(); }, 15000 + Math.random() * 20000);
    };
    scheduleWail();

    music = {
      stop() {
        clearInterval(beat);
        clearTimeout(wail);
        bus.disconnect();
        wet.disconnect();
      },
    };
  } else if (!want && music) {
    music.stop();
    music = null;
  }
}

/* ---------- Voices (the browser's built-in speech) ---------- */
const canSpeak = "speechSynthesis" in window;
// Browsers don't say which voices are male or female, so we go by common voice names
const MALE = /\b(guy|david|mark|george|ryan|christopher|eric|daniel|fred|alex|james|thomas|brian|andrew|roger|steffan|male)\b/i;
const FEMALE = /\b(zira|jenny|aria|samantha|susan|hazel|libby|sonia|emma|michelle|ana|karen|moira|tessa|victoria|female)\b/i;
const voices = { male: null, female: null, any: null };
function loadVoices() {
  const english = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  voices.any = english[0] || null;
  voices.male = english.find((v) => MALE.test(v.name)) || voices.any;
  voices.female = english.find((v) => FEMALE.test(v.name)) || voices.any;
}
if (canSpeak) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function say(text, pitch, rate, volume = 1, voice = "any") {
  if (!soundOn || !canSpeak || speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = pitch;
  u.rate = rate;
  u.volume = volume;
  if (voices[voice]) u.voice = voices[voice];
  speechSynthesis.speak(u);
}

function bubble(text, tx, ty, cls = "") {
  const el = document.createElement("div");
  el.className = `bubble ${cls}`;
  el.textContent = text;
  el.style.left = `${((tx * T + 8) / canvas.width) * 100}%`;
  el.style.top = `${((ty * T - 2) / canvas.height) * 100}%`;
  $("#stage").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function daisySays(text) {
  bubble(text, player.px, player.py - 0.2, "daisy");
  say(text, 2, 1.2, 0.55, "female");
}

function scheduleDaisy() {
  setTimeout(() => {
    if (started && !dialogLevel && !escaped && !document.hidden) daisySays(pick(DAISY_LINES));
    scheduleDaisy();
  }, 45000 + Math.random() * 45000);
}

/* ---------- Pixel drawing ---------- */
const canvas = $("#game");
canvas.width = COLS * T;
canvas.height = ROWS * T;
const ctx = canvas.getContext("2d");
const bg = document.createElement("canvas");
bg.width = canvas.width;
bg.height = canvas.height;
const dark = document.createElement("canvas");
dark.width = canvas.width;
dark.height = canvas.height;

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function hash(x, y, i) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(i, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function sprite(c, rows, pal, x, y, flip = false) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === ".") continue;
      c.fillStyle = pal[row[i]];
      c.fillRect(x + (flip ? row.length - 1 - i : i), y + j, 1, 1);
    }
  });
}

/* Tiles: each painter draws one 16x16 tile at pixel X,Y */
function grass(c, X, Y, tx, ty) {
  rect(c, X, Y, T, T, "#1e3523");
  for (let i = 0; i < 6; i++) {
    const h = hash(tx, ty, i);
    rect(c, X + (h % 15), Y + ((h >>> 4) % 14), 1, 2, i % 2 ? "#2c4f31" : "#152a19");
  }
}

function path(c, X, Y, tx, ty) {
  rect(c, X, Y, T, T, "#4b3b2b");
  for (let i = 0; i < 5; i++) {
    const h = hash(tx, ty, i + 20);
    rect(c, X + (h % 15), Y + ((h >>> 4) % 15), 2, 1, i % 2 ? "#5e4a35" : "#3a2c20");
  }
}

function floor(c, X, Y, tx, ty) {
  rect(c, X, Y, T, T, "#4a2e20");
  for (let r = 0; r < 4; r++) {
    rect(c, X, Y + r * 4 + 3, T, 1, "#36201a");
    rect(c, X + (hash(tx, ty, r) % 12) + 2, Y + r * 4, 1, 3, "#36201a");
  }
  rect(c, X + (hash(tx, ty, 9) % 14), Y + (hash(tx, ty, 8) % 4) * 4 + 1, 2, 1, "#5a3a28");
}

function wall(c, X, Y, tx, ty) {
  rect(c, X, Y, T, T, "#2a2140");
  for (let r = 0; r < 4; r++) {
    rect(c, X, Y + r * 4, T, 1, "#1b1530");
    rect(c, X + (r % 2 ? 4 : 12), Y + r * 4, 1, 4, "#1b1530");
  }
  if (hash(tx, ty, 3) % 3 === 0) rect(c, X + 5, Y + 5, 6, 2, "#352a52");
  // Darker front face where the wall meets the floor below it
  if (ty + 1 < ROWS && tileAt(tx, ty + 1) !== "#") {
    rect(c, X, Y + 12, T, 4, "#1d1630");
    rect(c, X, Y + 12, T, 1, "#3d3058");
  }
}

function tree(c, X, Y, tx, ty) {
  grass(c, X, Y, tx, ty);
  rect(c, X + 7, Y + 11, 2, 5, "#3a2616");
  rect(c, X + 2, Y + 3, 12, 8, "#10261a");
  rect(c, X + 3, Y + 1, 10, 11, "#10261a");
  rect(c, X + 3, Y + 3, 10, 7, "#1c4529");
  rect(c, X + 4, Y + 2, 8, 9, "#1c4529");
  rect(c, X + 5, Y + 3, 3, 2, "#2a6338");
}

function grave(c, X, Y, tx, ty) {
  grass(c, X, Y, tx, ty);
  rect(c, X + 3, Y + 13, 10, 2, "#2a2016");
  rect(c, X + 4, Y + 4, 8, 10, "#6f7787");
  rect(c, X + 5, Y + 3, 6, 1, "#6f7787");
  rect(c, X + 6, Y + 2, 4, 1, "#6f7787");
  rect(c, X + 10, Y + 4, 2, 10, "#545a68");
  rect(c, X + 7, Y + 5, 2, 5, "#4a505c");
  rect(c, X + 6, Y + 6, 4, 1, "#4a505c");
  rect(c, X + 4, Y + 12, 3, 2, "#3d6a3a");
}

function fence(c, X, Y, tx, ty) {
  grass(c, X, Y, tx, ty);
  rect(c, X, Y + 6, T, 1, "#1a1424");
  rect(c, X, Y + 12, T, 1, "#1a1424");
  for (let i = 1; i < T; i += 4) {
    rect(c, X + i, Y + 3, 2, 12, "#2b2438");
    rect(c, X + i, Y + 2, 2, 1, "#4a3f5c");
  }
}

function shelf(c, X, Y, tx, ty, glow) {
  rect(c, X, Y, T, T, "#2e1a0e");
  rect(c, X + 1, Y + 1, 14, 14, "#3e2614");
  const colors = ["#7a2e3a", "#2e5a7a", "#6a7a2e", "#7a5a2e", "#4a2e7a"];
  for (const sy of [1, 6, 11]) {
    let x = 2;
    while (x < 14) {
      const h = hash(tx, ty, x + sy * 16);
      const w = 1 + (h % 2), bh = 3 + ((h >>> 3) % 2);
      rect(c, X + x, Y + sy + 4 - bh, w, bh, colors[h % colors.length]);
      x += w + ((h >>> 5) % 2);
    }
    rect(c, X + 1, Y + sy + 4, 14, 1, "#1e1008");
  }
  if (glow) rect(c, X + 7, Y + 6, 2, 4, "#e090ff");
}

function door(c, X, Y, tx, ty) {
  wall(c, X, Y, tx, ty);
  rect(c, X + 2, Y + 1, 12, 15, "#5a3218");
  rect(c, X + 3, Y + 2, 10, 14, "#6e3e1e");
  rect(c, X + 6, Y + 2, 1, 14, "#5a3218");
  rect(c, X + 9, Y + 2, 1, 14, "#5a3218");
  // padlock
  rect(c, X + 6, Y + 3, 4, 1, "#c9a030");
  rect(c, X + 6, Y + 4, 1, 2, "#c9a030");
  rect(c, X + 9, Y + 4, 1, 2, "#c9a030");
  rect(c, X + 5, Y + 6, 6, 5, "#e8c040");
  rect(c, X + 8, Y + 8, 1, 2, "#3a2a10");
}

function doorway(c, X, Y, tx, ty, mat) {
  floor(c, X, Y, tx, ty);
  rect(c, X, Y, 2, T, "#1b1530");
  rect(c, X + 14, Y, 2, T, "#1b1530");
  if (mat) rect(c, X + 3, Y + 5, 10, 6, "#6a2a2a");
}

function web(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  // Hang the web in the corner against the nearest side wall
  const right = tileAt(tx + 1, ty) === "#" && tileAt(tx - 1, ty) !== "#";
  const dot = (x, y) => rect(c, X + (right ? 15 - x : x), Y + y, 1, 1, "rgba(225,225,240,0.6)");
  for (let i = 0; i < 13; i++) {
    dot(i, 0);
    dot(0, i);
    if (i < 10) dot(i, i);
    dot(i, i >> 1);
    dot(i >> 1, i);
  }
  for (const r of [4, 8, 12]) {
    for (let a = 0; a <= 90; a += 8) {
      const rad = (a * Math.PI) / 180;
      dot(Math.round(r * Math.cos(rad)), Math.round(r * Math.sin(rad)));
    }
  }
}

function carpet(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 2, Y, 12, T, "#6a1f2e");
  rect(c, X + 2, Y, 1, T, "#a8834a");
  rect(c, X + 13, Y, 1, T, "#a8834a");
  rect(c, X + 7, Y + 6, 2, 4, "#a8834a");
  rect(c, X + 6, Y + 7, 4, 2, "#a8834a");
}

function table(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 2, Y + 11, 2, 4, "#2a170c");
  rect(c, X + 12, Y + 11, 2, 4, "#2a170c");
  rect(c, X + 1, Y + 4, 14, 8, "#6e4424");
  rect(c, X + 2, Y + 5, 12, 1, "#8a5a30");
  rect(c, X + 1, Y + 11, 14, 1, "#3a220e");
  // a skull or a little book on the table
  if (hash(tx, ty, 5) % 2) {
    rect(c, X + 5, Y + 5, 5, 4, "#d8d0c0");
    rect(c, X + 6, Y + 6, 1, 1, "#120c18");
    rect(c, X + 8, Y + 6, 1, 1, "#120c18");
  } else {
    rect(c, X + 5, Y + 6, 6, 3, "#4a2e7a");
    rect(c, X + 5, Y + 6, 6, 1, "#e8e0d0");
  }
}

function candle(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 5, Y + 13, 6, 2, "#3a3248");
  rect(c, X + 6, Y + 9, 4, 5, "#3a3248");
  rect(c, X + 7, Y + 4, 2, 5, "#efe6d0");
  rect(c, X + 6, Y + 8, 1, 1, "#efe6d0");
}

function barrel(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 3, Y + 2, 10, 12, "#6a4020");
  rect(c, X + 2, Y + 4, 12, 8, "#6a4020");
  rect(c, X + 2, Y + 5, 12, 1, "#3a3248");
  rect(c, X + 2, Y + 10, 12, 1, "#3a3248");
  rect(c, X + 4, Y + 2, 8, 1, "#8a5a30");
}

function coffin(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 5, Y + 1, 6, 1, "#3a2010");
  rect(c, X + 4, Y + 2, 8, 12, "#4a2a14");
  rect(c, X + 3, Y + 4, 10, 5, "#4a2a14");
  rect(c, X + 5, Y + 14, 6, 1, "#4a2a14");
  rect(c, X + 7, Y + 5, 2, 6, "#c9a030");
  rect(c, X + 6, Y + 7, 4, 1, "#c9a030");
}

function pumpkin(c, X, Y, tx, ty) {
  grass(c, X, Y, tx, ty);
  rect(c, X + 3, Y + 6, 10, 8, "#e8742a");
  rect(c, X + 2, Y + 8, 12, 4, "#e8742a");
  rect(c, X + 6, Y + 6, 1, 8, "#c05a1a");
  rect(c, X + 9, Y + 6, 1, 8, "#c05a1a");
  rect(c, X + 7, Y + 4, 2, 2, "#3d6a3a");
  rect(c, X + 4, Y + 8, 2, 2, "#ffd166");
  rect(c, X + 10, Y + 8, 2, 2, "#ffd166");
  rect(c, X + 5, Y + 11, 6, 1, "#ffd166");
}

function crypt(c, X, Y, tx, ty) {
  grass(c, X, Y, tx, ty);
  rect(c, X + 1, Y + 4, 14, 11, "#5d6472");
  rect(c, X, Y + 3, 16, 2, "#454b57");
  rect(c, X + 3, Y + 1, 10, 2, "#454b57");
  rect(c, X + 6, Y, 4, 1, "#454b57");
  rect(c, X + 2, Y + 5, 2, 10, "#7a8292");
  rect(c, X + 12, Y + 5, 2, 10, "#7a8292");
  rect(c, X + 5, Y + 7, 6, 8, "#120c18");
  rect(c, X + 7, Y + 1, 2, 2, "#ff9ad5");
}

function trapdoor(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 2, Y + 2, 12, 12, "#2a170c");
  rect(c, X + 3, Y + 3, 10, 10, "#5a3a1c");
  rect(c, X + 3, Y + 6, 10, 1, "#3a220e");
  rect(c, X + 3, Y + 9, 10, 1, "#3a220e");
  rect(c, X + 7, Y + 10, 2, 2, "#c9a030");
}

function chest(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  rect(c, X + 2, Y + 6, 12, 8, "#5a3218");
  rect(c, X + 2, Y + 4, 12, 3, "#6e3e1e");
  rect(c, X + 4, Y + 4, 1, 10, "#2a1a0e");
  rect(c, X + 11, Y + 4, 1, 10, "#2a1a0e");
  rect(c, X + 7, Y + 7, 2, 2, "#e8c040");
}

function skull(c, X, Y, tx, ty) {
  floor(c, X, Y, tx, ty);
  for (let y = 0; y < 14; y += 2) {
    rect(c, X + 2, Y + y, 1, 1, "#8a8a9a");
    rect(c, X + 13, Y + y + 1, 1, 1, "#8a8a9a");
  }
  rect(c, X + 4, Y + 3, 8, 7, "#d8d0c0");
  rect(c, X + 5, Y + 10, 6, 2, "#d8d0c0");
  rect(c, X + 5, Y + 5, 2, 2, "#120c18");
  rect(c, X + 9, Y + 5, 2, 2, "#120c18");
  rect(c, X + 6, Y + 10, 1, 2, "#120c18");
  rect(c, X + 9, Y + 10, 1, 2, "#120c18");
}

function gate(c, X, Y, tx, ty, open) {
  if (open) path(c, X, Y, tx, ty);
  else grass(c, X, Y, tx, ty);
  rect(c, X, Y + 1, 2, 15, "#3a3248");
  rect(c, X + 14, Y + 1, 2, 15, "#3a3248");
  rect(c, X, Y, 2, 1, "#ffd166");
  rect(c, X + 14, Y, 2, 1, "#ffd166");
  if (open) return;
  rect(c, X + 2, Y + 2, 12, 1, "#4a3f5c");
  for (let i = 3; i < 14; i += 3) rect(c, X + i, Y + 3, 1, 12, "#4a3f5c");
  rect(c, X + 7, Y + 7, 2, 3, "#e8c040");
}

const PAINTERS = {
  "#": wall, ",": grass, "-": path, T: tree, "+": grave, "~": fence,
  W: web, r: carpet, L: table, K: candle, R: barrel, P: coffin, J: pumpkin,
  c: crypt, d: trapdoor, e: chest, f: skull,
};

function renderBackground() {
  const c = bg.getContext("2d");
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const ch = MAP[ty][tx], X = tx * T, Y = ty * T;
      if (DOORS.includes(ch)) {
        if (solved.has(Number(ch) - 1)) doorway(c, X, Y, tx, ty, false);
        else door(c, X, Y, tx, ty);
      } else if (ch === "B" || ch === "b") shelf(c, X, Y, tx, ty, ch === "b");
      else if (ch === "O") doorway(c, X, Y, tx, ty, true);
      else if (ch === "g") gate(c, X, Y, tx, ty, solved.has(7));
      else (PAINTERS[ch] || floor)(c, X, Y, tx, ty); // "." and "a" (Boo-ker is drawn live)
    }
  }
}

function hole(c, x, y, r) {
  const g = c.createRadialGradient(x, y, r * 0.25, x, y, r);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function drawNpc(n, now) {
  const x = Math.round(n.x * T), y = Math.round(n.y * T);
  if (n.kind === "skeleton") {
    const legs = SKELETON_LEGS[Math.floor(now / 220) % 2];
    rect(ctx, x + 4, y + 14, 8, 2, "rgba(0,0,0,0.35)");
    sprite(ctx, [...SKELETON_TOP, ...legs], SKELETON_PAL, x, y - 2, n.dir < 0);
  } else {
    rect(ctx, x + 7, n.top * T - 4, 1, y - n.top * T + 9, "rgba(225,225,240,0.5)"); // the thread
    sprite(ctx, SPIDER, SPIDER_PAL, x, y);
  }
}

function nunTop() {
  return NUN_POS.y * T + T - NUN.length; // her feet stand on the bottom of the tile
}

function drawNun(now) {
  // Her head bobs while she sobs. Not a sound.
  const sob = Math.floor(now / 300) % 2;
  const x = NUN_POS.x * T, y = nunTop();
  rect(ctx, x + 1, y + NUN.length - 1, 14, 2, "rgba(0,0,0,0.35)");
  sprite(ctx, NUN.slice(12), NUN_PAL, x, y + 12);
  sprite(ctx, NUN.slice(0, 12), NUN_PAL, x, y + sob);
}

function drawTears(now) {
  // Tears drip from her cheeks to the floor, drawn on top of the darkness so they glisten
  const x = NUN_POS.x * T, y = nunTop();
  const fall = 10; // pixels from cheek to floor
  for (const [cx, offset] of [[6, 0], [9, 5]]) {
    const d = (Math.floor(now / 90) + offset) % fall;
    rect(ctx, x + cx, y + 11 + d, 1, 1, "#bfe8ff");
  }
}

// A warm golden glow, added on top of the picture
function glow(x, y, r, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,170,60,${alpha})`);
  g.addColorStop(1, "rgba(255,170,60,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(n) {
  // Glowing eyes, drawn on top of the darkness
  const x = Math.round(n.x * T), y = Math.round(n.y * T);
  const color = n.kind === "skeleton" ? "#ff2a2a" : "#ff3355";
  const ey = n.kind === "skeleton" ? y + 1 : y + 6;
  rect(ctx, x + 6, ey, 1, 1, color);
  rect(ctx, x + 9, ey, 1, 1, color);
}

function draw(now) {
  ctx.drawImage(bg, 0, 0);

  // Candle flames
  const flick = Math.floor(now / 140) % 2;
  for (const l of lights) {
    if (l.ch !== "K") continue;
    const X = l.x * T, Y = l.y * T;
    rect(ctx, X + 7, Y + 2, 2, 2, flick ? "#ffd166" : "#ff9a3c");
    rect(ctx, X + 7 + flick, Y + 1, 1, 1, "#ffe9a8");
  }

  // Boo-ker floats in the foyer
  const [gx, gy] = stationPos[1];
  const bob = Math.round(Math.sin(now / 400) * 1.5);
  rect(ctx, gx * T + 4, gy * T + 14, 8, 2, "rgba(0,0,0,0.35)");
  sprite(ctx, GHOST, GHOST_PAL, gx * T, gy * T - 3 + bob);

  NPCS.forEach((n) => drawNpc(n, now));
  drawNun(now);

  // Bouncing arrow above the next challenge
  const target = nextLevel() || (escaped ? null : 7);
  if (target) {
    const [sx, sy] = stationPos[target];
    const ax = sx * T + 5, ay = sy * T - 8 + Math.round(Math.sin(now / 180) * 2);
    rect(ctx, ax, ay, 6, 2, "#ffd166");
    rect(ctx, ax + 1, ay + 2, 4, 1, "#ffd166");
    rect(ctx, ax + 2, ay + 3, 2, 1, "#ffd166");
  }

  // Baby Daisy
  const px = Math.round(player.px * T), py = Math.round(player.py * T);
  const walk = player.moving ? Math.floor(now / 110) % 2 : 0;
  rect(ctx, px + 4, py + 14, 8, 2, "rgba(0,0,0,0.4)");
  sprite(ctx, PLAYER, PLAYER_PAL, px, py - 2 - walk, player.flip);

  // Darkness with a flickering lantern around Daisy, and small glows around candles
  const d = dark.getContext("2d");
  d.globalCompositeOperation = "source-over";
  d.clearRect(0, 0, dark.width, dark.height);
  d.fillStyle = escaped ? "rgba(40,20,50,0.25)" : "rgba(4,2,10,0.8)";
  d.fillRect(0, 0, dark.width, dark.height);
  d.globalCompositeOperation = "destination-out";
  hole(d, px + 8, py + 6, 76 + Math.sin(now / 90) * 2 + Math.sin(now / 37));
  hole(d, gx * T + 8, gy * T + 6, 20);
  hole(d, NUN_POS.x * T + 8, nunTop() + 8, 16); // a faint glow, so you can just see her
  for (const l of lights) hole(d, l.x * T + 8, l.y * T + 4, 18 + Math.sin(now / 70 + l.x) * 1.5);
  if (target) hole(d, stationPos[target][0] * T + 8, stationPos[target][1] * T + 6, 22);
  ctx.drawImage(dark, 0, 0);

  // Golden glow: strongest around candles and pumpkins, softer around Daisy's lantern
  if (!escaped) {
    ctx.globalCompositeOperation = "lighter";
    glow(px + 8, py + 6, 80 + Math.sin(now / 90) * 2, 0.13);
    for (const l of lights) glow(l.x * T + 8, l.y * T + 3, 26 + Math.sin(now / 70 + l.x) * 2, 0.22);
    if (target) glow(stationPos[target][0] * T + 8, stationPos[target][1] * T + 6, 24, 0.12);
    ctx.globalCompositeOperation = "source-over";
  }

  NPCS.forEach(drawEyes);
  drawTears(now);
}

/* ---------- Movement ---------- */
const DIRS = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

function walkable(x, y) {
  const ch = tileAt(x, y);
  if (WALK.has(ch)) return true;
  if (DOORS.includes(ch)) return solved.has(Number(ch) - 1);
  if (ch === "g") return solved.has(7);
  return false;
}

let lastBump = 0;
function bump(x, y) {
  const now = performance.now();
  if (now - lastBump < 600) return;
  lastBump = now;
  sfx.bump();
  const ch = tileAt(x, y);
  if (DOORS.includes(ch) || ch === "g") toast(`Locked. ${WHERE[nextLevel()] || ""}`);
}

function tryMove(dx, dy) {
  if (dx) player.flip = dx < 0;
  const nx = player.x + dx, ny = player.y + dy;
  if (!walkable(nx, ny)) return bump(nx, ny);
  player.fx = player.x;
  player.fy = player.y;
  player.x = nx;
  player.y = ny;
  player.t = 0;
  player.moving = true;
}

let nunNext = 0;
function updateNun(now) {
  // She only cries softly when Daisy is close by
  const close = Math.hypot(NUN_POS.x - player.px, NUN_POS.y - player.py) < 3.5;
  if (started && !dialogLevel && close && now > nunNext) {
    sfx.sob();
    nunNext = now + 3500 + Math.random() * 2500;
  }
}

function updateNpcs(dt, now) {
  for (const n of NPCS) {
    if (n.kind === "skeleton") {
      n.x += (n.dir * n.speed * dt) / 1000;
      if (n.x > n.max) { n.x = n.max; n.dir = -1; }
      if (n.x < n.min) { n.x = n.min; n.dir = 1; }
    } else {
      n.y = n.top + ((1 - Math.cos((now / 1000) * n.speed)) / 2) * n.range;
    }

    // Moan a slogan when Daisy walks past
    const close = Math.hypot(n.x - player.px, n.y - player.py) < 2.5;
    if (started && !dialogLevel && close && now > n.next && now > talkNext) {
      const [shown, spoken] = pick(PHRASES);
      bubble(shown, n.x, n.y, "monster");
      // Both male voices: skeletons very deep, spiders a little higher
      if (n.kind === "skeleton") say(spoken, 0.1, 0.55, 0.45, "male");
      else say(spoken, 0.6, 0.5, 0.45, "male");
      n.next = now + 45000; // each monster waits 45 s before moaning again
      talkNext = now + 20000; // and at least 20 s between any two monsters
    }
  }
}

function update(dt, now) {
  if (player.moving) {
    player.t += dt / STEP_MS;
    if (player.t >= 1) {
      player.moving = false;
      player.px = player.x;
      player.py = player.y;
      sfx.step();
      const here = tileAt(player.x, player.y);
      if (DOORS.includes(here) || here === "O") sfx.door(0.5);
      if (here === "g" && !escaped) escape();
    } else {
      player.px = player.fx + (player.x - player.fx) * player.t;
      player.py = player.fy + (player.y - player.fy) * player.t;
    }
  }
  if (!player.moving && !dialogLevel && started && held.length) {
    const [dx, dy] = DIRS[held[held.length - 1]];
    tryMove(dx, dy);
  }
  updateNpcs(dt, now);
  updateNun(now);
}

function interact() {
  for (const [dx, dy] of [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const i = STATIONS.indexOf(tileAt(player.x + dx, player.y + dy));
    if (i >= 0) return openStation(i + 1);
  }
  toast("Nothing here... Walk up to the glowing arrow and press E.");
}

function openStation(id) {
  if (id > 1 && !solved.has(id - 1)) {
    sfx.bump();
    return toast(`A cold force pushes you back. First: ${WHERE[nextLevel()]}`);
  }
  openDialog(id);
}

let last = performance.now();
function loop(now) {
  update(Math.min(now - last, 50), now);
  last = now;
  draw(now);
  requestAnimationFrame(loop);
}

/* ---------- HUD, toasts and jumpscares ---------- */
let toastTimer;
function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}

function updateHud() {
  $("#hud-progress").textContent = `ROOMS ${solved.size}/7`;
  $("#snd").textContent = soundOn ? "SOUND ON" : "SOUND OFF";
  $("#scr").textContent = scaresOn ? "SCARES ON" : "SCARES OFF";
  const next = nextLevel();
  $("#objective").textContent = escaped ? "You escaped the manor!"
    : next ? `Next: ${WHERE[next]}` : "The gate is open. Walk through it to escape!";
}

SCARE_PHOTOS.forEach((src) => (new Image().src = `/static/${src}`)); // preload

// A shuffled deck of scares: every photo (and the pixel ghost) shows up once before any repeats
let scareDeck = [];
function nextScare() {
  if (!scareDeck.length) {
    scareDeck = [...SCARE_PHOTOS, "ghost"];
    for (let i = scareDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scareDeck[i], scareDeck[j]] = [scareDeck[j], scareDeck[i]];
    }
  }
  return scareDeck.pop();
}

function jumpscare() {
  if (!scaresOn) return;
  const card = nextScare();
  const photo = card !== "ghost";
  $("#scare-canvas").classList.toggle("hidden", photo);
  $("#scare-photo").classList.toggle("hidden", !photo);
  if (photo) $("#scare-photo").src = `/static/${card}`;
  const el = $("#scare");
  el.className = "";
  void el.offsetWidth; // restart the animation
  el.className = "show";
  sfx.scare();
  setTimeout(() => (el.className = "hidden"), 1300);
}

function scheduleRandomScare() {
  setTimeout(() => {
    if (started && !escaped && !document.hidden) jumpscare();
    scheduleRandomScare();
  }, 45000 + Math.random() * 75000);
}

function escape() {
  escaped = true;
  sfx.win();
  updateHud();
  daisySays("Yaaay! We did it!");
  setTimeout(() => $("#victory").classList.remove("hidden"), 500);
}

/* ---------- Challenge dialog ---------- */
const fmt = (text) => text.replace(/`([^`]+)`/g, "<code>$1</code>");
let typer = null;

function openDialog(id) {
  dialogLevel = id;
  held.length = 0;
  $("#dialog").classList.remove("hidden");
  sfx.creak();
  renderDialog(!solved.has(id));
  if (!solved.has(id) && Math.random() < 0.12) setTimeout(jumpscare, 2500 + Math.random() * 3000);
}

function closeDialog() {
  clearInterval(typer);
  dialogLevel = null;
  $("#dialog").classList.add("hidden");
  canvas.focus();
}

function renderDialog(typewriter) {
  const l = levels[dialogLevel - 1];
  const done = solved.has(l.id);
  const shown = hintsShown[l.id] || 0;
  $("#dlg-title").textContent = `ROOM ${l.id}: ${l.name.toUpperCase()}`;
  $("#dlg-body").innerHTML = `
    <p class="story" id="story"></p>
    <div class="mission">${fmt(l.mission)}</div>
    <div class="help">Stuck? Type <code>${l.help}</code> for info, or ask the beautiful Queen Judit 👑</div>
    ${l.hints.slice(0, shown).map((h, i) => `<div class="hint">Hint ${i + 1}: ${fmt(h)}</div>`).join("")}
    ${done
      ? `<div class="learned"><b>Boo-ker says:</b> ${fmt(l.learned)}</div>`
      : `<form id="answer-form">
           <input id="answer" placeholder="Type your answer..." autocomplete="off">
           <button class="btn" type="submit">UNLOCK</button>
           ${shown < l.hints.length ? `<button id="hint" class="btn ghosty" type="button">HINT ${shown}/${l.hints.length}</button>` : ""}
         </form>
         <div id="feedback" class="feedback"></div>`}
  `;
  typeStory(l.story, typewriter);
  $("#answer")?.focus();
}

function typeStory(text, animate) {
  clearInterval(typer);
  const el = $("#story");
  if (!animate) {
    el.innerHTML = fmt(text);
    return;
  }
  let i = 0;
  typer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i % 6 === 0) sfx.blip();
    if (i >= text.length) {
      clearInterval(typer);
      el.innerHTML = fmt(text);
    }
  }, 22);
}

async function submit(e) {
  e.preventDefault();
  const l = levels[dialogLevel - 1];
  const answer = $("#answer").value;
  if (!answer.trim()) return;
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: l.id, answer }),
  }).then((r) => r.json());

  if (res.correct) {
    solved.add(l.id);
    saveSolved();
    renderBackground();
    updateHud();
    sfx.win();
    // Rooms 1, 3, 4, 5 unlock a door and room 7 opens the gate
    if ([1, 3, 4, 5, 7].includes(l.id)) setTimeout(() => sfx.door(), 500);
    renderDialog(false);
    toast(UNLOCKED[l.id]);
    setTimeout(() => daisySays(pick(["Yaaay!", "Wheee!", "Hee hee!"])), 700);
    if (l.id < 7 && Math.random() < 0.5) setTimeout(jumpscare, 2200);
  } else {
    sfx.nope();
    const box = $("#dialog");
    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");
    $("#feedback").textContent = pick([
      "The door doesn't budge...",
      "A cold breath on your neck. Wrong answer.",
      "Something giggles in the dark. Try again.",
      "Nope. The ghost shakes its head.",
    ]);
    if (Math.random() < 0.25) setTimeout(jumpscare, 400);
  }
}

/* ---------- Input ---------- */
document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (e.target.tagName === "INPUT") {
    if (key === "Escape") closeDialog();
    return;
  }
  if (!started) return;
  if (key === "Escape") return closeDialog();
  if (dialogLevel) return;
  if (DIRS[key]) {
    e.preventDefault();
    if (!held.includes(key)) held.push(key);
  } else if (key === "e" || key === " " || key === "Enter") {
    e.preventDefault();
    interact();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const i = held.indexOf(key);
  if (i >= 0) held.splice(i, 1);
});

window.addEventListener("blur", () => (held.length = 0));

document.addEventListener("submit", (e) => {
  if (e.target.id === "answer-form") submit(e);
});

document.addEventListener("click", (e) => {
  if (e.target.id === "hint") {
    const id = levels[dialogLevel - 1].id;
    hintsShown[id] = (hintsShown[id] || 0) + 1;
    sfx.creak();
    return renderDialog(false);
  }
  if (e.target.tagName === "CODE") {
    navigator.clipboard?.writeText(e.target.textContent);
    e.target.classList.add("copied");
    setTimeout(() => e.target.classList.remove("copied"), 600);
  }
});

$("#dlg-close").addEventListener("click", closeDialog);

$("#enter").addEventListener("click", () => {
  started = true;
  $("#intro").classList.add("hidden");
  audio().resume();
  updateMusic();
  sfx.creak();
  scheduleRandomScare();
  scheduleDaisy();
  toast(solved.size ? "Welcome back... the ghosts remember you." : "The gate slams shut behind you. Find a way into the manor...");
  setTimeout(() => daisySays("Hiii! I'm Daisy!"), 1500);
});

/* The SOUND and SCARES buttons don't switch anything off. They laugh at you instead.
   Drop laugh-cat.mp3 / laugh-people.mp3 into app/static to use real recordings;
   without them a laugh is generated. */
let trollTimer;
function troll(cat) {
  audio().resume(); // the click may come before "Enter if you dare"
  $("#troll-img").src = `/static/troll-${cat ? "cat" : "people"}.png`;
  $("#troll").classList.remove("hidden");
  const file = new Audio(`/static/laugh-${cat ? "cat" : "people"}.mp3`);
  file.play().catch(() => synthLaugh(cat));
  if (canSpeak) speechSynthesis.cancel();
  if (cat) say("Hehehehe! Meow!", 2, 1.3, 1, "female");
  else say("Ha ha ha ha! Nice try!", 1.1, 1.3, 1, "male");
  clearTimeout(trollTimer);
  trollTimer = setTimeout(() => $("#troll").classList.add("hidden"), 2500);
}

// SOUND shows the laughing cat, SCARES shows the laughing people
for (const [id, cat] of [["#snd", true], ["#scr", false]]) {
  $(id).addEventListener("click", (e) => {
    e.target.blur();
    troll(cat);
  });
}

$("#rst").addEventListener("click", (e) => {
  e.target.blur();
  if (!confirm("Reset all progress? The ghosts will forget you.")) return;
  solved.clear();
  saveSolved();
  escaped = false;
  Object.assign(player, { x: START.x, y: START.y, px: START.x, py: START.y, moving: false });
  closeDialog();
  renderBackground();
  updateHud();
});

$("#close-victory").addEventListener("click", () => $("#victory").classList.add("hidden"));

/* ---------- Boot ---------- */
canvas.tabIndex = 0;
sprite($("#intro-ghost").getContext("2d"), GHOST, GHOST_PAL, 0, 0);
sprite($("#scare-canvas").getContext("2d"), GHOST, SCARY_PAL, 0, 0);
renderBackground();
updateHud();
requestAnimationFrame(loop);

fetch("/api/levels").then((r) => r.json()).then((data) => (levels = data));
