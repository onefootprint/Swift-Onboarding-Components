from urllib.parse import urlencode
import arrow
import os
import pytest
import random
import requests
from webauthn_simulator import SoftWebauthnDevice
import json
import base64
from dotenv import load_dotenv
from twilio.rest import Client
import re
import time

load_dotenv()

# TODO make some utils to reduce duplication
WEBAUTHN_DEVICE = SoftWebauthnDevice()

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
EMAIL = "footprint.user.dev@gmail.com"
twilio_client = Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)

def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _gen_random_ssn():
    return _gen_random_n_digit_number(9)

def _client_pub_key_headers(client_public_key):
    return {
        TENANT_AUTH_HEADER: client_public_key,
    }

def _client_priv_key_headers(client_priv_key):
    return {
        TENANT_SECRET_HEADER: client_priv_key,
    }

def _fpuser_auth_headers(request):
    return _fpuser_auth_header_raw(request.config.cache.get("fpuser_auth_token", None))

def _my1fp_auth_headers(request):
    return _my1fp_auth_header_raw(request.config.cache.get("my1fp_auth_token", None))

def _fpuser_auth_header_raw(value):
    return {
        FPUSER_AUTH_HEADER: value
    }
def _my1fp_auth_header_raw(value):
    return {
        MY1FP_AUTH_HEADER: value
    }

def _d2p_auth_header_raw(value):
    return {
        D2P_AUTH_HEADER: value
    }

def _assert_response(response, status_code=200, msg="Incorrect status code"):
    print(response.content)
    assert response.status_code == status_code, msg
    return response.json()

def _pretty_print_json_str(o):
    print(_pretty_print_json(json.loads(o)))

def _pretty_print_json(o):
    print(json.dumps(o, indent=4, sort_keys=True))

def _b64_decode(v):
    return base64.urlsafe_b64decode(v + '=' * (-len(v) % 4))

def _b64_encode(v):
    return base64.urlsafe_b64encode(v).decode('ascii').rstrip('=')

@pytest.fixture(scope="module")
def workos_tenant():
    path = "private/client"
    data = {"name": "Acme Bank", "workos_org_id": WORKOS_ORG_ID, "email_domain": "onefootprint.com"}
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }

@pytest.fixture(scope="module")
def foo_tenant():
    path = "private/client"
    data = {"name": "foo", "workos_org_id": "bar", "email_domain": "foo.bar"}
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }

# cleanup before running in the case something crashed in the middle of execution
def test_cleanup_integration_tests_prior(request):
    path = "private/cleanup?phone_number={0}".format(PHONE_NUMBER)
    r = requests.post(
        url(path),
    )
    _assert_response(r)

def test_get_org_config(request, workos_tenant):
    path = "org/config"
    r = requests.get(
        url(path),
        headers=_client_pub_key_headers(workos_tenant["pk"]),
    )
    body = _assert_response(r)
    assert body == {'data': {'name': 'Acme Bank', 'required_user_data': ['first_name', 'last_name', 'dob', 'ssn', 'street_address', 'street_address2', 'city', 'state', 'zip', 'country', 'email', 'phone_number'], 'settings': 'Empty'}}


def test_identify_email(request):
    path = "identify"
    print(url(path))
    email = EMAIL
    request.config.cache.set("email", email)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    # First try identifying with an email. The user won't exist
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def test_identify_phone(request):
    path = "identify"
    print(url(path))
    phone_number = PHONE_NUMBER
    identifier = {"phone_number": phone_number}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def test_identify_challenge(request):
    path = "identify/challenge"
    data = {"phone_number": PHONE_NUMBER}
    print(PHONE_NUMBER)
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    request.config.cache.set("challenge_token", body["data"]["challenge_token"])


def test_identify_verify(request):
    # todo -- race conditions here
    message = twilio_client.messages.list(to=PHONE_NUMBER)[0]
    print(PHONE_NUMBER)
    code = str(re.search("\d{6}", message.body).group(0))
    print(code)
    path = "identify/verify"
    print(url(path))
    data = {
        "challenge_response": code,
        "challenge_kind": "sms",
        "challenge_token": request.config.cache.get("challenge_token", None),
    }
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_created"
    auth_token = body["data"]["auth_token"]
    request.config.cache.set("fpuser_auth_token", auth_token)

