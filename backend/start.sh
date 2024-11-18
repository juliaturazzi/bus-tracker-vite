#!/bin/bash

# Start the FastAPI app using uvicorn in the background
uvicorn app:app --host 0.0.0.0 --port 8000 &

# Capture the PID of the uvicorn process
UVICORN_PID=$!

# Start the check_db script
python check_db.py &

# Capture the PID of the check_db process
CHECK_DB_PID=$!

# Wait for both processes to complete
wait $UVICORN_PID $CHECK_DB_PID
