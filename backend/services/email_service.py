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
    # Define the HTML content with dark mode support
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bus Tracker Alertas</title>
        <style>
            /* Base styles */
            body, table, td, a {{
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }}
            table, td {{
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }}
            body {{
                color-scheme: light dark;
                supported-color-schemes: light dark;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 600px;
            }}
            /* Header styles */
            .header {{
                background-color: #FFA844;
                padding: 30px 20px;
                color: #ffffff;
                text-align: center;
            }}
            .header img {{
                display: block;
                margin: 0 auto 10px;
                border: 0;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }}
            /* Content styles */
            .content {{
                padding: 20px;
                color: #333333;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
            }}
            .content h2, .content h3 {{
                color: #FFA844;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }}
            .content h2 {{
                font-size: 20px;
                margin-bottom: 15px;
            }}
            .content h3 {{
                font-size: 18px;
                margin-bottom: 10px;
            }}
            .content p {{
                margin: 0 0 10px 0;
            }}
            .content ul {{
                padding-left: 20px;
                margin: 0 0 20px 0;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }}
            /* Button styles */
            .button a {{
                background-color: #FFA844 !important;
                color: #ffffff !important;
                padding: 10px 20px !important;
                text-decoration: none !important;
                border-radius: 5px !important;
                font-weight: bold !important;
                display: inline-block !important;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }}
            /* Footer styles */
            .footer {{
                background-color: #f9f9f9;
                padding: 10px;
                color: #888888;
                text-align: center;
                font-size: 12px;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }}
            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {{
                body {{
                    background-color: #121212 !important;
                }}
                .email-container {{
                    background-color: #1e1e1e !important;
                }}
                .header {{
                    background-color: #FFA844 !important;
                }}
                .header h1 {{
                    color: #ffffff !important;
                }}
                .content {{
                    color: #e0e0e0 !important;
                }}
                .content h2, .content h3 {{
                    color: #FFA844 !important;
                }}
                .footer {{
                    background-color: #2c2c2c !important;
                    color: #bbbbbb !important;
                }}
                .button a {{
                    background-color: #FFA844 !important;
                    color: #ffffff !important;
                }}
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
                .button a {{
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center">
                    <!-- Email Container -->
                    <table border="0" cellpadding="0" cellspacing="0" class="email-container">
                        <!-- Header Section -->
                        <tr>
                            <td class="header">
                                <img src="https://res.cloudinary.com/dlx31jbcz/image/upload/v1733106928/bus-icon-app_txjwpn.png" alt="App Icon" width="30" />
                                <h1>Bus Tracker</h1>
                            </td>
                        </tr>
                        <!-- Content Section -->
                        <tr>
                            <td class="content">
                                <h2>Atualizações sobre a sua linha:</h2>
                                <p><strong>Linha:</strong> {linha}</p>
                                <p><strong>Ponto de ônibus:</strong> {ponto}</p>
                                <h3>Informações sobre os ônibus:</h3>
                                <ul>
                                    <!-- Dynamic Bus Information List -->
                                    {''.join([f'<li>Ônibus <strong>{onibus}</strong> está a <strong>{minutos}</strong> minutos de distância do seu ponto.</li>' for onibus, minutos in onibus_data.items()])}
                                </ul>
                            </td>
                        </tr>
                        <!-- Button Section -->
                        <tr>
                            <td class="button" align="center">
                                <a href="{WEBSITE_URL}">Acesse o App</a>
                            </td>
                        </tr>
                        <!-- Footer Section -->
                        <tr>
                            <td class="footer">
                                <p>Obrigada por usar nosso aplicativo. Mantenha-se informado sobre as suas rotas!</p>
                                <p>© 2024 Bus Tracker</p>
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

    # Define the HTML content with dark mode support
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verifique seu Email</title>
        <style>
            /* Base styles */
            body, table, td, a {{
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }}
            table, td {{
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }}
            body {{
                color-scheme: light dark;
                supported-color-schemes: light dark;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
            }}
            .container {{
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                max-width: 600px;
                margin: auto;
            }}
            .container h2 {{
                font-size: 24px;
                color: #FFA844;
                margin-bottom: 20px;
            }}
            .container p {{
                color: #333333;
                line-height: 1.6;
            }}
            .button a {{
                background-color: #FFA844;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
                font-weight: bold;
            }}
            /* Footer styles */
            .footer {{
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }}
            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {{
                body {{
                    background-color: #121212 !important;
                }}
                .container {{
                    background-color: #1e1e1e !important;
                }}
                .container h2 {{
                    color: #FFA844 !important;
                }}
                .container p {{
                    color: #e0e0e0 !important;
                }}
                .button a {{
                    background-color: #FFA844 !important;
                    color: #ffffff !important;
                }}
                .footer {{
                    color: #bbbbbb !important;
                }}
            }}
            /* Responsive adjustments */
            @media screen and (max-width: 600px) {{
                .container {{
                    padding: 15px !important;
                }}
                .container h2 {{
                    font-size: 20px !important;
                }}
                .button a {{
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color: #ffffff; background-color: #FFA844; padding: 10px; border-radius: 5px;">Bem vindo ao Bus Tracker!</h2>
            <p>Obrigado por se registrar. Por favor, verifique seu email clicando no botão abaixo:</p>
            <div class="button">
                <a href="{verification_link}">Verificar Email</a>
            </div>
            <p>Se você não se registrou, por favor ignore este email.</p>
            <div class="footer">
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

    # Define the HTML content with dark mode support
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redefina sua senha</title>
        <style>
            /* Base styles */
            body, table, td, a {{
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }}
            table, td {{
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }}
            body {{
                color-scheme: light dark;
                supported-color-schemes: light dark;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
            }}
            .container {{
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                max-width: 600px;
                margin: auto;
            }}
            .container h2 {{
                font-size: 24px;
                color: #FFA844;
                margin-bottom: 20px;
            }}
            .container p {{
                color: #333333;
                line-height: 1.6;
            }}
            .button a {{
                background-color: #FFA844;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
                font-weight: bold;
            }}
            /* Footer styles */
            .footer {{
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
            }}
            /* Dark mode styles */
            @media (prefers-color-scheme: dark) {{
                body {{
                    background-color: #121212 !important;
                }}
                .container {{
                    background-color: #1e1e1e !important;
                }}
                .container h2 {{
                    color: #FFA844 !important;
                }}
                .container p {{
                    color: #e0e0e0 !important;
                }}
                .button a {{
                    background-color: #FFA844 !important;
                    color: #ffffff !important;
                }}
                .footer {{
                    color: #bbbbbb !important;
                }}
            }}
            /* Responsive adjustments */
            @media screen and (max-width: 600px) {{
                .container {{
                    padding: 15px !important;
                }}
                .container h2 {{
                    font-size: 20px !important;
                }}
                .button a {{
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color: #ffffff; background-color: #FFA844; padding: 10px; border-radius: 5px;">Redefina sua senha</h2>
            <p>Você informou que gostaria de redefinir a senha cadastrada no Bus Tracker. Clique no botão abaixo para gerar uma nova senha:</p>
            <div class="button">
                <a href="{reset_link}">Redefinir Senha</a>
            </div>
            <p>Se não foi você que requisitou a mudança de senha, por favor desconsidere esse email.</p>
            <div class="footer">
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
