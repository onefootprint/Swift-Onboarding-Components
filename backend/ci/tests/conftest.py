import json
import os
import pytest
from twilio.rest import Client
from .constants import (
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)
from .types import User
from .utils import (
    _override_webauthn_attestation,
    _override_webauthn_challenge,
    build_user_data,
    post,
    create_tenant,
    create_basic_user,
)
from .webauthn_simulator import SoftWebauthnDevice


@pytest.fixture(scope="session")
def can_access_data_kinds():
    # Everything but city
    return [
        "first_name",
        "last_name",
        "dob",
        "ssn9",
        "address_line1",
        "address_line2",
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
    chal_token = body["data"]["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get("TEST_URL"))
    attestation = _override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=chal_token, device_response_json=json.dumps(attestation)
    )
    post("hosted/user/biometric", data, basic_user.auth_token)

    # Complete the onboarding
    body = post(
        "hosted/onboarding/complete",
        None,
        workos_sandbox_tenant.ob_config.key,
        basic_user.auth_token,
    )
    validation_token = body["data"]["validation_token"]

    # Get the fp_user_id
    body = post(
        "users/validate",
        dict(validation_token=validation_token),
        workos_sandbox_tenant.sk.key,
    )
    fp_user_id = body["data"]["footprint_user_id"]
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
