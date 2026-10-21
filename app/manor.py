"""The `manor` command baked into the image: python -m app.manor <room>."""
import signal
import sys
import time
from pathlib import Path

from .levels import CODES

GHOST = r"""
     .-.
    (o o)   boooo!
    | O |
    |   |
    '~~~'
"""

STATE = Path("/var/lib/manor/boots")


def foyer():
    print(GHOST)
    print("The door creaks open...")
    print(f"Your code: {CODES['foyer']}", flush=True)


def library():
    # Python as PID 1 ignores SIGTERM by default; handle it so `docker stop` is instant.
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))

    STATE.parent.mkdir(parents=True, exist_ok=True)
    boots = int(STATE.read_text()) + 1 if STATE.exists() else 1
    STATE.write_text(str(boots))

    print(f"[library] This is boot #{boots}.")
    if boots == 1:
        print(f"[library] A book falls open to a page that reads: {CODES['library']}")
    else:
        print(f"[library] I remember you! I wrote something down last time, and it is still here. "
              f"Code: {CODES['crypt']}")
    print("[library] ...creak...", flush=True)
    # Keep running quietly. Printing more lines here would bury the codes in the logs.
    while True:
        time.sleep(3600)


ROOMS = {"foyer": foyer, "library": library}

if __name__ == "__main__":
    room = sys.argv[1] if len(sys.argv) > 1 else ""
    if room not in ROOMS:
        print(f"Usage: manor <{'|'.join(ROOMS)}>")
        sys.exit(1)
    ROOMS[room]()