def test_onboard_init(request, workos_tenant):
    path = "onboarding"
    print(url(path))
    print(_fpuser_auth_headers(request))
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(workos_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    assert set(body["data"]["missing_attributes"]) == {"first_name", "last_name", "dob", "ssn", "street_address", "city", "state", "zip", "country", "email"}
    assert body["data"]["missing_webauthn_credentials"] == True
    
def test_user_data(request):
    ssn = _gen_random_ssn()
    request.config.cache.set("ssn", ssn)
    path = "user/data"
    data = {
        "first_name": "Flerp",
        "last_name": "Derp",
        "dob": "12-25-1995",
        "ssn": ssn,
        "street_address": "1 Footprint Way",
        "city": "Enclave",
        "state": "NY",
        "zip": "10009",
        "country": "USA",
        "email": request.config.cache.get("email", None),
    }
    print(url(path))
    r = requests.post(
        url(path),
        json=data,
        headers=_fpuser_auth_headers(request),
    )
    _assert_response(r)

    # Issue a second POST /user/data request to update some fields
    data = {
        "first_name": "Flerp2",
        "last_name": "Derp2",
    }
    print(url(path))
    r = requests.post(
        url(path),
        json=data,
        headers=_fpuser_auth_headers(request),
    )
    _assert_response(r)

def test_user_biometric(request):    
    # get challenge
    path = "user/biometric/init"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
    )    
    body = _assert_response(r)
    chal_token = body["data"]["challenge_token"];   
    chal_json = body["data"]["challenge_json"];   
 
    chal = json.loads(chal_json)
    _pretty_print_json(chal)

    # override attestation here
    chal["publicKey"]["attestation"] = 'none';
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])
    chal["publicKey"]["user"]["id"] = _b64_decode(chal["publicKey"]["user"]["id"])

    attestation = WEBAUTHN_DEVICE.create(chal, os.environ.get('TEST_URL'))
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"])
    attestation["response"]["attestationObject"] = _b64_encode(attestation["response"]["attestationObject"])

    _pretty_print_json(attestation)
    
    # get challenge
    path = "user/biometric"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
        json=dict(challenge_token=chal_token, device_response_json=json.dumps(attestation)),
    )    
    _assert_response(r)

def test_d2p(request):
    # Get new auth token in d2p/generate endpoint
    path = "onboarding/d2p/generate"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
    )
    body = _assert_response(r)
    temp_auth_token = body["data"]["auth_token"]

    # Send the d2p token to the user via SMS
    path = "onboarding/d2p/sms"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_d2p_auth_header_raw(temp_auth_token),
        json=dict(base_url="https://onefootprint.com/"),
    )
    _assert_response(r)

    def _update_status(status, status_code=200):
        path = "onboarding/d2p/status"
        print(url(path))
        r = requests.post(
            url(path),
            headers=_d2p_auth_header_raw(temp_auth_token),
            json=dict(status=status),
        )
        _assert_response(r, status_code=status_code)

    def _assert_get_status(expected_status):
        path = "onboarding/d2p/status"
        print(url(path))
        r = requests.get(
            url(path),
            headers=_d2p_auth_header_raw(temp_auth_token),
        )
        body = _assert_response(r)
        assert body["data"]["status"] == expected_status

    # Use the auth token to check the status of the d2p session
    _assert_get_status("waiting")

    # Make sure the auth token can be used to add a biometric credential
    _update_status("in_progress")

    path = "user/biometric/init"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_d2p_auth_header_raw(temp_auth_token)
    )
    body = _assert_response(r)
    assert body["data"]["challenge_token"]

    # Check that the status is updated
    _update_status("completed")
    _assert_get_status("completed")

    # Don't allow transitioning the status backwards
    _update_status("canceled", status_code=400)

    # Shouldn't be able to use the auth token to add a biometric unless it's in in_progress
    path = "user/biometric/init"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_d2p_auth_header_raw(temp_auth_token),
    )
    _assert_response(r, status_code=401)

def test_onboarding_complete(request, workos_tenant): 
    path = "onboarding/complete"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(workos_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    fp_user_id = body["data"]["footprint_user_id"]
    validation_token = body["data"]["validation_token"]

    assert body["data"]["missing_webauthn_credentials"] == False
    assert fp_user_id
    assert validation_token
    request.config.cache.set("fp_user_id", fp_user_id)

    # test the validate api call
    path = "org/validate"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_priv_key_headers(workos_tenant["sk"])),
        json= {"validation_token": validation_token },
    )
    body = _assert_response(r)
    fp_user_id2 = body["data"]["footprint_user_id"]
    status = body["data"]["status"]
    assert fp_user_id2 == fp_user_id
    assert status    

