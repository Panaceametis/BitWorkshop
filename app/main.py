import os
import socket
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .levels import CODES, check_answer, public_levels

STATIC = Path(__file__).parent / "static"

app = FastAPI(title="Haunted Container Manor")


class Attempt(BaseModel):
    level: int
    answer: str


@app.get("/api/levels")
def levels():
    return public_levels()


@app.post("/api/check")
def check(attempt: Attempt):
    return {"correct": check_answer(attempt.level, attempt.answer)}


@app.get("/attic")
def attic():
    """Level 5: only shows the code if the container was started with GHOST_NAME."""
    ghost = os.getenv("GHOST_NAME")
    info = {"container_id": socket.gethostname(), "ghost": ghost}
    if not ghost:
        return {**info, "message": "Nobody lives in this attic. Does this container know a ghost's name?"}
    return {**info, "message": f"{ghost} drifts out of the shadows and whispers a code...", "code": CODES["attic"]}


@app.get("/health")
def health():
    return {"ok": True}


app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")
