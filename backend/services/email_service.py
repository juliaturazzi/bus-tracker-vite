import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load email credentials from .env file
load_dotenv()
EMAIL_SENDER_ALIAS = os.getenv("EMAIL_SENDER_ALIAS")
EMAIL_SENDER_PASSWORD = os.getenv("EMAIL_SENDER_PASSWORD")
WEBSITE_URL = os.getenv("WEBSITE_URL")

# Email server settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_email(receiver_email, linha, ponto, onibus_data):
    # Define the HTML content with escaped curly braces
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bus Tracker Alertas</title>
        <style>
            /* Prevent email clients from adjusting text sizes */
            body, table, td, a {{
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }}
            /* Remove spacing between tables in Outlook */
            table, td {{
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }}
            /* Set the color scheme to light */
            body {{
                color-scheme: light;
                supported-color-schemes: light;
            }}
            /* Responsive adjustments */
            @media screen and (max-width: 600px) {{
                .email-container {{
                    width: 100% !important;
                }}
                .header img {{
                    max-width: 25px !important;
                }}
                .header h1 {{
                    font-size: 20px !important;
                }}
                .content h2 {{
                    font-size: 18px !important;
                }}
                .content h3 {{
                    font-size: 16px !important;
                }}
                .button {{
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }}
            }}
        </style>
    </head>
    <body style="margin:0; padding:0; background-color: #f4f4f4;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center">
                    <!-- Email Container -->
                    <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); width: 600px;">
                        <!-- Header Section -->
                        <tr>
                            <td align="center" bgcolor="#FFA844" style="padding: 30px 20px; color: #ffffff;">
                                <img src="https://res.cloudinary.com/dlx31jbcz/image/upload/v1733106928/bus-icon-app_txjwpn.png" alt="App Icon" width="30" style="display: block; margin: 0 auto 10px; border: 0;" />
                                <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif;">Bus Tracker</h1>
                            </td>
                        </tr>
                        <!-- Content Section -->
                        <tr>
                            <td style="padding: 20px; color: #333333; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">
                                <h2 style="color: #FFA844; font-size: 20px; margin-bottom: 15px; font-family: 'Helvetica Neue', Arial, sans-serif;">Atualizações sobre a sua linha:</h2>
                                <p style="margin: 0 0 10px 0;"><strong>Linha:</strong> {linha}</p>
                                <p style="margin: 0 0 20px 0;"><strong>Ponto de ônibus:</strong> {ponto}</p>
                                <h3 style="color: #FFA844; font-size: 18px; margin-bottom: 10px; font-family: 'Helvetica Neue', Arial, sans-serif;">Informações sobre os ônibus:</h3>
                                <ul style="padding-left: 20px; margin: 0 0 20px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
                                    <!-- Dynamic Bus Information List -->
                                    {''.join([f'<li>Ônibus <strong>{onibus}</strong> está a <strong>{minutos}</strong> minutos de distância do seu ponto.</li>' for onibus, minutos in onibus_data.items()])}
                                </ul>
                            </td>
                        </tr>
                        <!-- Button Section -->
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <a href="#" style="background-color: #FFA844 !important; color: #ffffff !important; padding: 10px 20px !important; text-decoration: none !important; border-radius: 5px !important; font-weight: bold !important; display: inline-block !important; font-family: 'Helvetica Neue', Arial, sans-serif;">Acesse o App</a>
                            </td>
                        </tr>
                        <!-- Footer Section -->
                        <tr>
                            <td bgcolor="#f9f9f9" style="padding: 10px; color: #888888; text-align: center; font-size: 12px; font-family: 'Helvetica Neue', Arial, sans-serif;">
                                <p style="margin: 0;">Obrigada por usar nosso aplicativo. Mantenha-se informado sobre as suas rotas!</p>
                                <p style="margin: 0;">© 2024 Bus Tracker</p>
                            </td>
                        </tr>
                    </table>
                    <!-- End Email Container -->
                </td>
            </tr>
        </table>
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
    verification_link = f"{WEBSITE_URL}verify?token={token}"  # Replace with your actual frontend verification URL

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
    reset_link = f"{WEBSITE_URL}reset-password?token={token}"  # Replace with your actual frontend reset URL

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
            <a href="{reset_link}" class="button">Redefinir Senha</a>
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
    # Example for verification email
    # send_verification_email("user@example.com", "your_verification_token")
    # Example for password reset email
    # send_password_reset_email("user@example.com", "your_reset_token")
