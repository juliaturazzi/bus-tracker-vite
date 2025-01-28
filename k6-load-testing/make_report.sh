#!/bin/bash
# This is a script that runs a load test with different number of virtual users
# It generates a CSV report for each test run.
# It makes it easier to understand the breaking points of the system (instead of just using k6 stages).

# Function to handle termination
terminate_script() {
    echo "Script interrupted. Exiting..."
    exit 1
}

# Trap SIGINT (Ctrl+C) and call the terminate_script function
trap terminate_script SIGINT

# Initial number of virtual users
VUS=50

# Tag to identify the test csv output
TAG=local

# URL to test
# Sandbox URL
URL=http://localhost:8000

# Increment value
INCREMENT=50

# Maximum number of virtual users to test
MAX_VUS=1000

# Max duration of the test
MAX_DURATION=10m

# Loop through increments
while [ "$VUS" -le "$MAX_VUS" ]; do
    echo "Running test with $VUS virtual users..."

    export VUS
    docker compose -f ../docker-compose.yml \
        -f ../docker-compose.load-test.yml \
        run --rm k6 run \
        --out csv=/scripts/report/results_${TAG}_${VUS}.csv \
        /scripts/load_test.js \
        -e VUS=${VUS} \
        -e URL=${URL} \
        -e MAX_DURATION=${MAX_DURATION}

    # Increment VUS
    VUS=$((VUS + INCREMENT))
done

echo "All tests completed."
