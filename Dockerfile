FROM python:3.12-slim

# The registry name of this image, shown to trainees in the game's hints.
ARG IMAGE_NAME=haunted-manor
ENV IMAGE_NAME=${IMAGE_NAME} PYTHONUNBUFFERED=1

WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY cellar /cellar

# `manor <room>` is a small CLI used by some levels
RUN printf '#!/bin/sh\nexec python -m app.manor "$@"\n' > /usr/local/bin/manor \
    && chmod +x /usr/local/bin/manor

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
