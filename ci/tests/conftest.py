import json
import os
import re
import pytest
from twilio.rest import Client
from .auth import (
    OnboardingAuth,
    TenantAuth,
    TenantSecretAuth,
    D2pAuth,
    My1fpAuth,
)
from .constants import (
    CAN_ACCESS_DATA_KINDS,
    WORKOS_ORG_ID,
    MUST_COLLECT_DATA_KINDS,
    CAN_ACCESS_DATA_KINDS,
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)
from .types import User, Tenant
from .utils import (
    _gen_random_ssn,
    _override_webauthn_attestation,
    _override_webauthn_challenge,
    _random_sandbox_email,
    _random_sandbox_phone,
    try_until_success,
    post,
)
from .webauthn_simulator import SoftWebauthnDevice

def cleanup(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number))
    identifier = {"email": email}
    body = post("identify", dict(identifier=identifier, preferred_challenge_kind="sms"))
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def _create_tenant(data):
    body = post("private/client", data)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    print("\n======Client info======")
    print(body)
    return Tenant(
        pk=TenantAuth(client_public_key),
        sk=TenantSecretAuth(client_secret_key),
        configuration_id=body["data"]["configuration_id"],
    )


@pytest.fixture(scope="session")
def workos_tenant():
    data = {
        "name": "Acme Bank",
        "workos_org_id": WORKOS_ORG_ID,
        "email_domain": "onefootprint.com",
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": True,
    }
    return _create_tenant(data)


@pytest.fixture(scope="module")
def workos_sandbox_tenant():
    data = {
        "name": "Acme Bank",
        "workos_org_id": WORKOS_ORG_ID,
        "email_domain": "onefootprint.com",
        "is_live": False,
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": False,
    }
    return _create_tenant(data)


@pytest.fixture(scope="session")
def foo_tenant():
    data = {
        "name": "foo",
        "workos_org_id": "bar",
        "email_domain": "foo.bar",
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": True,
    }
    return _create_tenant(data)


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)


@pytest.fixture(scope="module")
def user(workos_sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the workos_sandbox_tenant
    """
    ssn = _gen_random_ssn()
    sandbox_phone_number = _random_sandbox_phone()
    phone_number = sandbox_phone_number.split("#")[0]
    sandbox_email = _random_sandbox_email()

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = {"phone_number": sandbox_phone_number}
        body = post("identify/challenge", data)
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
        body = post("identify/verify", data)
        assert body["data"]["kind"] == "user_created"
        return body["data"]["auth_token"]
    auth_token = try_until_success(identify_verify, 5)
    auth_token = OnboardingAuth(auth_token)

    # Initialize the onboarding
    post("onboarding", None, workos_sandbox_tenant.pk, auth_token)

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
    post("user/data", user_data, auth_token)

    # Register the biometric credential
    webauthn_device = SoftWebauthnDevice()
    body = post("user/biometric/init", None, auth_token)
    chal_token = body["data"]["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get('TEST_URL'))
    attestation = _override_webauthn_attestation(attestation)
    data = dict(challenge_token=chal_token, device_response_json=json.dumps(attestation))
    post("user/biometric", data, auth_token)

    # Complete the onboarding
    body = post("onboarding/complete", None, workos_sandbox_tenant.pk, auth_token)
    validation_token = body["data"]["validation_token"]

    # Get the fp_user_id
    body = post("org/validate", dict(validation_token=validation_token), workos_sandbox_tenant.sk)
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


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # execute all other hooks to obtain the report object
    outcome = yield
    rep = outcome.get_result()

    # set a report attribute for each phase of a call, which can
    # be "setup", "call", "teardown"
    setattr(item, "rep_" + rep.when, rep)


@pytest.fixture(scope='module', autouse=True)
def print_failed_tests(request):
    def fin():
        l = request.config.cache.get("failed_tests", [])
        if len(l):
            print("\n")
            for val in l:
                print(":bangbang: test failed: {}".format(val))
            request.config.cache.set("failed_tests", [])
    request.addfinalizer(fin) 


@pytest.fixture(scope='function', autouse=True)
def print_failure(request):
    yield
    if request.node.rep_setup.passed:
        if request.node.rep_call.failed:
            l = request.config.cache.get("failed_tests", [])
            l.append(request.node.nodeid)
            request.config.cache.set("failed_tests", l)
