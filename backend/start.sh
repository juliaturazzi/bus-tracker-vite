#!/bin/bash

gunicorn app:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 25 &
GUNICORN_PID=$!

python check_db.py &
CHECK_DB_PID=$!

wait $GUNICORN_PID $CHECK_DB_PID