import os
import pytest
import random
import requests

TENANT_AUTH_HEADER = "x-client-public-key"
TENANT_USER_TOKEN_HEADER = "x-onboarding-session-token"

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def _gen_random_phone_number():
    return "".join([str(random.randint(0, 9)) for _ in range(7)])

def _client_pub_key_headers(request):
    client_public_key = request.config.cache.get("client_public_key", None)
    assert "Expected client_public_key config to be set"
    return {
        TENANT_AUTH_HEADER: client_public_key,
    }

def _onboarding_session_token_headers(request):
    onboarding_session_token = request.config.cache.get("onboarding_session_token", None)
    assert "Expected onboarding_session_token config to be set"
    return {
        TENANT_USER_TOKEN_HEADER: onboarding_session_token,
    }

def test_create_tenant(request):
    test_tenant_name = "integration_test_tenant"
    path = "private/client/init/{}".format(test_tenant_name)
    r = requests.post(url(path))
    assert(r.status_code == 200)
    # save tenant id
    client_id = r.json()["data"]["client_id"]
    request.config.cache.set("client_id", client_id)

def test_create_tenant_api_keys(request):
    test_api_key_name = "integration_test_api_key"
    path = "private/client//{}/api-key/init/{}".format(request.config.cache.get("client_id", None), test_api_key_name)
    r = requests.post(url(path))
    print(r.content)
    assert(r.status_code == 200)
    # save public api key
    client_public_key = r.json()["data"]["client_public_key"]
    request.config.cache.set("client_public_key", client_public_key)

def test_init_user(request):
    path = "onboarding"
    print(url(path))
    r = requests.post(url(path), headers=_client_pub_key_headers(request))
    print(r)
    print(r.content)
    assert(r.status_code == 200)
    # save temporary user token & user id
    onboarding_session_token = r.json()["data"]["onboarding_session_token"]
    request.config.cache.set("onboarding_session_token", onboarding_session_token)

def test_user_patch(request): 
    path = "onboarding/data"
    random_phone_number = _gen_random_phone_number()
    request.config.cache.set("phone_number", random_phone_number)
    fmt_phone_number = f"+1 (555) {random_phone_number[:3]}-{random_phone_number[3:]}"
    data = {"first_name": "Flerp", "phone_number": fmt_phone_number}
    print(url(path))
    r = requests.post(url(path), json=data, headers=_onboarding_session_token_headers(request))
    print(r.content)
    assert(r.status_code == 200)

def test_challenge_create(request):
    path = "onboarding/challenge"
    print(url(path))
    data = {"kind": "sms"}
    r = requests.post(url(path), json=data, headers=_onboarding_session_token_headers(request))
    print(r, r.content)
    assert(r.status_code == 200)  # TODO 201

def test_identify(request):
    phone_number = request.config.cache.get("phone_number", None)
    other_fmt_phone_number = f"+1-555-{phone_number[:3]}-{phone_number[3:]}"
    path = "onboarding/identify"
    print(url(path))
    data = {"phone_number": other_fmt_phone_number}
    r = requests.post(url(path), json=data, headers=_client_pub_key_headers(request))
    print(r, r.content)
    assert(r.status_code == 200)
    assert r.json()["data"]["kind"] == "challenge_initiated"

    # Fingerprint of random phone number not found
    random_phone_number = _gen_random_phone_number()
    fmt_phone_number = f"+1-555-{random_phone_number[:3]}-{random_phone_number[3:]}"
    data = {"phone_number": fmt_phone_number}
    r = requests.post(url(path), json=data, headers=_client_pub_key_headers(request))
    print(r, r.content)
    assert(r.status_code == 200)
    assert r.json()["data"]["kind"] == "no_user_found"

# Test identify endpoint

# TODO find a way to test challenge verify - may need to mock out sending/receiving SMS