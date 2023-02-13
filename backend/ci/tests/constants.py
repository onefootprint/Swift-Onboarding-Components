import os
from .auth import CustodianAuth

from dotenv import load_dotenv

load_dotenv()


def get_secret(name):
    environ = os.environ.get(name)
    if environ is None:
        return os.getenv(name)
    return environ


# The URL of which footprint-core to test against
TEST_URL = os.environ.get("TEST_URL") or "http://localhost:8000"

WORKOS_ORG_ID = "org_01G39KR1V1E52JEZV6BYNG590J"
url = lambda path: "{}/{}".format(TEST_URL, path)

TWILIO_API_KEY = get_secret("TWILIO_API_KEY")
TWILIO_ACCOUNT_SID = get_secret("TWILIO_ACCOUNT_SID")
TWILIO_API_KEY_SECRET = get_secret("TWILIO_API_KEY_SECRET")
PHONE_NUMBER = get_secret("INTEGRATION_TEST_PHONE_NUMBER")
SCRUBBED_PHONE_NUMBER = f"+1 (***) ***-**{PHONE_NUMBER[-2:]}"
EMAIL = "footprint.user.dev@gmail.com"
CUSTODIAN_KEY = get_secret("CUSTODIAN_KEY") or "onefootprint"

CUSTODIAN_AUTH = CustodianAuth(CUSTODIAN_KEY)
SVIX_AUTH_TOKEN = get_secret("SVIX_AUTH_TOKEN")

FIELDS_TO_DECRYPT = [
    ["id.last_name", "id.ssn9"],
    ["id.address_line1"],
    [
        "id.first_name",
        "id.email",
        "id.zip",
        "id.country",
        "id.ssn4",
    ],
]

# We get or create the tenants used in integration testing by these unique tenant IDs.
# If you need a new tenant, add its new ID here to make sure the ID is not reused
TENANT_ID1 = "_private_it_org_1"
TENANT_ID2 = "_private_it_org_2"
TENANT_ID3 = "_private_it_org_3"
TENANT_ID4 = "_private_it_org_4"
