"""Room definitions and secret codes for the Haunted Container Manor.

Every code is printed by a real Docker task (see app/manor.py, /attic in main.py
and exercises/dungeon), so a trainee can only get it by actually doing the work.
"""
import os
import re

IMAGE = os.getenv("IMAGE_NAME", "haunted-manor")

CODES = {
    "foyer": "WHISPER-7421",
    "library": "CANDLE-1305",
    "crypt": "BONES-8864",
    "cellar": "COBWEB-2290",
    "attic": "MOONLIT-5173",
    "dungeon": "CHAINS-6048",
}

LEVELS = [
    {
        "id": 1, "name": "The Foyer", "emoji": "🚪",
        "story": "The front door slams shut behind you. A tiny ghost called Boo-ker floats over: "
                 "\"You're already standing inside a container, you know. Can you summon me again, "
                 "from the outside?\"",
        "mission": "Run a throwaway container from the manor image that executes the command `manor foyer`. "
                   "It should delete itself when it finishes. Type the code it prints.",
        "hints": [
            "`docker run IMAGE COMMAND` runs COMMAND instead of the image's default process. One flag removes the container when it exits.",
            "`docker run --rm {IMAGE} manor foyer`",
        ],
        "answers": [CODES["foyer"]],
        "learned": "An image is the blueprint, `docker run` creates a container from it, and `--rm` cleans up afterwards.",
    },
    {
        "id": 2, "name": "The Library", "emoji": "📚",
        "story": "Dusty books line the walls. Something is writing in a diary you can't see...",
        "mission": "Start `manor library` as a container in the background, named `library`. "
                   "The ghost writes its code in its diary, which is the container's output.",
        "hints": [
            "`-d` detaches the container, `--name` names it. Output of a background container can be read with a `logs` command.",
            "`docker run -d --name library {IMAGE} manor library`, then `docker logs library`",
        ],
        "answers": [CODES["library"]],
        "learned": "Detached containers keep running without your terminal. Their stdout is kept as logs, and names beat random IDs.",
    },
    {
        "id": 3, "name": "The Crypt", "emoji": "⚰️",
        "story": "The library ghost has a long memory. Maybe it remembers you, if you wake it up again...",
        "mission": "Restart the `library` container and read its logs again. A new code appears, "
                   "proof that something survived the restart.",
        "hints": [
            "One command stops and starts a container in one go. `docker ps` shows what is running, `docker ps -a` shows everything.",
            "`docker restart library`, then `docker logs library`",
        ],
        "answers": [CODES["crypt"]],
        "learned": "Stop/start/restart keep the container's writable layer, so files survive. `docker rm` would wipe them. "
                   "Try it later!",
    },
    {
        "id": 4, "name": "The Cellar", "emoji": "🕯️",
        "story": "A trapdoor leads down into the library container's own cellar. Ghosts hide things down there.",
        "mission": "Open a shell inside the running `library` container and find the hidden file in `/cellar`. "
                   "Read it and type the code.",
        "hints": [
            "`docker exec` runs a command inside a running container. `-it` makes it interactive and `sh` is your shell. "
            "Hidden files start with a dot.",
            "`docker exec -it library sh`, then `ls -a /cellar` and `cat /cellar/.whisper`. Type `exit` to leave.",
        ],
        "answers": [CODES["cellar"]],
        "learned": "Every container has its own filesystem and process space. Inside, run `ps` and notice how few processes there are.",
    },
    {
        "id": 5, "name": "The Attic", "emoji": "🌙",
        "story": "Up the creaky stairs, the attic ghost only haunts containers that know its name. "
                 "It also needs a window to the outside world.",
        "mission": "Start a second manor in the background on host port 8001, with the environment variable "
                   "`GHOST_NAME` set to any name. Then open `/attic` on that port (Ports tab in Codespaces) "
                   "and compare it with `/attic` on port 8000.",
        "hints": [
            "`-p HOST:CONTAINER` maps a port (the app listens on 8000 inside), and `-e NAME=value` sets an environment variable. "
            "Container names must be unique!",
            "`docker run -d -p 8001:8000 -e GHOST_NAME=Casper --name attic {IMAGE}`",
        ],
        "answers": [CODES["attic"]],
        "learned": "One image can run as many containers as you like, each configured differently through env vars and ports. "
                   "Like instances of a class.",
    },
    {
        "id": 6, "name": "The Dungeon", "emoji": "⛓️",
        "story": "Deep below, the dungeon door has no lock. You have to build one yourself.",
        "mission": "In `exercises/dungeon/` there is an unfinished Dockerfile. Complete the TODOs, build an image "
                   "called `dungeon`, run it and read the code. It only appears if the program runs from `/dungeon`.",
        "hints": [
            "You need three instructions: WORKDIR, COPY and CMD. Each line of a Dockerfile becomes an image layer.",
            "`cd exercises/dungeon`, edit the Dockerfile, then `docker build -t dungeon .` and `docker run --rm dungeon`",
        ],
        "answers": [CODES["dungeon"]],
        "learned": "A Dockerfile is the recipe, `docker build` bakes it into an image, and then anyone can run it anywhere.",
    },
    {
        "id": 7, "name": "The Exit", "emoji": "🌅",
        "story": "Dawn breaks and the exit is in sight. But a good guest never leaves a mess behind.",
        "mission": "Remove the `library` and `attic` containers and check with `docker ps -a`. "
                   "Then answer: which two words remove a container? (`docker` + ...)",
        "hints": [
            "Running containers must be stopped first, or removed with a force flag.",
            "`docker rm -f library attic`. The answer is `docker rm`.",
        ],
        "answers": ["docker rm", "docker container rm"],
        "learned": "You made it out alive, and you now know images, containers, lifecycle, exec, ports, env vars and Dockerfiles.",
    },
]


def public_levels():
    """Levels as sent to the browser: no answers, {IMAGE} filled in."""
    out = []
    for lvl in LEVELS:
        item = {k: v for k, v in lvl.items() if k != "answers"}
        item["hints"] = [h.replace("{IMAGE}", IMAGE) for h in lvl["hints"]]
        out.append(item)
    return out


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower().strip("`"))


def check_answer(level_id: int, answer: str) -> bool:
    lvl = next((l for l in LEVELS if l["id"] == level_id), None)
    return bool(lvl) and _norm(answer) in {_norm(a) for a in lvl["answers"]}
