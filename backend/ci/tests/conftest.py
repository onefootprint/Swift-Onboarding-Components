import json
import requests
import os
import time
from .auth import OnboardingSessionToken
import pytest
from twilio.rest import Client
from .constants import (
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)
from .types import User
from .utils import (
    IncorrectServerVersion,
    _override_webauthn_attestation,
    _override_webauthn_challenge,
    build_user_data,
    post,
    _make_request,
    create_tenant,
    create_basic_user,
)
from .webauthn_simulator import SoftWebauthnDevice


@pytest.fixture(scope="session", autouse="true")
def wait_for_deploy():
    """
    Run once per test session to make sure that the correct version of code is deployed
    """
    expected_version = os.environ.get("EXPECTED_SERVER_VERSION", None)
    if not expected_version:
        # Running locally, no need to wait for server version
        return
    num_successes = 0
    failed_attempts = 0
    REQUIRED_NUM_SUCCESS = 30
    MAX_ATTEMPTS = 60
    while num_successes < REQUIRED_NUM_SUCCESS:
        try:
            _make_request(requests.get, "/", None, None, 200, [])
            num_successes += 1
            time.sleep(1)
        except IncorrectServerVersion as e:
            print(e)
            # Reset our success counter to make sure we have consecutive success
            num_successes = 0
            failed_attempts += 1
            if failed_attempts == MAX_ATTEMPTS:
                raise e
            time.sleep(10)
    print(
        f"Correct server version {expected_version} found! Continuing to run tests..."
    )


@pytest.fixture(scope="session")
def can_access_data():
    # Everything but dob
    return [
        "name",
        "ssn9",
        "full_address",
        "email",
        "phone_number",
    ]


@pytest.fixture(scope="session")
def must_collect_data(can_access_data):
    return can_access_data + ["dob"]


@pytest.fixture(scope="session")
def workos_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "Acme Bank",
        "is_live": True,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def workos_sandbox_tenant(must_collect_data, can_access_data):

    org_data = {
        "name": "Acme Bank",
        "is_live": False,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)


@pytest.fixture(scope="module")
def basic_user(twilio):
    """
    Create a sandbox user with no data other than phone/email
    """
    return create_basic_user(twilio)


@pytest.fixture(scope="module")
def user(workos_sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the workos_sandbox_tenant
    """
    basic_user = create_basic_user(twilio)
    user_data = build_user_data()

    # Initialize the onboarding
    post(
        "hosted/onboarding",
        None,
        workos_sandbox_tenant.ob_config.key,
        basic_user.auth_token,
    )

    # Populate the user's data
    post("hosted/user/data/identity", user_data, basic_user.auth_token)

    # Register the biometric credential
    webauthn_device = SoftWebauthnDevice()
    body = post("hosted/user/biometric/init", None, basic_user.auth_token)
    chal_token = body["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get("TEST_URL"))
    attestation = _override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=chal_token, device_response_json=json.dumps(attestation)
    )
    post("hosted/user/biometric", data, basic_user.auth_token)

    # Run the KYC check
    post(
        "hosted/onboarding/submit",
        None,
        workos_sandbox_tenant.ob_config.key,
        basic_user.auth_token,
    )

    # Authorize and complete the onboarding
    body = post(
        "hosted/onboarding/authorize",
        None,
        workos_sandbox_tenant.ob_config.key,
        basic_user.auth_token,
    )
    validation_token = body["validation_token"]

    # Get the fp_user_id
    body = post(
        "onboarding/session/validate",
        dict(validation_token=validation_token),
        workos_sandbox_tenant.sk.key,
    )
    fp_user_id = body["footprint_user_id"]
    return User(
        auth_token=basic_user.auth_token,
        fp_user_id=fp_user_id,
        first_name=user_data["name"]["first_name"],
        last_name=user_data["name"]["last_name"],
        address_line1=user_data["address"]["line1"],
        address_line2=user_data["address"]["line2"],
        zip=user_data["address"]["zip"],
        country=user_data["address"]["country"],
        ssn=user_data["ssn9"],
        phone_number=basic_user.phone_number,
        real_phone_number=basic_user.real_phone_number,
        email=basic_user.email,
        tenant=workos_sandbox_tenant,
    )


@pytest.fixture(scope="module")
def ob_session_token(workos_tenant):
    data = {"onboarding_config_id": workos_tenant.ob_config.id}
    body = post("onboarding/session", data, workos_tenant.sk.key)
    return OnboardingSessionToken(body["session_token"])
