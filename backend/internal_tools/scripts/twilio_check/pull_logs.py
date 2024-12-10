from twilio.rest import Client
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio credentials
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")

# Initialize Twilio client
client = Client(account_sid, auth_token)


def pull_and_analyze_logs(keyword, start_date, end_date, log_filename):
    # Convert date strings to datetime objects
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Initialize counterso
    total_messages = 0
    successful_messages = 0
    failed_messages = 0
    keyword_messages = 0
    keyword_successful_messages = 0
    keyword_failed_messages = 0

    # Fetch messages
    messages = client.messages.list(
        date_sent_after=start_date,
        date_sent_before=end_date + timedelta(days=1),  # Include the end date
    )

    for message in messages:
        total_messages += 1

        # Check for keyword
        if keyword.lower() in message.body.lower():
            keyword_messages += 1

            # Check message status
            if message.status in ["delivered", "sent"]:
                keyword_successful_messages += 1
            else:
                keyword_failed_messages += 1
                # Log failed messages containing the keyword to a CSV file
                with open(log_filename, "a") as log_file:
                    log_file.write(
                        f"{message.date_sent},{message.sid},{message.to},{message.from_},{message.status},{message.error_code},{message.error_message}\n"
                    )

        # Check message status
        if message.status in ["delivered", "sent"]:
            successful_messages += 1
        else:
            failed_messages += 1

    # Print statistics
    print(f"Total messages: {total_messages}")
    print(f"Successfully delivered messages: {successful_messages}")
    print(f"Failed messages: {failed_messages}")
    print(f"Success rate: {successful_messages / total_messages * 100:.2f}%")
    print(f"Messages containing keyword '{keyword}': {keyword_messages}")
    print(
        f"Successfully delivered messages containing keyword '{keyword}': {keyword_successful_messages}"
    )
    print(f"Failed messages containing keyword '{keyword}': {keyword_failed_messages}")
    print(
        f"Success rate containing keyword '{keyword}': {keyword_successful_messages / keyword_messages * 100:.2f}%"
    )


if __name__ == "__main__":
    keyword = input("Enter the keyword to filter messages: ")
    start_date = input("Enter start date (YYYY-MM-DD): ")
    end_date = input("Enter end date (YYYY-MM-DD): ")
    log_filename = input("Enter log filename: ")

    pull_and_analyze_logs(keyword, start_date, end_date, log_filename)
