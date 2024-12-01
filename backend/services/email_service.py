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

# Function to send HTML email
def send_email(receiver_email, linha, ponto, onibus_data):
    # Define the HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bus Tracker Updates</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #FFA844;
                color: #ffffff;
                text-align: center;
                padding: 30px 20px;
            }}
            .header img {{
                max-width: 50px;
                margin-bottom: 10px;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }}
            .content {{
                padding: 20px;
                color: #333333;
                line-height: 1.6;
            }}
            .content h2 {{
                color: #FFA844;
                font-size: 20px;
            }}
            .button-container {{
                text-align: center;
                margin: 20px 0;
            }}
            .button {{
                background-color: #FFA844;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }}
            .footer {{
                background-color: #f9f9f9;
                color: #888888;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="../utils/images/bus-icon-app.png" alt="App Icon" />
                <h1>Bus Tracker</h1>
            </div>
            <div class="content">
                <h2>Atualizações sobre sua linha:</h2>
                <p><strong>Line:</strong> {linha}</p>
                <p><strong>Stop:</strong> {ponto}</p>
                <h3>Bus Information:</h3>
                <ul>
                    {''.join([f'<li>Bus <strong>{onibus}</strong> is <strong>{minutos}</strong> minutes away from your stop.</li>' for onibus, minutos in onibus_data.items()])}
                </ul>
            </div>
            <div class="footer">
                <p>Obrigada por usar nosso aplicativo. Mantenha-se informado sobre as suas rotas!</p>
                <p>© 2024 Bus Tracker Rio</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Create the email
    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_SENDER_ALIAS
    msg["To"] = receiver_email
    msg["Subject"] = "Bus Tracker Updates"

    # Attach the HTML content
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Connect to the email server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER_ALIAS, EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        # Log the error and raise it for debugging
        print(f"Error sending email: {e}")
        raise
