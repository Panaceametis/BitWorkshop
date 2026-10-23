# 🏚️ Haunted Container Manor: answer sheet

## Start (or restart) the game

```bash
docker rm -f manor
docker pull ghcr.io/YOURNAME/haunted-manor:latest
docker run -d -p 8000:8000 --name manor ghcr.io/YOURNAME/haunted-manor:latest
```

- **Line 1** removes an old game container. "No such container" is fine.
- **Line 2** downloads the newest version of the image (the blueprint).
- **Line 3** starts a new game container from that image.
- Replace `YOURNAME` with your GitHub username in lowercase.
- Then open the **Ports** tab, click 🌐 next to port **8000**, and press **Ctrl+Shift+R** in the game tab.
- After uploading new files to GitHub: wait for the green ✅ in **Actions** before running these lines.

## Answers

`IMAGE` = `ghcr.io/YOURNAME/haunted-manor:latest`

| # | Room | Commands to run | Answer |
|---|------|-----------------|--------|
| 1 | Foyer | `docker ps` | `manor` |
| 2 | Library | `docker run -d --name ghost IMAGE manor library`, then `docker ps` | `Up` |
| 3 | Crypt | `docker ps`, `docker stop ghost`, `docker ps`, `docker ps -a` | `Exited` |
| 4 | Cellar | `docker start ghost`, then `docker logs ghost` | `BONES-8864` or `CANDLE-1305` |
| 5 | Attic | `docker --help` (to find the command), `docker stop ghost`, `docker rm ghost`, `docker ps -a` | `docker rm ghost` (or `docker rm`) |
| 6 | Dungeon | `docker run --rm IMAGE manor foyer`, then `docker ps -a` | `WHISPER-7421` |
| 7 | Exit | `docker images` | `latest` |

### Also accepted
- Capital letters don't matter in any room.
- Rooms 2 and 3: the full status text, like "Up 10 seconds" or "Exited (0) 5 seconds ago".
- Room 5: `docker rm -f ghost`, `docker rm --force ghost` and `docker container rm ghost`.

### Watch out for
- **Room 1:** the answer is only `manor` if the game was started with `--name manor`. Otherwise
  Docker picked a random name: type the name shown in the NAMES column.
- **Room 4:** a trainee who deleted and recreated the ghost only sees boot #1 and `CANDLE-1305`.
  That still counts.
- **Room 5:** `docker rm ghost` fails while the ghost is running (it runs again after room 4).
  That error is part of the lesson: stop first, then remove.
- **Room 7:** the answer is `latest` because everyone pulls the image with the `:latest` tag.

## Quick fixes

| Problem | Fix |
|---|---|
| "pull access denied for manor" | `--name` is missing or the command has a typo. Copy and paste it again. |
| "name already in use" | `docker rm -f manor` (or `ghost`), then run the command again. |
| Game tab stopped working | The game container was stopped. Run the two start commands above and refresh the tab. |
| Codespace stuck in "recovery mode" | Delete it and create a new one. |
