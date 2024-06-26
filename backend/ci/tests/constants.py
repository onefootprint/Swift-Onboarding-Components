import json
import os
from .headers import CustodianAuth
from dotenv import load_dotenv
import random

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

# We use different twilio credentials in integration tests than on the API servers
IT_TWILIO_ACCOUNT_SID = get_secret("IT_TWILIO_ACCOUNT_SID")
IT_TWILIO_SECRET_AUTH_TOKEN = get_secret("IT_TWILIO_SECRET_AUTH_TOKEN")

# These are real phone numbers - we send real SMSes to these phone number.
# These phone number exists on the twilio account defined by the credentials above.
# To reduce impacts of contention sending messages to one phone number, we have a library of numbers.
# But over time, I've felt less like contention is the cause of flaky tests... We could probably get rid of
# most of these numbers
ALL_PHONE_NUMBERS = [
    "+12029521443",
    "+19163473876",
    "+14253716498",
    "+12028318398",
    "+12029463154",
    "+14255376958",
    "+19168643701",
    "+12029370987",
    "+17605178879",
    "+19163473915",
    "+12027592344",
    "+19282571781",
    "+12029461521",
    "+19285975629",
    "+12029985931",
    "+19287234566",
    "+19285979867",
    "+12029529077",
    "+14253995156",
    "+12027409135",
    "+19164592363",
    "+12025191954",
]
random.shuffle(ALL_PHONE_NUMBERS)

NUM_WORKERS = os.environ.get("PYTEST_XDIST_WORKER_COUNT")
if NUM_WORKERS is not None:
    # When running tests in parallel, we want to choose a different live phone number for each.
    # Filter the set of phone numbers that could be used by this worker
    NUM_WORKERS = int(NUM_WORKERS)
    WORKER_IDX = int(os.environ.get("PYTEST_XDIST_WORKER").removeprefix("gw"))
    num_phone_numbers = len(ALL_PHONE_NUMBERS)
    ALL_PHONE_NUMBERS = [
        p
        for (i, p) in enumerate(ALL_PHONE_NUMBERS)
        if WORKER_IDX % num_phone_numbers == i
    ]

phone_idx = random.randint(0, len(ALL_PHONE_NUMBERS) - 1)
LIVE_PHONE_NUMBER = ALL_PHONE_NUMBERS[phone_idx]
print(f"\nUSING LIVE PHONE NUMBER: {LIVE_PHONE_NUMBER}")

ENVIRONMENT = get_secret("ENVIRONMENT")

# This phone number can only be used in sandbox. It will always yield a PIN code of 000000 in the identify flow and we never send SMS messages to it.
# However, users created with this phone number can never be identified at another tenant.
FIXTURE_PHONE_NUMBER = "+15555550100"
FIXTURE_PHONE_NUMBER2 = "+15555550111"
# This email can only be used in sandbox. It will always yield a PIN code of 000000 in the identify flow and we never send emails to it.
# However, users created with this email can never be identified at another tenant.
FIXTURE_EMAIL = f"fp@example.com"
FIXTURE_EMAIL2 = f"sandbox@onefootprint.com"

live_phone_number_hash = hash(LIVE_PHONE_NUMBER)
EMAIL = f"footprint.user.dev+{live_phone_number_hash}@gmail.com"
CUSTODIAN_KEY = get_secret("CUSTODIAN_KEY") or "onefootprint"
PROTECTED_CUSTODIAN_KEY = get_secret("PROTECTED_CUSTODIAN_KEY")

CUSTODIAN_AUTH = CustodianAuth(CUSTODIAN_KEY)
IT_SVIX_API_KEY = get_secret("IT_SVIX_API_KEY")

FIXTURE_OTP_PIN = "000000"
FIXTURE_EMAIL_OTP_PIN = "000000"

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
PARTNER_TENANT_ID1 = "_private_it_porg_1"


# Sans phone number, ssn, email
ID_DATA = {
    "id.first_name": "Piip",
    "id.last_name": "Penguin",
    "id.dob": "1995-12-25",
    "id.address_line1": "1 Footprint Way",
    "id.address_line2": "Apt 2",
    "id.city": "Enclave ",  # white space should be removed
    "id.state": "NY",
    "id.zip": "10009",
    "id.country": "US",
    "id.nationality": "US",
    "id.us_legal_status": "citizen",
}

BUSINESS_DATA = {
    "business.name": "Foobar Inc",  # We'll add a random suffix to this
    "business.dba": "Barfoo Inc",
    "business.website": "https://foobar.com",
    "business.phone_number": FIXTURE_PHONE_NUMBER,
    "business.address_line1": "1 Hayes St",
    "business.address_line2": "#30",
    "business.city": "SF",
    "business.state": "CA",
    "business.zip": "94117",
    "business.country": "US",
    "business.tin": "121231234",
    "business.beneficial_owners": [
        {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50},
        {"first_name": "Franklin", "last_name": "Frog", "ownership_stake": 30},
    ],
    "business.kyced_beneficial_owners": [
        {
            "first_name": "Piip",
            "last_name": "Penguin",
            "ownership_stake": 50,
        },
        {
            "first_name": "Franklin",
            "last_name": "Frog",
            "email": "sandbox@onefootprint.com",
            "phone_number": LIVE_PHONE_NUMBER,
            "ownership_stake": 30,
        },
    ],
}

BUSINESS_VAULT_DERIVED_DATA = {
    "business.formation_state": "CA",
    "business.formation_date": "2024-02-02",
}

IP_DATA = {
    "investor_profile.employment_status": "employed",
    "investor_profile.occupation": "Neurosurgeon",
    "investor_profile.employer": "Hayes Valley Hospital",
    "investor_profile.annual_income": "gt25k_le50k",
    "investor_profile.net_worth": "gt1m_le5m",
    "investor_profile.investment_goals": ["growth", "preserve_capital"],
    "investor_profile.risk_tolerance": "conservative",
    "investor_profile.declarations": [
        "affiliated_with_us_broker",
        "family_of_political_figure",
    ],
    "investor_profile.brokerage_firm_employer": "Robinhood",
    "investor_profile.senior_executive_symbols": ["AAPL", "HOOOD", "SPY"],
    "investor_profile.family_member_names": ["Hayes Valley", "Piip Penguin"],
    "investor_profile.political_organization": "Enclave Party",
}

CREDIT_CARD_DATA = {
    "card.hayes.number": "4428680502681658",
    "card.hayes.expiration": "12/2025",
    "card.hayes.cvc": "123",
    "card.valley.cvc": "098",
}

CDO_TO_DIS = {
    "name": ["id.first_name", "id.middle_name", "id.last_name"],
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
    "email": ["id.email"],
    "phone_number": ["id.phone_number"],
    "nationality": ["id.nationality"],
    "us_legal_status": [
        "id.us_legal_status",
        "id.nationality",
        "id.citizenships",
        "id.visa_kind",
        "id.visa_expiration_date",
    ],
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
        "investor_profile.senior_executive_symbols",
        "investor_profile.family_member_names",
        "investor_profile.political_organization",
    ],
    "us_tax_id": ["id.us_tax_id"],
}
