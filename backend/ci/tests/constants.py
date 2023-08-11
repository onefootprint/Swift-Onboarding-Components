import json
import os
from .headers import CustodianAuth
from .image_fixtures import (
    test_image_dl_front,
    test_image_dl_back,
    test_image_dl_selfie,
)
from dotenv import load_dotenv

load_dotenv()


def get_secret(name):
    environ = os.environ.get(name)
    if environ is None:
        return os.getenv(name)
    return environ


# The URL of which api_server to test against
TEST_URL = os.environ.get("TEST_URL") or "http://localhost:8000"

WORKOS_ORG_ID = "org_01G39KR1V1E52JEZV6BYNG590J"
url = lambda path: "{}/{}".format(TEST_URL, path)

TWILIO_API_KEY = get_secret("TWILIO_API_KEY")
TWILIO_ACCOUNT_SID = get_secret("TWILIO_ACCOUNT_SID")
TWILIO_API_KEY_SECRET = get_secret("TWILIO_API_KEY_SECRET")

# This phone number can only be used in sandbox. It will always yield a PIN code of 000000 in the identify flow and we never send SMS messages to it.
# However, users created with this phone number can never be identified at another tenant.
FIXTURE_PHONE_NUMBER = "+15555550100"
# This is a real phone number - we send real SMSes to this phone number
LIVE_PHONE_NUMBER = get_secret("INTEGRATION_TEST_PHONE_NUMBER")

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


# Sans phone number, ssn, email
ID_DATA = {
    "id.first_name": "Piip",
    "id.last_name": "Penguin",
    "id.dob": "1995-12-25",
    "id.address_line1": "1 Footprint Way",
    "id.address_line2": "PO Box Wallaby Way",
    "id.city": "Enclave",
    "id.state": "NY",
    "id.zip": "10009",
    "id.country": "US",
    "id.nationality": "US",
}

BUSINESS_DATA = {
    "business.name": "Foobar Inc",  # We'll add a random suffix to this
    "business.dba": "Barfoo Inc",
    "business.website": "https://foobar.com",
    "business.phone_number": FIXTURE_PHONE_NUMBER,
    "business.address_line1": "1 Hayes St",
    "business.city": "SF",
    "business.state": "CA",
    "business.zip": "94117",
    "business.country": "US",
    "business.tin": "121231234",
    "business.beneficial_owners": json.dumps(
        [
            {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
            {"first_name": "Franklin", "last_name": "Frog", "ownership_stake": 30},
        ]
    ),
    "business.kyced_beneficial_owners": json.dumps(
        [
            {
                "first_name": "Piip",
                "last_name": "Penguin",
                "ownership_stake": 50,
            },
            {
                "first_name": "Franklin",
                "last_name": "Frog",
                "email": "franklin@onefootprint.com",
                "phone_number": LIVE_PHONE_NUMBER,
                "ownership_stake": 30,
            },
        ]
    ),
}

IP_DATA = {
    "investor_profile.employment_status": "employed",
    "investor_profile.occupation": "Neurosurgeon",
    "investor_profile.employer": "Hayes Valley Hospital",
    "investor_profile.annual_income": "lt50k",
    "investor_profile.net_worth": "gt1m",
    "investor_profile.investment_goals": '["grow_long_term_wealth", "buy_a_home"]',
    "investor_profile.risk_tolerance": "conservative",
    "investor_profile.declarations": '["affiliated_with_us_broker", "family_of_political_figure"]',
}

CREDIT_CARD_DATA = {
    "card.hayes.number": "4428680502681658",
    "card.hayes.expiration": "12/2025",
    "card.hayes.cvc": "123",
    "card.valley.cvc": "098",
}

CDO_TO_DIS = {
    "name": ["id.first_name", "id.last_name"],
    "dob": ["id.dob"],
    "ssn9": [
        "id.ssn9"
    ],  # Technically requires ssn4, but the backend will auto-populate
    "ssn4": ["id.ssn4"],
    "full_address": [
        "id.address_line1",
        "id.address_line2",
        "id.city",
        "id.state",
        "id.zip",
        "id.country",
    ],
    "partial_address": ["id.zip", "id.country"],
    "email": ["id.email"],
    "phone_number": ["id.phone_number"],
    "nationality": ["id.nationality"],
    "business_name": ["business.name", "business.dba"],
    "business_tin": ["business.tin"],
    "business_address": [
        "business.address_line1",
        "business.address_line2",
        "business.city",
        "business.state",
        "business.zip",
        "business.country",
    ],
    "business_phone_number": ["business.phone_number"],
    "business_website": ["business.website"],
    "business_beneficial_owners": ["business.beneficial_owners"],
    "business_kyced_beneficial_owners": ["business.kyced_beneficial_owners"],
    "business_corporation_type": ["business.corporation_type"],
    "investor_profile": [
        "investor_profile.employment_status",
        "investor_profile.occupation",
        "investor_profile.employer",
        "investor_profile.brokerage_firm_employer",
        "investor_profile.annual_income",
        "investor_profile.net_worth",
        "investor_profile.investment_goals",
        "investor_profile.risk_tolerance",
        "investor_profile.declarations",
    ],
}

DOCUMENT_DATA = {
    "document.drivers_license.front.image": test_image_dl_front,
    "document.drivers_license.back.image": test_image_dl_back,
    "document.drivers_license.selfie.image": test_image_dl_selfie,
}