def test_identify_login_repeat_customer_biometric(request, foo_tenant):
    request.config.cache.set("fpuser_auth_token", None)  # Remove fpuser_auth_token from previous test

    # Identify the user by email
    path = "identify"
    print(url(path))
    email = request.config.cache.get("email", None)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "biometric"}
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["user_found"]
    assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
    assert body["data"]["challenge_data"]["challenge_kind"] == "biometric"
    assert body["data"]["challenge_data"]["biometric_challenge_json"]
  
    # do webauthn
    chal = json.loads(body["data"]["challenge_data"]["biometric_challenge_json"])
    _pretty_print_json(chal)

    # override chal here
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

    attestation = WEBAUTHN_DEVICE.get(chal, os.environ.get('TEST_URL'))
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["authenticatorData"] = _b64_encode(attestation["response"]["authenticatorData"] )
    attestation["response"]["signature"] = _b64_encode(attestation["response"]["signature"] )
    attestation["response"]["userHandle"] = _b64_encode(attestation["response"]["userHandle"] )
    attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"] )

    print(attestation)
    _pretty_print_json(attestation)

    # Log in as the user
    path = "identify/verify"
    print(url(path))
    data = {
        "challenge_response": json.dumps(attestation),
        "challenge_kind": "biometric",
        "challenge_token": body["data"]["challenge_data"]["challenge_token"],
    }
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_inherited"


def test_identify_repeat_customer(request, foo_tenant):
    request.config.cache.set("fpuser_auth_token", None)  # Remove fpuser_auth_token from previous test

    # Identify the user by email
    path = "identify"
    print(url(path))
    email = request.config.cache.get("email", None)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    # avoid rate-limit error
    time.sleep(20)
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["user_found"]
    assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
    assert body["data"]["challenge_data"]["challenge_kind"] == "sms"

    # Log in as the user
    path = "identify/verify"
    # todo -- race conditions here
    time.sleep(5)
    message = twilio_client.messages.list(to=PHONE_NUMBER)[0]
    print(message.body)
    code = str(re.search("\d{6}", message.body).group(0))
    print(code)
    print(url(path))
    data = {
        "challenge_response": code,
        "challenge_kind": "sms",
        "challenge_token": body["data"]["challenge_data"]["challenge_token"],
    }
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_inherited"
    auth_token = body["data"]["auth_token"]
    request.config.cache.set("fpuser_auth_token", auth_token)


    # Start onboarding for user
    path = "onboarding"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(foo_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    assert not body["data"]["missing_attributes"]

    # complete onboarding for user
    path = "onboarding/complete"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(foo_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    fp_user_id = body["data"]["footprint_user_id"]
    validation_token = body["data"]["validation_token"]
    assert fp_user_id
    assert validation_token
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert old_fp_user_id != fp_user_id, "Different tenants should have different fp_user_ids"

    # test the validate api call
    path = "org/validate"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_priv_key_headers(foo_tenant["sk"])),
        json= {"validation_token": validation_token },
    )
    body = _assert_response(r)
    fp_user_id2 = body["data"]["footprint_user_id"]
    status = body["data"]["status"]
    assert fp_user_id2 == fp_user_id
    assert status


FIELDS_TO_DECRYPT = [
    ["last_name", "ssn"],
    ["street_address"],
    ["first_name", "email", "zip", "country", "last_four_ssn"],
]
    
def test_tenant_decrypt(request, workos_tenant):
    path = "org/decrypt"
    print(url(path))
    expected_data = dict(
        first_name="Flerp2",
        last_name="Derp2",
        email=request.config.cache.get("email", None),
        street_address="1 Footprint Way",
        zip="10009",
        country="USA",
        ssn=request.config.cache.get("ssn", None),
        last_four_ssn=request.config.cache.get("ssn", None)[-4:],
    )
    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "footprint_user_id": request.config.cache.get("fp_user_id", None),
            "attributes": attributes,
            "reason": "Doing a hecking decrypt",
        }
        print(data)
        r = requests.post(
            url(path),
            headers=_client_priv_key_headers(workos_tenant["sk"]),
            json=data,
        )
        body = _assert_response(r)
        print(body)
        attributes = body["data"]
        for data_kind, value in attributes.items():
            assert expected_data[data_kind] == value
    
