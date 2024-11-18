import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load email credentials
load_dotenv()
EMAIL_SENDER_ALIAS = os.getenv("EMAIL_SENDER_ALIAS")
EMAIL_SENDER_PASSWORD = os.getenv("EMAIL_SENDER_PASSWORD")

# Email server settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587


# Send email with bus tracker updates
def send_email(receiver_email, linha, ponto, onibus_data):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER_ALIAS
    msg["To"] = receiver_email
    msg["Subject"] = "Bus Tracker Updates"

    # Email body
    body = f"LINE: {linha}\nSTOP: {ponto}\n\n\n"
    for onibus, minutos in onibus_data.items():
        body += f"BUS: The bus {onibus} is {minutos} minutes away from the selected stop\n\n"

    msg.attach(MIMEText(body, "plain"))

    try:
        # Connect to the email server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER_ALIAS, EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        # Log the error and raise it for the test to catch
        print(f"Error sending email: {e}")
        raise
