# 🏚️ Haunted Container Manor: a Docker workshop game

Escape a haunted house by solving seven Docker challenges. Each room hides a secret code that you
can only get by running the right Docker commands.

---

## 👩‍🎓 For trainees

### 1. Open your Codespace
Click **Code → Codespaces → Create codespace on main**. Wait about 1 minute until a terminal appears.
Docker is already installed in it, so there is nothing to install on your laptop.

Check that it works:
```bash
docker version
docker run hello-world
```

### 2. Enter the manor
```bash
docker run -d -p 8000:8000 --name manor ghcr.io/panaceametis/haunted-manor:latest
```
Open the **Ports** tab (next to Terminal), find port **8000** and click the 🌐 globe icon.
Turn your sound on, then follow the game. 👻

> Stuck? Every room has hints. The [cheat sheet](docs/cheatsheet.md) has all the commands you need.

---

Create a GitHub account before the workshop. Codespaces is free for personal accounts.

### Room overview and answer key

| # | Room | Concept | Command(s) | Code |
|---|------|---------|------------|------|
| 1 | Foyer | images vs containers, `run`, `--rm` | `docker run --rm IMG manor foyer` | `WHISPER-7421` |
| 2 | Library | `-d`, `--name`, `logs` | `docker run -d --name library IMG manor library` + `docker logs library` | `CANDLE-1305` |
| 3 | Crypt | lifecycle, writable layer | `docker restart library` + `docker logs library` | `BONES-8864` |
| 4 | Cellar | `exec`, container filesystem | `docker exec -it library sh` → `cat /cellar/.whisper` | `COBWEB-2290` |
| 5 | Attic | ports, env vars, multiple instances | `docker run -d -p 8001:8000 -e GHOST_NAME=Casper --name attic IMG` → `/attic` | `MOONLIT-5173` |
| 6 | Dungeon | Dockerfile, `build` | complete `exercises/dungeon/Dockerfile`, `docker build -t dungeon .`, `docker run --rm dungeon` | `CHAINS-6048` |
| 7 | Exit | cleanup, `rm` | `docker rm -f library attic` | answer `docker rm` |

The solution for room 6 is in `exercises/dungeon/SOLUTION.Dockerfile`.

### Discussion moments
- **After room 3:** have someone `docker rm -f library`, run it again and look at the logs. The
  boot counter is back to 1. Why? (The writable layer belongs to the container, not the image.)
- **After room 4:** run `ps` inside the container. Why are there so few processes? (Process isolation.)
- **After room 5:** two containers from one image, configured differently. This leads straight
  into Kubernetes: "now imagine 50 of these".
- **After room 6:** `docker history dungeon` shows one layer per Dockerfile line.

### Running it locally (without the registry)
```bash
docker build -t haunted-manor .
docker run -d -p 8000:8000 --name manor haunted-manor
```

### Notes
- Progress is saved in the browser (localStorage), so refreshing is fine. Use **↺ Reset** to start over.
- Jumpscares happen at random, on some wrong answers and after some solved rooms. They are single
  flashes, not strobes. Trainees can switch off sound and scares in the header.
