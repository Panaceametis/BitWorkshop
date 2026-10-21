# 🐳 Docker cheat sheet

| What | Command |
|------|---------|
| Download an image | `docker pull IMAGE` |
| List images | `docker images` |
| Run a container | `docker run IMAGE [COMMAND]` |
| ...in the background | `docker run -d IMAGE` |
| ...with a name | `docker run --name NAME IMAGE` |
| ...and delete it when it stops | `docker run --rm IMAGE` |
| ...with a port (host:container) | `docker run -p 8001:8000 IMAGE` |
| ...with an environment variable | `docker run -e KEY=value IMAGE` |
| List running containers | `docker ps` |
| List all containers | `docker ps -a` |
| Read a container's output | `docker logs NAME` |
| Stop / start / restart | `docker stop NAME` · `docker start NAME` · `docker restart NAME` |
| Open a shell inside | `docker exec -it NAME sh` (leave with `exit`) |
| Remove a container | `docker rm NAME` (add `-f` if it is running) |
| Build an image | `docker build -t NAME .` |
| Show an image's layers | `docker history NAME` |
| Clean up everything unused | `docker system prune` |

**Lifecycle:** `create` → `start` → `stop` → `start`/`restart` → `rm`
