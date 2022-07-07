
import json
import os
import re
import requests
from twilio.rest import Client

from tests.constants import EMAIL, PHONE_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_KEY_SECRET
from tests.utils import _assert_response, _b64_decode, _b64_encode, _client_priv_key_headers, _client_pub_key_headers, _d2p_auth_header_raw, _fpuser_auth_headers, _gen_random_ssn, _pretty_print_json, try_until_success, url
from tests.webauthn_simulator import SoftWebauthnDevice


twilio_client = Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)
WEBAUTHN_DEVICE = SoftWebauthnDevice()

def test_identify_email(request):
    path = "identify"
    
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
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    request.config.cache.set("challenge_token", body["data"]["challenge_token"])


def test_identify_verify(request):
    def identify_verify():
        message = twilio_client.messages.list(to=PHONE_NUMBER, limit=1)[0]
        code = str(re.search("\d{6}", message.body).group(0))
        path = "identify/verify"
        
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
    try_until_success(identify_verify, 5)

def test_onboard_init(request, workos_tenant):
    path = "onboarding"
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
    
    r = requests.post(
        url(path),
        json=data,
        headers=_fpuser_auth_headers(request),
    )
    _assert_response(r)

def test_user_biometric(request):    
    # get challenge
    path = "user/biometric/init"
    
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
    )    
    body = _assert_response(r)
    chal_token = body["data"]["challenge_token"];   
    chal_json = body["data"]["challenge_json"];   
 
    chal = json.loads(chal_json)

    # override attestation here
    chal["publicKey"]["attestation"] = 'none';
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])
    chal["publicKey"]["user"]["id"] = _b64_decode(chal["publicKey"]["user"]["id"])

    attestation = WEBAUTHN_DEVICE.create(chal, os.environ.get('TEST_URL'))
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"])
    attestation["response"]["attestationObject"] = _b64_encode(attestation["response"]["attestationObject"])
    
    # get challenge
    path = "user/biometric"
    
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
        json=dict(challenge_token=chal_token, device_response_json=json.dumps(attestation)),
    )    
    _assert_response(r)

def test_d2p(request):
    # Get new auth token in d2p/generate endpoint
    path = "onboarding/d2p/generate"
    
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
    )
    body = _assert_response(r)
    temp_auth_token = body["data"]["auth_token"]

    # Send the d2p token to the user via SMS
    path = "onboarding/d2p/sms"
    
    r = requests.post(
        url(path),
        headers=_d2p_auth_header_raw(temp_auth_token),
        json=dict(base_url="https://onefootprint.com/"),
    )
    _assert_response(r)

    def _update_status(status, status_code=200):
        path = "onboarding/d2p/status"
        
        r = requests.post(
            url(path),
            headers=_d2p_auth_header_raw(temp_auth_token),
            json=dict(status=status),
        )
        _assert_response(r, status_code=status_code)

    def _assert_get_status(expected_status):
        path = "onboarding/d2p/status"
        
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
    
    r = requests.post(
        url(path),
        headers=_d2p_auth_header_raw(temp_auth_token),
    )
    _assert_response(r, status_code=401)

def test_onboarding_complete(request, workos_tenant): 
    path = "onboarding/complete"
    
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

    # override chal here
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

    attestation = WEBAUTHN_DEVICE.get(chal, os.environ.get('TEST_URL'))
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["authenticatorData"] = _b64_encode(attestation["response"]["authenticatorData"] )
    attestation["response"]["signature"] = _b64_encode(attestation["response"]["signature"] )
    attestation["response"]["userHandle"] = _b64_encode(attestation["response"]["userHandle"] )
    attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"] )

    # Log in as the user
    path = "identify/verify"
    
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
    email = request.config.cache.get("email", None)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    def identify():
        r = requests.post(
            url(path),
            json=data,
        )
        body = _assert_response(r)
        assert body["data"]["user_found"]
        assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
        assert body["data"]["challenge_data"]["challenge_kind"] == "sms"
        return body["data"]["challenge_data"]["challenge_token"]
    challenge_token = try_until_success(identify, 20)

    # Log in as the user
    def identify_verify():
        message = twilio_client.messages.list(to=PHONE_NUMBER, limit=1)[0]
        code = str(re.search("\d{6}", message.body).group(0))
        path = "identify/verify"
        data = {
            "challenge_response": code,
            "challenge_kind": "sms",
            "challenge_token": challenge_token,
        }
        r = requests.post(
            url(path),
            json=data,
        )
        body = _assert_response(r)
        assert body["data"]["kind"] == "user_inherited"
        auth_token = body["data"]["auth_token"]
        request.config.cache.set("fpuser_auth_token", auth_token)
    try_until_success(identify_verify, 5)

    # Start onboarding for user
    path = "onboarding"
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(foo_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    assert not body["data"]["missing_attributes"]

    # complete onboarding for user
    path = "onboarding/complete"
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