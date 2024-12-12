#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# FastAPI Server Configuration
FASTAPI_URL="${FASTAPI_URL:-http://localhost:8000}"  # Default to localhost:8000

REGISTER_ENDPOINT="/register/"
VERIFY_ENDPOINT="/verify/"
REQUEST_PASSWORD_RESET_ENDPOINT="/request-password-reset/"
RESET_PASSWORD_ENDPOINT="/reset-password/"

# User Details
USER_EMAIL="${USER_EMAIL:-testuser@example.com}"
USER_USERNAME="${USER_USERNAME:-testuser}"
USER_PASSWORD="${USER_PASSWORD:-TestPassword123!}"
NEW_PASSWORD="${NEW_PASSWORD:-NewSecurePassword123!}"

# MySQL Database Configuration
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-bustracker}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-bustracker123}"
MYSQL_DATABASE="${MYSQL_DATABASE:-bustracker}"

###############################
# Function Definitions
###############################

# Function to register a new user
register_user() {
    echo "Registering new user: $USER_EMAIL..."

    RESPONSE=$(curl -s -X POST "$FASTAPI_URL$REGISTER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$USER_EMAIL\", \"username\": \"$USER_USERNAME\", \"password\": \"$USER_PASSWORD\"}")

    echo "Response from registration:"
    echo "$RESPONSE"
    echo ""

    # Check for success message
    if echo "$RESPONSE" | grep -q '"status": *"success"'; then
        echo "User registration successful."
    else
        echo "User registration failed. Exiting."
        exit 1
    fi
}

# Function to verify user's email
verify_user_email() {
    echo "Verifying user's email: $USER_EMAIL..."

    # Retrieve verification token from the database
    VERIFICATION_TOKEN=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -sse \
        "SELECT verification_token FROM users WHERE email='$USER_EMAIL';")

    if [ -z "$VERIFICATION_TOKEN" ]; then
        echo "Failed to retrieve verification token. Exiting."
        exit 1
    fi

    echo "Verification token retrieved: $VERIFICATION_TOKEN"

    # Send GET request to verify the email
    RESPONSE=$(curl -s -X GET "$FASTAPI_URL$VERIFY_ENDPOINT?token=$VERIFICATION_TOKEN")

    echo "Response from email verification:"
    echo "$RESPONSE"
    echo ""

    # Check for success message
    if echo "$RESPONSE" | grep -q '"status": *"success"'; then
        echo "Email verification successful."
    else
        echo "Email verification failed. Exiting."
        exit 1
    fi
}

# Function to request a password reset
request_password_reset() {
    echo "Requesting password reset for $USER_EMAIL..."

    RESPONSE=$(curl -s -X POST "$FASTAPI_URL$REQUEST_PASSWORD_RESET_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$USER_EMAIL\"}")

    echo "Response from password reset request:"
    echo "$RESPONSE"
    echo ""

    # Check for success message
    if echo "$RESPONSE" | grep -q '"status": *"success"'; then
        echo "Password reset request successful."
    else
        echo "Password reset request failed. Exiting."
        exit 1
    fi
}

# Function to reset the password using the reset token
reset_password() {
    echo "Resetting password for $USER_EMAIL..."

    # Retrieve reset token from the database
    RESET_TOKEN=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -sse \
        "SELECT reset_token FROM users WHERE email='$USER_EMAIL';")

    if [ -z "$RESET_TOKEN" ]; then
        echo "Failed to retrieve reset token. Exiting."
        exit 1
    fi

    echo "Reset token retrieved: $RESET_TOKEN"

    # Send POST request to reset the password
    RESPONSE=$(curl -s -X POST "$FASTAPI_URL$RESET_PASSWORD_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"token\": \"$RESET_TOKEN\", \"new_password\": \"$NEW_PASSWORD\"}")

    echo "Response from password reset:"
    echo "$RESPONSE"
    echo ""

    # Check for success message
    if echo "$RESPONSE" | grep -q '"status": *"success"'; then
        echo "Password reset successful."
    else
        echo "Password reset failed. Exiting."
        exit 1
    fi
}

# Function to clean up (optional)
cleanup() {
    echo "Cleaning up: Deleting test user $USER_EMAIL from the database..."

    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e \
        "DELETE FROM users WHERE email='$USER_EMAIL';"

    echo "Cleanup completed."
}

###############################
# Main Execution Flow
###############################

# Optional: Wait for a few seconds to ensure all processes are complete
sleep 2

# Step 3: Request a password reset
request_password_reset

# Step 4: Reset the password
reset_password

# Optional: Cleanup test data
# Uncomment the following line if you want to delete the test user after testing
# cleanup

echo "Full user flow test completed successfully."