def test_onboardings_list(request, workos_tenant):
    # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
    # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    path = "org/onboardings?fp_user_id={old_fp_user_id}"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
    )
    body = _assert_response(r)
    onboardings = body["data"]
    assert len(onboardings)
    assert onboardings[0]["footprint_user_id"] == old_fp_user_id
    assert set(["first_name", "last_name"]) < set(onboardings[0]["populated_data_kinds"])

def test_liveness_list(request, workos_tenant):
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    path = f"org/liveness?footprint_user_id={old_fp_user_id}"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    creds = body["data"]
    assert len(creds)
    assert creds[0]["insight_event"]

def test_access_events_list(request, workos_tenant):
    fp_user_id = request.config.cache.get("fp_user_id", None)
    path = f"org/access_events?footprint_user_id={fp_user_id}"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == len(FIELDS_TO_DECRYPT)
    for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
        assert set(access_events[i]["data_kinds"]) == set(expected_fields)

    # Test filtering on kinds. We provide two different kinds, and we should get all access events
    # that contain at least one of these fields
    path = f"org/access_events?footprint_user_id={fp_user_id}&data_kinds=email,street_address"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == 2
    assert "email" in set(access_events[0]["data_kinds"])
    assert "street_address" in set(access_events[1]["data_kinds"])

    # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
    params = dict(
        timestamp_gte=arrow.utcnow().shift(days=1).isoformat()
    )
    path = f"org/access_events?{urlencode(params)}"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    assert not body["data"]

def test_my1fp_basic_auth(request):
    request.config.cache.set("my1fp_auth_token", None) 

    # Identify the user by email
    path = "identify"
    print(url(path))
    email = request.config.cache.get("email", None)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms", "identify_type": "my1fp"}

    # avoid rate-limit error
    time.sleep(20)
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["user_found"]
    assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
    assert body["data"]["challenge_data"]["challenge_kind"] == "sms"

    # Log in as the user
    path = "identify/verify"
    # todo -- race conditions here
    time.sleep(5)
    message = twilio_client.messages.list(to=PHONE_NUMBER)[0]
    print(message.body)
    code = str(re.search("\d{6}", message.body).group(0))
    print(code)
    print(url(path))
    data = {
        "challenge_response": code,
        "challenge_token": body["data"]["challenge_data"]["challenge_token"],
    }
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_inherited"
    auth_token = body["data"]["auth_token"]
    request.config.cache.set("my1fp_auth_token", auth_token)

def test_logged_in_decrypt(request):
    path = "user/decrypt"
    print(url(path))
    data = {
        "attributes": ["phone_number", "email"]
    }
    print(data)
    r = requests.post(
        url(path),
        headers=_my1fp_auth_headers(request),
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]
    assert attributes["phone_number"] == PHONE_NUMBER.replace(" ", "")
    assert attributes["email"] == request.config.cache.get("email", None)

def test_logged_in_user_detail(request):
    # Get the user detail using the logged in context
    path = f"user"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_my1fp_auth_headers(request),
    )
    body = _assert_response(r)
    user = body["data"]
    assert user["first_name"] == "Flerp2"
    assert user["last_name"] == "Derp2"

def test_logged_in_access_events(request):
    # Get the user detail using the logged in context
    path = f"user/access_events"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_my1fp_auth_headers(request),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == len(FIELDS_TO_DECRYPT)
    for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
        assert set(access_events[i]["data_kinds"]) == set(expected_fields)


def test_default_attributes(request, workos_tenant):
    config_key = workos_tenant["pk"]
    path = "org/required_data/{}".format(config_key)
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    print(workos_tenant["configuration_id"])
    body = _assert_response(r)
    attributes = set(body["data"])
    print(attributes)
    assert attributes == DEFAULT_ATTRIBUTES

def test_change_attributes(request, workos_tenant):
    config_key = workos_tenant["pk"]
    path = "org/required_data"
    attributes = ["first_name", "last_name", "phone_number", "email"]
    data = {
        "attributes": attributes,
        "configuration_key": config_key
    }
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json=data,
    )
    body = _assert_response(r)
    # make sure we changed
    get_path = path + "/" + config_key
    r = requests.get(
        url(get_path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    body = _assert_response(r)
    assert set(body["data"]) == set(attributes)
    # change back
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json= {
            "configuration_key": config_key,
            "attributes": list(DEFAULT_ATTRIBUTES)
        }
    )
    _assert_response(r)