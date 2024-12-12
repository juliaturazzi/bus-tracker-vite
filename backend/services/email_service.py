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
    # Define the HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bus Tracker Alertas</title>
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
                max-width: 30px;
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
                margin-bottom: 15px;
            }}
            .content ul {{
                padding-left: 20px;
            }}
            .content ul li {{
                margin-bottom: 10px;
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
                display: inline-block;
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
            <!-- Header Section -->
            <div class="header">
                <img src="https://res.cloudinary.com/dlx31jbcz/image/upload/v1733106928/bus-icon-app_txjwpn.png" alt="App Icon" />
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


def send_verification_email(receiver_email: str, token: str):
    verification_link = f"http://localhost:5173/verify?token={token}"  # Replace with your actual frontend verification URL

    subject = "Verifique seu Email - Bus Tracker"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verifique seu Email</title>
        <style>
            /* Add your email styles here */
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }}
            .container {{
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
            }}
            .button {{
                background-color: #FFA844;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Bem vindo ao Bus Tracker!</h2>
            <p>Obrigado por se registrar. Por favor, verifique seu email clicando no botão abaixo:</p>
            <a href="{verification_link}" class="button">Verificar Email</a>
            <p>Se você não se registrou, por favor ignore este email.</p>
        </div>
    </body>
    </html>
    """

    # Create the email
    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_SENDER_ALIAS
    msg["To"] = receiver_email
    msg["Subject"] = subject

    # Attach the HTML content
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Connect to the email server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER_ALIAS, EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
            print("Verification email sent successfully!")
    except Exception as e:
        print(f"Error sending verification email: {e}")
        raise


def send_password_reset_email(receiver_email: str, token: str):
    reset_link = f"http://localhost:5173/reset-password?token={token}"  # Replace with your actual frontend reset URL

    subject = "Redefina sua senha - Bus Tracker"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redefina sua senha</title>
        <style>
            /* Add your email styles here */
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }}
            .container {{
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
            }}
            .button {{
                background-color: #FFA844;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Redefina sua senha</h2>
            <p>Você informou que gostaria de redefinir a senha cadastrada no Bus Tracker. Clique no botão abaixo para gerar uma nova senha:</p>
            <a href="{reset_link}" class="button">Reset Redefinir senha</a>
            <p>Se não foi você que requisitou a mudança de senha, por favor desconsidere esse email.</p>
        </div>
    </body>
    </html>
    """

    # Create the email
    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_SENDER_ALIAS
    msg["To"] = receiver_email
    msg["Subject"] = subject

    # Attach the HTML content
    msg.attach(MIMEText(html_content, "html"))

    try:
        # Connect to the email server and send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(EMAIL_SENDER_ALIAS, EMAIL_SENDER_PASSWORD)
            server.send_message(msg)
            print("Password reset email sent successfully!")
    except Exception as e:
        # Log the error and raise it for debugging
        print(f"Error sending password reset email: {e}")
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
