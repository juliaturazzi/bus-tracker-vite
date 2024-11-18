import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add the parent directory to the system path to allow imports from services
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from services.email_service import send_email


class TestEmailService(unittest.TestCase):
    @patch("smtplib.SMTP")
    @patch("services.email_service.os.getenv")
    def test_send_email_success(self, mock_getenv, mock_smtp):
        # Mock environment variables
        sender_alias = os.getenv("EMAIL_SENDER_ALIAS")
        sender_password = os.getenv("EMAIL_SENDER_PASSWORD")
        mock_getenv.side_effect = lambda key: {
            "EMAIL_SENDER_ALIAS": sender_alias,
            "EMAIL_SENDER_PASSWORD": sender_password
        }.get(key)

        # Prepare mock SMTP instance
        mock_server_instance = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server_instance

        # Input data
        receiver_email = "receiver@example.com"
        linha = "Line 1"
        ponto = "Stop A"
        onibus_data = {
            "Bus 1": 5,
            "Bus 2": 10
        }

        # Call the function
        try:
            send_email(receiver_email, linha, ponto, onibus_data)
        except Exception as e:
            self.fail(f"send_email raised an exception: {e}")

        # Assertions to check proper usage of SMTP methods
        mock_smtp.assert_called_once_with("smtp.gmail.com", 587)
        mock_server_instance.starttls.assert_called_once()
        mock_server_instance.send_message.assert_called_once()

        # Assert email content
        sent_message = mock_server_instance.send_message.call_args[0][0]
        self.assertEqual(sent_message["To"], receiver_email)
        self.assertEqual(sent_message["Subject"], "Bus Tracker Updates")
        body = sent_message.get_payload()[0].get_payload(decode=True).decode()
        self.assertIn("LINE: Line 1", body)
        self.assertIn("STOP: Stop A", body)
        self.assertIn("BUS: The bus Bus 1 is 5 minutes away", body)
        self.assertIn("BUS: The bus Bus 2 is 10 minutes away", body)

    @patch("smtplib.SMTP")
    @patch("services.email_service.os.getenv")
    def test_send_email_failure(self, mock_getenv, mock_smtp):
        # Mock environment variables
        mock_getenv.side_effect = lambda key: {
            "EMAIL_SENDER_ALIAS": "test_sender@example.com",
            "EMAIL_SENDER_PASSWORD": "password123"
        }.get(key)

        # Configure the mock SMTP to raise an exception on sending
        mock_smtp.return_value.__enter__.return_value.send_message.side_effect = Exception("SMTP error")

        # Input data
        receiver_email = "receiver@example.com"
        linha = "Line 1"
        ponto = "Stop A"
        onibus_data = {
            "Bus 1": 5,
            "Bus 2": 10
        }

        # Ensure the exception is raised as expected
        with self.assertRaises(Exception) as context:
            send_email(receiver_email, linha, ponto, onibus_data)

        self.assertEqual(str(context.exception), "SMTP error")


# Run the tests
if __name__ == "__main__":
    unittest.main()
