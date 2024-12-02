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

def send_email(receiver_email, linha, ponto, onibus_data):
    msg = create_email(receiver_email, linha, ponto, onibus_data)

    try:
        # Connect to the email server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER_ALIAS, EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
            print("Email sent successfully!")
    except Exception as e:
        # Log the error and raise it for debugging
        print(f"Error sending email: {e}")
        raise

def create_email(receiver_email, linha, ponto, onibus_data):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .email-container {{
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                font-family: Arial, sans-serif;
                color: #333333;
                background-color: #ffffff;
            }}
            .header {{
                background-color: #0044cc; /* Dark blue background */
                color: #ffffff; /* White text */
                text-align: center;
                padding: 20px;
            }}
            .header h1 {{
                color: #FFFFFF !important; /* Ensure title is always white */
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                padding: 20px;
            }}
            .content h2 {{
                color: #333333;
            }}
            .content p {{
                font-size: 16px;
                line-height: 1.5;
            }}
            .content ul {{
                list-style-type: none;
                padding: 0;
            }}
            .content li {{
                background-color: #FFD700; /* Consistent yellow color */
                color: #333333;
                padding: 10px;
                margin-bottom: 10px;
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
            /* Prevent automatic dark mode adjustments */
            @media (prefers-color-scheme: dark) {{
                .email-container {{
                    background-color: #1a1a1a !important;
                    color: #f0f0f0 !important;
                }}
                .header {{
                    background-color: #333333 !important;
                }}
                .content li {{
                    background-color: #FFD700 !important; /* Maintain yellow in dark mode */
                    color: #1a1a1a !important;
                }}
                .footer {{
                    background-color: #2c2c2c !important;
                    color: #dddddd !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header Section -->
            <div class="header">
                <img src="https://res.cloudinary.com/dlx31jbcz/image/upload/v1733106928/bus-icon-app_txjwpn.png" alt="App Icon" style="width: 50px; height: 50px;" />
                <h1>Bus Tracker</h1>
            </div>
            <!-- Content Section -->
            <div class="content">
                <h2>Atualizações sobre a sua linha:</h2>
                <p><strong>Linha: </strong> {linha}</p>
                <p><strong>Ponto de ônibus: </strong> {ponto}</p>
                <h3>Informações sobre os ônibus:</h3>
                <ul>
                    <!-- Dynamic Bus Information List -->
                    {''.join([f'<li>Ônibus <strong>{onibus}</strong> está a <strong>{minutos}</strong> minutos de distância do seu ponto.</li>' for onibus, minutos in onibus_data.items()])}
                </ul>
            </div>
            <!-- Footer Section -->
            <div class="footer">
                <p>Obrigada por usar nosso aplicativo. Mantenha-se informado sobre as suas rotas!</p>
                <p>© 2024 Bus Tracker</p>
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
            print("Email sent successfully!")
    except Exception as e:
        # Log the error and raise it for debugging
        print(f"Error sending email: {e}")
        raise

# Example usage
if __name__ == "__main__":
    receiver = "recipient@example.com"
    linha = "42B"
    ponto = "Central Station"
    onibus_data = {
        "Bus 1": 5,
        "Bus 2": 12,
        "Bus 3": 7
    }

    send_email(receiver, linha, ponto, onibus_data)
