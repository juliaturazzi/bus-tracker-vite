#!/bin/bash

uvicorn app:app --host 0.0.0.0 --port 8000 &

UVICORN_PID=$!

python check_db.py &

CHECK_DB_PID=$!

wait $UVICORN_PID $CHECK_DB_PID
