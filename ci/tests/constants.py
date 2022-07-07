import os
from dotenv import load_dotenv
load_dotenv()

TENANT_AUTH_HEADER = "x-client-public-key"
TENANT_SECRET_HEADER = "x-client-secret-key"
FPUSER_AUTH_HEADER = "x-fpuser-authorization"
D2P_AUTH_HEADER = "x-d2p-authorization"
MY1FP_AUTH_HEADER = "X-My1fp-Authorization"

WORKOS_ORG_ID = "org_01G39KR1V1E52JEZV6BYNG590J"
DEFAULT_ATTRIBUTES = {
        'first_name', 
        'last_name', 
        'dob', 
        'ssn', 
        'street_address', 
        'street_address2', 
        'city', 
        'state', 
        'zip', 
        'country', 
        'email', 
        'phone_number'
    }
url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

TWILIO_API_KEY = os.getenv('TWILIO_API_KEY')
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_API_KEY_SECRET = os.getenv('TWILIO_API_KEY_SECRET')
PHONE_NUMBER = os.getenv('INTEGRATION_TEST_PHONE_NUMBER')
EMAIL = "FOOTPRINT.USER.DEV@GMAIL.COM"


FIELDS_TO_DECRYPT = [
    ["last_name", "ssn"],
    ["street_address"],
    ["first_name", "email", "zip", "country", "last_four_ssn"],
]