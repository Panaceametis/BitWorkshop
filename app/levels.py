"""Room definitions for the Haunted Container Manor.

Baby steps: every room teaches one or two basic commands. The answer is always
something the trainee can only see by running the command (a name, a status, a code).
"""
import os
import re

IMAGE = os.getenv("IMAGE_NAME", "haunted-manor")

# Codes printed by the `manor` command (app/manor.py) and the /attic page (app/main.py)
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
        "story": "A tiny ghost floats over to you. \"Hi! I'm Boo-ker. Did you know you are inside a "
                 "container right now? This whole game is one!\"",
        "mission": "Let's find this game's container. In the terminal, type:<br>`docker ps`<br>"
                   "This shows all containers that are running right now. "
                   "Look at the NAMES column (all the way on the right). What is the game's container called?",
        "hints": [
            "`ps` stands for \"process status\". Each row is one running container.",
            "NAMES is the last column, all the way on the right. Make the terminal wider if the line is cut off.",
        ],
        "help": "docker ps --help",
        "answers": ["manor"],
        "learned": "`docker ps` shows the containers that are running. You will use it all the time!",
    },
    {
        "id": 2, "name": "The Library", "emoji": "📚",
        "story": "Dusty books everywhere. \"Let's make a friend for me,\" says Boo-ker. "
                 "\"Start a new ghost!\"",
        "mission": "Start a new container called `ghost`. Copy this into the terminal:<br>"
                   "`docker run -d --name ghost {IMAGE} manor library`<br>"
                   "Then type `docker ps` again. Find the ghost. What does its STATUS start with?",
        "hints": [
            "`docker run` = start a new container from an image. `-d` = keep it running in the background. "
            "`--name ghost` = call it ghost.",
            "Find the row where NAMES says ghost, then look in the STATUS column. Only type the first word.",
        ],
        "help": "docker run --help",
        "answers": ["up"],
        "prefix": True,
        "learned": "Yes! \"Up\" means the ghost is running. Let's take that command apart:"
                   "<ul>"
                   "<li>`docker` = Every command starts with this.</li>"
                   "<li>`run` = make a new container from an image and start it.</li>"
                   "<li>`-d` = \"detached\": run in the background.</li>"
                   "<li>`--name ghost` = call the container ghost. Without it, Docker picks a random "
                   "name like julian_is_stinky.</li>"
                   "<li>`{IMAGE}` = the image (the blueprint) to make the container from. "
                   "The part after the `:` is the version, called the tag.</li>"
                   "<li>`manor library` = what the container should do. Normally this image starts the "
                   "game website. Anything you type after the image name replaces that. Here we say: "
                   "don't start the website, run the little `manor` program in library mode instead "
                   "(the ghost that writes in its diary).</li>"
                   "</ul>"
                   "In `docker ps` you also see manor, the game itself. "
                   "Two containers made from the same image!",
    },
    {
        "id": 3, "name": "The Crypt", "emoji": "⚰️",
        "story": "The ghost is getting sleepy. \"Shhh... let it rest,\" whispers Boo-ker.",
        "mission": "Step 1: type `docker ps`. The ghost is still in the list, it is running.<br>"
                   "Step 2: stop the ghost with `docker stop ghost`<br>"
                   "Step 3: type `docker ps` again. The ghost is gone from the list!<br>"
                   "Step 4: type `docker ps -a` to see ALL containers. "
                   "What does the ghost's STATUS start with now?",
        "hints": [
            "`-a` means \"all\". `docker ps` only shows running containers, `docker ps -a` shows every container.",
            "Find the ghost's row in `docker ps -a` and look at STATUS. Only type the first word. "
            "Is it the same word as in the last room?",
        ],
        "help": "docker ps --help",
        "answers": ["exited"],
        "prefix": True,
        "learned": "`docker stop` stops a container, but does not delete it. It is just not running anymore."
                   "<ul>"
                   "<li>`docker ps` = only the running containers.</li>"
                   "<li>`docker ps -a` = ALL containers, running and stopped (`-a` = all).</li>"
                   "</ul>"
                   "A stopped container keeps its name and its files, so you can start it again later. "
                   "You'll do that in the next room!",
    },
    {
        "id": 4, "name": "The Cellar", "emoji": "🕯️",
        "story": "\"Wake up, sleepy ghost!\" Boo-ker giggles. \"It writes in its diary every time it wakes up.\"",
        "mission": "Start the ghost again:<br>`docker start ghost`<br>"
                   "Now read what it wrote (its logs):<br>`docker logs ghost`<br>"
                   "Type one of the codes you see.",
        "hints": [
            "`docker start` wakes up a stopped container. It is the same container as before, not a new one. "
            "`docker logs` shows everything a container wrote.",
            "Read every line of the logs carefully. A code is a word, a dash and four numbers.",
        ],
        "help": "docker logs --help",
        "answers": [CODES["crypt"], CODES["library"]],
        "learned": "`docker start` wakes up an old container. Did you see \"boot #2\"? "
                   "The ghost remembered you, because it is the same container.",
    },
    {
        "id": 5, "name": "The Attic", "emoji": "🌙",
        "story": "\"Time for the ghost to go home,\" says Boo-ker. \"Let's say goodbye.\"",
        "mission": "Delete the ghost for good. But which command deletes a container? "
                   "Find it yourself with `docker --help`.<br>"
                   "Careful: you can't delete a running container. Stop it first with `docker stop ghost`.<br>"
                   "When the ghost is gone from `docker ps -a`, type the command you used to delete it.",
        "hints": [
            "In `docker --help`, look for a command whose description says \"Remove one or more containers\".",
            "First `docker stop ghost`. Then the delete command with the name at the end: `docker ___ ghost`.",
        ],
        "help": "docker --help",
        "answers": ["docker rm", "docker rm ghost", "docker rm -f ghost", "docker rm --force ghost",
                    "docker container rm", "docker container rm ghost"],
        "learned": "`docker rm` deletes a container for good. Stop it first with `docker stop`, "
                   "or force it with `docker rm -f`.",
    },
    {
        "id": 6, "name": "The Dungeon", "emoji": "⛓️",
        "story": "\"Here's a trick,\" says Boo-ker. \"A ghost that cleans up after itself!\"",
        "mission": "Run this:<br>`docker run --rm {IMAGE} manor foyer`<br>"
                   "It shows a code and then stops. Check `docker ps -a`: the container is not there! "
                   "`--rm` deleted it automatically. Type the code.",
        "hints": [
            "`--rm` = remove the container as soon as it stops. Handy for quick jobs.",
            "Boo-ker appears in the output and tells you the code. A code is a word, a dash and four numbers.",
        ],
        "help": "docker run --help",
        "answers": [CODES["foyer"]],
        "learned": "With `--rm` you don't have to clean up yourself. Docker deletes the container when it stops.",
    },
    {
        "id": 7, "name": "The Exit", "emoji": "🌅",
        "story": "You can see the gate! \"One last thing,\" says Boo-ker. \"Every container comes from an "
                 "image, like a cake from a recipe.\"",
        "mission": "See all the images on this computer:<br>`docker images`<br>"
                   "Find the manor image. What does it say in the TAG column?",
        "hints": [
            "An image is the blueprint, a container is the running copy. One image can make many containers.",
            "TAG is the second column. It tells you which version of the image you have.",
        ],
        "help": "docker images --help",
        "answers": ["latest"],
        "learned": "You made it out alive! You now know `docker ps`, `ps -a`, `run`, `stop`, `start`, "
                   "`logs`, `rm`, `--rm` and `images`.",
    },
]


def public_levels():
    """Levels as sent to the browser: no answers, {IMAGE} filled in."""
    out = []
    for lvl in LEVELS:
        item = {k: v for k, v in lvl.items() if k not in ("answers", "prefix")}
        item["mission"] = lvl["mission"].replace("{IMAGE}", IMAGE)
        item["hints"] = [h.replace("{IMAGE}", IMAGE) for h in lvl["hints"]]
        item["learned"] = lvl["learned"].replace("{IMAGE}", IMAGE)
        out.append(item)
    return out


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower().strip("`\"'"))


def check_answer(level_id: int, answer: str) -> bool:
    lvl = next((l for l in LEVELS if l["id"] == level_id), None)
    if not lvl:
        return False
    given = _norm(answer)
    accepted = [_norm(a) for a in lvl["answers"]]
    if lvl.get("prefix"):
        # e.g. "Up 5 seconds" or "Exited (0) 3 seconds ago" are fine too
        return any(given.split(" ")[0] == a for a in accepted)
    return given in accepted
