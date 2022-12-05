import os
from .auth import CustodianAuth

from dotenv import load_dotenv

load_dotenv()


def get_secret(name):
    environ = os.environ.get(name)
    if environ is None:
        return os.getenv(name)
    return environ


WORKOS_ORG_ID = "org_01G39KR1V1E52JEZV6BYNG590J"
DEFAULT_ATTRIBUTES = {
    "first_name",
    "last_name",
    "dob",
    "ssn9",
    "address_line1",
    "address_line2",
    "city",
    "state",
    "zip",
    "country",
    "email",
    "phone_number",
}
url = lambda path: "{}/{}".format(os.environ.get("TEST_URL"), path)

TWILIO_API_KEY = get_secret("TWILIO_API_KEY")
TWILIO_ACCOUNT_SID = get_secret("TWILIO_ACCOUNT_SID")
TWILIO_API_KEY_SECRET = get_secret("TWILIO_API_KEY_SECRET")
PHONE_NUMBER = get_secret("INTEGRATION_TEST_PHONE_NUMBER")
EMAIL = "footprint.user.dev@gmail.com"
CUSTODIAN_KEY = get_secret("CUSTODIAN_KEY") or "onefootprint"

CUSTODIAN_AUTH = CustodianAuth(CUSTODIAN_KEY)

FIELDS_TO_DECRYPT = [
    ["last_name", "ssn9"],
    ["address_line1"],
    ["first_name", "email", "zip", "country", "ssn4"],
]
