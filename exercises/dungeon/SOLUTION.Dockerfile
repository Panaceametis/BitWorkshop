FROM python:3.12-slim

WORKDIR /dungeon

COPY dungeon.py .

CMD ["python", "dungeon.py"]
