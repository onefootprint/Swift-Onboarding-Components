import os
import pytest
import random
import requests

TENANT_AUTH_HEADER = "x-client-public-key"

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def _gen_random_phone_number():
    return "".join([str(random.randint(0, 9)) for _ in range(7)])

def _client_pub_key_headers(request):
    client_public_key = request.config.cache.get("client_public_key", None)
    assert "Expected client_public_key config to be set"
    return {
        TENANT_AUTH_HEADER: client_public_key,
    }

def test_create_tenant(request):    
    path = "private/client"
    data = {"name": "integration_test_tenant"}
    r = requests.post(url(path), json=data)
    assert(r.status_code == 200)
    # save tenant id
    client_id = r.json()["data"]["client_id"]
    request.config.cache.set("client_id", client_id)
    client_public_key = r.json()["data"]["keys"]["client_public_key"]
    request.config.cache.set("client_public_key", client_public_key)

def test_init_user(request):
    path = "onboarding"
    print(url(path))
    r = requests.post(url(path), headers=_client_pub_key_headers(request))
    print(r)
    print(r.content)
    assert(r.status_code == 200)

    # save temporary user token & user id
    request.config.cache.set("cookies", r.cookies.get_dict())

def test_user_patch(request): 
    path = "onboarding/data"
    random_phone_number = _gen_random_phone_number()
    request.config.cache.set("phone_number", random_phone_number)
    fmt_phone_number = f"+1 (555) {random_phone_number[:3]}-{random_phone_number[3:]}"
    data = {"first_name": "Flerp", "phone_number": fmt_phone_number}
    print(url(path))
    r = requests.post(url(path), json=data, cookies=request.config.cache.get("cookies", None))
    print(r.content)
    assert(r.status_code == 200)

def test_challenge_create(request):
    path = "onboarding/challenge"
    print(url(path))
    data = {"kind": "sms", "data": request.config.cache.get("phone_number", None)}
    r = requests.post(url(path), json=data, cookies=request.config.cache.get("cookies", None))
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

    # Fingerprint of random phone number not found
    random_phone_number = _gen_random_phone_number()
    fmt_phone_number = f"+1-555-{random_phone_number[:3]}-{random_phone_number[3:]}"
    data = {"phone_number": fmt_phone_number}
    r = requests.post(url(path), json=data, headers=_client_pub_key_headers(request))
    print(r, r.content)
    assert(r.status_code == 200)

# Test identify endpoint

# TODO find a way to test challenge verify - may need to mock out sending/receiving SMS