import os
import pytest
import random
import requests

# TODO make some utils to reduce duplication

TENANT_AUTH_HEADER = "x-client-public-key"

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _gen_random_email():
    return f"user_{_gen_random_n_digit_number(7)}@onefootprint.com"

def _gen_random_ssn():
    return _gen_random_n_digit_number(9)

def _client_pub_key_headers(client_public_key):
    return {
        TENANT_AUTH_HEADER: client_public_key,
    }

@pytest.fixture(scope="module")
def tenant1():
    path = "private/client"
    data = {"name": "integration_test_tenant1"}
    r = requests.post(url(path), json=data)
    assert(r.status_code == 200)
    client_public_key = r.json()["data"]["keys"]["client_public_key"]
    print(client_public_key)
    return client_public_key

@pytest.fixture(scope="module")
def tenant2():
    path = "private/client"
    data = {"name": "integration_test_tenant2"}
    r = requests.post(url(path), json=data)
    assert(r.status_code == 200)
    client_public_key = r.json()["data"]["keys"]["client_public_key"]
    return client_public_key

def test_identify_init(tenant1, request):
    path = "identify"
    print(url(path))
    email = _gen_random_email()
    request.config.cache.set("email", email)
    data = {"email": email}

    # First try identifying with an email. The user won't exist
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant1),
    )
    print(r, r.content)
    assert r.status_code == 200
    assert r.json()["data"] == "user_not_found"
    cookies = r.cookies.get_dict()
    assert cookies, "Set-Cookie response header should be provided"
    request.config.cache.set("cookies", cookies)


def test_challenge(request):
    path = "identify/challenge"
    last_two = _gen_random_n_digit_number(2)
    phone_number = f"+1 (555) 555-01{last_two}"
    request.config.cache.set("phone_number", phone_number)
    data = {"phone_number": phone_number}
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
    )
    print(r, r.content)
    assert r.status_code == 200
    assert r.json()["data"]["phone_number_last_two"] == last_two
    cookies = r.cookies.get_dict()
    assert cookies, "Set-Cookie response header should be provided"
    request.config.cache.set("cookies", cookies)
    print(cookies)

def test_identify_verify(request):
    path = "identify/verify"
    print(url(path))
    data = {"code": "123456"}
    r = requests.post(url(path), json=data, cookies=request.config.cache.get("cookies", None))
    print(r, r.content)
    assert r.status_code == 200
    print(r.cookies.get_dict())
    assert r.json()["data"]["kind"] == "user_created"
    cookies = r.cookies.get_dict()
    request.config.cache.set("cookies", cookies)
    assert cookies, "Set-Cookie response header should be provided"
    
def test_identify_data(request): 
    path = "identify/data"
    data = {
        "first_name": "Flerp",
        "last_name": "Derp",
        "dob": "12-25-1995",
        "ssn": _gen_random_ssn(),
        "street_address": "1 Footprint Way",
        "city": "Enclave",
        "state": "NY",
    }
    print(url(path))
    r = requests.post(url(path), json=data, cookies=request.config.cache.get("cookies", None))
    print(r.content)
    assert r.status_code == 200
    print(r.cookies.get_dict())
    cookies = r.cookies.get_dict()
    assert not cookies, "Set-Cookie response header should not be provided"

def test_identify_commit(request): 
    path = "identify/commit"
    print(url(path))
    r = requests.post(url(path), cookies=request.config.cache.get("cookies", None))
    print(r.content)
    assert r.status_code == 200
    fp_user_id = r.json()["data"]["footprint_user_id"]
    assert fp_user_id
    request.config.cache.set("cookies", r.cookies.get_dict())
    request.config.cache.set("fp_user_id", fp_user_id)
    cookies = r.cookies.get_dict()
    assert not cookies, "Set-Cookie response header should not be provided"

def test_identify_repeat_customer_via_email(request, tenant2):
    # Identify the user by email
    request.config.cache.set("cookies", None)  # Remove cookies from previous test
    path = "identify"
    print(url(path))
    email = request.config.cache.get("email", None)
    phone_number = request.config.cache.get("phone_number", None)
    data = {"email": email}
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant2),
    )
    print(r, r.content)
    assert r.status_code == 200
    assert r.json()["data"]["phone_number_last_two"] == phone_number[-2:]
    cookies = r.cookies.get_dict()
    assert cookies, "Set-Cookie response header should be provided"
    request.config.cache.set("cookies", cookies)

def test_identify_verify_repeat_customer(request):
    path = "identify/verify"
    print(url(path))
    data = {"code": "123456"}
    r = requests.post(url(path), json=data, cookies=request.config.cache.get("cookies", None))
    print(r, r.content)
    assert r.status_code == 200
    assert r.json()["data"]["kind"] == "user_inherited"
    cookies = r.cookies.get_dict()
    assert cookies, "Set-Cookie response header should be provided"
    request.config.cache.set("cookies", cookies)

def test_identify_commit_repeat_customer(request):
    path = "identify/commit"
    print(url(path))
    r = requests.post(url(path), cookies=request.config.cache.get("cookies", None))
    print(r.content)
    assert r.status_code == 200
    fp_user_id = r.json()["data"]["footprint_user_id"]
    assert fp_user_id
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert old_fp_user_id != fp_user_id, "Different tenants should have different fp_user_ids"
    cookies = r.cookies.get_dict()
    assert not cookies, "Set-Cookie response header should not be provided"