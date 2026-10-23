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
Download the image (the blueprint):
```bash
docker pull ghcr.io/panaceametis/haunted-manor:latest
```
Start a container from it (the game):
```bash
docker run -d -p 8000:8000 --name manor ghcr.io/panaceametis/haunted-manor:latest
```
Open the **Ports** tab (next to Terminal), find port **8000** and click the 🌐 globe icon.
Turn your sound on, then follow the game. 👻

> Stuck? Every room has hints. The [cheat sheet](docs/cheatsheet.md) has all the commands you need.

---

### Room overview and answer key

Baby steps: every room teaches one or two basic commands, and the command is given in the mission.

| # | Room | Teaches | Command(s) | Answer |
|---|------|---------|------------|--------|
| 1 | Foyer | see running containers | `docker ps` | `manor` |
| 2 | Library | start a new container | `docker run -d --name ghost IMG manor library` + `docker ps` | `Up` |
| 3 | Crypt | stop, and see all containers | `docker stop ghost` + `docker ps` + `docker ps -a` | `Exited` |
| 4 | Cellar | start again, read the output | `docker start ghost` + `docker logs ghost` | `BONES-8864` or `CANDLE-1305` |
| 5 | Attic | find a command with `--help`, delete a container | `docker --help` → `docker stop ghost` + `docker rm ghost` | `docker rm ghost` (or `docker rm`) |
| 6 | Dungeon | auto-cleanup with `--rm` | `docker run --rm IMG manor foyer` + `docker ps -a` | `WHISPER-7421` |
| 7 | Exit | images vs containers | `docker images` | `latest` |

### Bonus challenges (for fast trainees)
The image also supports some harder tasks that aren't in the game:
- `docker exec -it manor sh`, then `cat /cellar/.whisper`: go inside a running container.
- `docker run -d -p 8001:8000 -e GHOST_NAME=Casper --name attic IMG`, then open `/attic` on
  port 8001: ports and environment variables.
- Complete `exercises/dungeon/Dockerfile` (solution in `SOLUTION.Dockerfile`), then
  `docker build -t dungeon .` and `docker run --rm dungeon`: build your own image.

### Running it locally (without the registry)
```bash
docker build -t haunted-manor .
docker run -d -p 8000:8000 --name manor haunted-manor
```

### Notes
- Progress is saved in the browser (localStorage), so refreshing is fine. Use **↺ Reset** to start over.
- Jumpscares happen at random, on some wrong answers and after some solved rooms. They are single
  flashes, not strobes. Trainees can switch off sound and scares in the header.
