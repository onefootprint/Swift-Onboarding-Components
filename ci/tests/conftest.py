import json
import os
import re
import pytest
from twilio.rest import Client
from .auth import (
    OnboardingAuth,
)
from .constants import (
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)
from .types import User
from .utils import (
    _gen_random_ssn,
    _override_webauthn_attestation,
    _override_webauthn_challenge,
    _random_sandbox_info,
    try_until_success,
    post,
    create_tenant,
)
from .webauthn_simulator import SoftWebauthnDevice


@pytest.fixture(scope="session")
def can_access_data_kinds():
    # Everything but city
    return [
        "first_name",
        "last_name",
        "dob",
        "ssn",
        "street_address",
        "street_address2",
        "state",
        "zip",
        "country",
        "email",
        "phone_number",
    ]


@pytest.fixture(scope="session")
def must_collect_data_kinds(can_access_data_kinds):
    return can_access_data_kinds + ["city"]


@pytest.fixture(scope="session")
def workos_tenant(must_collect_data_kinds, can_access_data_kinds):
    org_data = {
        "name": "Acme Bank",        
        "is_live": True,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data_kinds": must_collect_data_kinds,
        "can_access_data_kinds": can_access_data_kinds,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def workos_sandbox_tenant(must_collect_data_kinds, can_access_data_kinds):

    org_data = {
        "name": "Acme Bank",    
        "is_live": False,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data_kinds": must_collect_data_kinds,
        "can_access_data_kinds": can_access_data_kinds,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)


@pytest.fixture(scope="module")
def user(workos_sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the workos_sandbox_tenant
    """
    ssn = _gen_random_ssn()
    sandbox_phone_number, sandbox_email = _random_sandbox_info()
    phone_number = sandbox_phone_number.split("#")[0]

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = {"phone_number": sandbox_phone_number}
        body = post("internal/identify/challenge", data)
        return body["data"]["challenge_token"]
    challenge_token = try_until_success(initiate_challenge, 20)  # Rate limiting may take a while

    # Respond to the challenge and create the sandbox user
    def identify_verify():
        message = twilio.messages.list(to=phone_number, limit=1)[0]
        code = str(re.search("\\d{6}", message.body).group(0))
        data = {
            "challenge_response": code,
            "challenge_kind": "sms",
            "challenge_token": challenge_token,
        }
        body = post("internal/identify/verify", data)
        assert body["data"]["kind"] == "user_created"
        return body["data"]["auth_token"]
    auth_token = try_until_success(identify_verify, 5)
    auth_token = OnboardingAuth(auth_token)

    # Initialize the onboarding
    post("internal/onboarding", None, workos_sandbox_tenant.ob_config.key, auth_token)

    # Populate the user's data
    user_data = {
        "name": {
            "first_name": "Sandbox",
            "last_name": "User",
        },
        "dob": {
            "month": 12,
            "day": 25,
            "year": 1995,
        },
        "address": {
            "address": {
                "street_address": "1 Footprint Way",
                "street_address_2": "PO Box Wallaby Way",
            },
            "city": "Enclave",
            "state": "NY",
            "zip": "10009",
            "country": "US",
        },
        "ssn": ssn,
        "email": sandbox_email,
    } 
    post("internal/user/data", user_data, auth_token)

    # Register the biometric credential
    webauthn_device = SoftWebauthnDevice()
    body = post("internal/user/biometric/init", None, auth_token)
    chal_token = body["data"]["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get('TEST_URL'))
    attestation = _override_webauthn_attestation(attestation)
    data = dict(challenge_token=chal_token, device_response_json=json.dumps(attestation))
    post("internal/user/biometric", data, auth_token)

    # Complete the onboarding
    body = post("internal/onboarding/complete", None, workos_sandbox_tenant.ob_config.key, auth_token)
    validation_token = body["data"]["validation_token"]

    # Get the fp_user_id
    body = post("org/validate", dict(validation_token=validation_token), workos_sandbox_tenant.sk.key)
    fp_user_id = body["data"]["footprint_user_id"]
    return User(
        auth_token=auth_token,
        fp_user_id=fp_user_id,
        first_name=user_data["name"]["first_name"],
        last_name=user_data["name"]["last_name"],
        street_address=user_data["address"]["address"]["street_address"],
        zip=user_data["address"]["zip"],
        country=user_data["address"]["country"],
        ssn=ssn,
        phone_number=sandbox_phone_number,
        real_phone_number=phone_number,
        email=sandbox_email,
        tenant=workos_sandbox_tenant,
    )