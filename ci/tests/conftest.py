import json
import os
import re
import string
from .webauthn_simulator import SoftWebauthnDevice
import pytest
import requests
from typing import NamedTuple
from .utils import _b64_decode, _client_priv_key_headers, _client_pub_key_headers, _fpuser_auth_header, _gen_random_n_digit_number, _gen_random_ssn, _override_webauthn_attestation, _override_webauthn_challenge, _random_sandbox_email, _random_sandbox_phone, try_until_success, url, _assert_response

from twilio.rest import Client
from .constants import (
    CAN_ACCESS_DATA_KINDS,
    EMAIL,
    FPUSER_AUTH_HEADER,
    MUST_COLLECT_DATA_KINDS,
    PHONE_NUMBER,
    WORKOS_ORG_ID,
    MUST_COLLECT_DATA_KINDS,
    CAN_ACCESS_DATA_KINDS,
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)

def cleanup(phone_number, email):
    # cleanup live user
    path = "private/cleanup"
    r = requests.post(
        url(path),
        json=dict(phone_number=phone_number)
    )
    _assert_response(r)
    identify_path = "identify"
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}
    r = requests.post(
        url(identify_path),
        json=data,
    )
    body = _assert_response(r)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


@pytest.fixture(scope="session")
def workos_tenant():
    path = "private/client"
    data = {
        "name": "Acme Bank",
        "workos_org_id": WORKOS_ORG_ID,
        "email_domain": "onefootprint.com",
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": True,
    }
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    print("\n======Client info======")
    print(body)
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }


@pytest.fixture(scope="module")
def workos_sandbox_tenant():
    path = "private/client"
    data = {
        "name": "Acme Bank",
        "workos_org_id": WORKOS_ORG_ID,
        "email_domain": "onefootprint.com",
        "is_live": False,
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": False,
    }
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }


@pytest.fixture(scope="session")
def foo_tenant():
    path = "private/client"
    data = {
        "name": "foo",
        "workos_org_id": "bar",
        "email_domain": "foo.bar",
        "must_collect_data_kinds": MUST_COLLECT_DATA_KINDS,
        "can_access_data_kinds": CAN_ACCESS_DATA_KINDS,
        "is_live": True,
    }
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)

class User(NamedTuple):
    auth_token: str
    fp_user_id: str
    first_name: str
    last_name: str
    street_address: str
    zip: str
    country: str
    ssn: str
    phone_number: str
    real_phone_number: str
    email: str
    tenant: dict  # TODO make type


"""
Create a user with registered data and webuathn creds and onboard them onto the workos_sandbox_tenant
"""
@pytest.fixture(scope="module")
def user(workos_sandbox_tenant, twilio):
    ssn = _gen_random_ssn()
    sandbox_phone_number = _random_sandbox_phone()
    phone_number = sandbox_phone_number.split("#")[0]
    sandbox_email = _random_sandbox_email()

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = {"phone_number": sandbox_phone_number}
        r = requests.post(
            url("identify/challenge"),
            json=data,
        )
        body = _assert_response(r)
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
        r = requests.post(
            url("identify/verify"),
            json=data,
        )
        body = _assert_response(r)
        assert body["data"]["kind"] == "user_created"
        return body["data"]["auth_token"]
    auth_token = try_until_success(identify_verify, 5)

    # Initialize the onboarding
    r = requests.post(
        url("onboarding"),
        headers=dict(
            **_client_pub_key_headers(workos_sandbox_tenant["pk"]),
            **_fpuser_auth_header(auth_token)
        ),
    )
    _assert_response(r)

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
    r = requests.post(
        url("user/data"),
        json=user_data,
        headers=_fpuser_auth_header(auth_token),
    )
    _assert_response(r)

    # Register the biometric credential
    webauthn_device = SoftWebauthnDevice()
    r = requests.post(
        url("user/biometric/init"),
        headers=_fpuser_auth_header(auth_token),
    )    
    body = _assert_response(r)
    chal_token = body["data"]["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get('TEST_URL'))
    attestation = _override_webauthn_attestation(attestation)
    r = requests.post(
        url("user/biometric"),
        headers=_fpuser_auth_header(auth_token),
        json=dict(challenge_token=chal_token, device_response_json=json.dumps(attestation)),
    )    
    _assert_response(r)

    # Complete the onboarding
    r = requests.post(
        url("onboarding/complete"),
        headers=dict(
            **_client_pub_key_headers(workos_sandbox_tenant["pk"]),
            **_fpuser_auth_header(auth_token),
        ),
    )
    body = _assert_response(r)
    validation_token = body["data"]["validation_token"]

    # Get the fp_user_id
    r = requests.post(
        url("org/validate"),
        headers=dict(**_client_priv_key_headers(workos_sandbox_tenant["sk"])),
        json= {"validation_token": validation_token},
    )
    body = _assert_response(r)
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
