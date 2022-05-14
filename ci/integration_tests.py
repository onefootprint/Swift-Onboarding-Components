import os
import pytest
import random
import requests

# TODO make some utils to reduce duplication

TENANT_AUTH_HEADER = "x-client-public-key"
TENANT_SECRET_HEADER = "x-client-secret-key"
TEST_CHALLENGE_CODE = "123456"


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

def _client_priv_key_headers(client_priv_key):
    return {
        TENANT_SECRET_HEADER: client_priv_key,
    }

def _parse_cookies(response):
    # TODO the requests library should do this for us, but it gets angry when we send a `Domain=.localhost` in the set-cookie header
    # This is very hacky and might break
    set_cookie_h = response.headers.get("set-cookie", None)
    if not set_cookie_h:
        return dict()
    all_cookies = set_cookie_h.split(";")[0]
    id_cookie = all_cookies.split("id=")[1]
    return {
        "id": id_cookie,
    }

def _set_cookies(request, response):
    cookies = _parse_cookies(response)
    assert cookies, "Set-Cookie response header should be provided"
    request.config.cache.set("cookies", cookies)

def _assert_no_cookies(response):
    cookies = _parse_cookies(response)
    assert not cookies, "Set-Cookie response header should not be provided"

def _assert_response(response, status_code=200, msg="Incorrect status code"):
    print(response.content)
    assert response.status_code == status_code, msg
    return response.json()

@pytest.fixture(scope="module")
def tenant1():
    path = "private/client"
    data = {"name": "integration_test_tenant1"}
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key
    }

@pytest.fixture(scope="module")
def tenant2():
    path = "private/client"
    data = {"name": "integration_test_tenant2"}
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key
    }

def test_identify_email(request):
    path = "identify/email"
    print(url(path))
    email = _gen_random_email()
    request.config.cache.set("email", email)
    data = {"email": email}

    # First try identifying with an email. The user won't exist
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"] == "user_not_found"


def test_identify_phone(request):
    path = "identify/phone"
    last_two = _gen_random_n_digit_number(2)
    phone_number = f"+1 (555) 555-01{last_two}"
    request.config.cache.set("phone_number", phone_number)
    data = {"phone_number": phone_number}
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["phone_number_last_two"] == last_two
    _set_cookies(request, r)

def test_identify_verify(request):
    path = "identify/verify"
    print(url(path))
    data = {"code": TEST_CHALLENGE_CODE}
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_created"
    _set_cookies(request, r)

def test_onboard_init(request, tenant1):
    path = "onboarding"
    print(url(path))
    r = requests.post(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant1["pk"]),
    )
    body = _assert_response(r)
    assert set(body["data"]["missing_attributes"]) == {"first_name", "last_name", "date_of_birth", "ssn", "street_address", "city", "state"}
    _assert_no_cookies(r)
    
def test_user_data(request):
    path = "user/data"
    data = {
        "first_name": "Flerp",
        "last_name": "Derp",
        "dob": "12-25-1995",
        "ssn": _gen_random_ssn(),
        "street_address": "1 Footprint Way",
        "city": "Enclave",
        "state": "NY",
        "email": request.config.cache.get("email", None),
    }
    print(url(path))
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
    )
    _assert_response(r)
    _assert_no_cookies(r)

def test_onboarding_commit(request, tenant1): 
    path = "onboarding/commit"
    print(url(path))
    r = requests.post(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant1["pk"]),
    )
    body = _assert_response(r)
    fp_user_id = body["data"]["footprint_user_id"]
    assert fp_user_id
    request.config.cache.set("fp_user_id", fp_user_id)
    _assert_no_cookies(r)

def test_identify_repeat_customer_via_email(request, tenant2):
    # Identify the user by email
    request.config.cache.set("cookies", None)  # Remove cookies from previous test
    path = "identify/email"
    print(url(path))
    email = request.config.cache.get("email", None)
    phone_number = request.config.cache.get("phone_number", None)
    data = {"email": email}
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
    )
    body = _assert_response(r)
    assert body["data"]["phone_number_last_two"] == phone_number[-2:]
    _set_cookies(request, r)

    # Log in as the user
    path = "identify/verify"
    print(url(path))
    data = {"code": "123456"}
    r = requests.post(
        url(path),
        json=data,
        cookies=request.config.cache.get("cookies", None),
    )
    body = _assert_response(r)
    assert body["data"]["kind"] == "user_inherited"
    _set_cookies(request, r)

    # Start onboarding for user
    path = "onboarding"
    print(url(path))
    r = requests.post(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant2["pk"]),
    )
    body = _assert_response(r)
    assert not body["data"]["missing_attributes"]
    _assert_no_cookies(r)

    # Commit onboarding for user
    path = "onboarding/commit"
    print(url(path))
    r = requests.post(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        headers=_client_pub_key_headers(tenant2["pk"]),
    )
    body = _assert_response(r)
    fp_user_id = body["data"]["footprint_user_id"]
    assert fp_user_id
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert old_fp_user_id != fp_user_id, "Different tenants should have different fp_user_ids"
    _assert_no_cookies(r)
    
def test_tenant_decrypt(request, tenant1):
    path = "tenant/decrypt"
    print(url(path))
    data = {
        "footprint_user_id": request.config.cache.get("fp_user_id", None),
        "attributes": ["first_name", "email"]
    }
    print(data)
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(tenant1["sk"]),  
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]["attributes"]
    assert attributes["first_name"] == "Flerp"
    assert attributes["email"] == request.config.cache.get("email", None)
    _assert_no_cookies(r)
    
def test_onboardings_list(request, tenant1):
    path = "tenant/onboardings"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(tenant1["sk"]),  
    )
    body = _assert_response(r)
    onboardings = body["data"]["onboardings"]
    assert len(onboardings) == 1
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert onboardings[0]["fp_user_id"] == old_fp_user_id

def test_access_events_list(request, tenant1):
    fp_user_id = request.config.cache.get("fp_user_id", None)
    path = f"tenant/access_events?footprint_user_id={fp_user_id}"
    print(url(path))
    r = requests.get(
        url(path),
        cookies=request.config.cache.get("cookies", None),        
        headers=_client_priv_key_headers(tenant1["sk"]),  
    )
    body = _assert_response(r)
    access_events = body["data"]["events"]
    assert len(access_events) == 2
    assert set(i["data_kind"] for i in access_events) == {"first_name", "email"}
    _assert_no_cookies(r)

    # Test filtering on kind
    path = f"tenant/access_events?footprint_user_id={fp_user_id}&data_kind=email"
    r = requests.get(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        headers=_client_priv_key_headers(tenant1["sk"]),
    )
    body = _assert_response(r)
    access_events = body["data"]["events"]
    assert len(access_events) == 1
    assert access_events[0]["data_kind"] == "email"
    _assert_no_cookies(r)

def test_logged_in_user_detail(request):
    # Get the user detail using the logged in context
    path = f"user"
    print(url(path))
    r = requests.get(
        url(path),
        cookies=request.config.cache.get("cookies", None),
    )
    body = _assert_response(r)
    user = body["data"]
    assert user["first_name"] == "Flerp"
    assert user["last_name"] == "Derp"
    _assert_no_cookies(r)

def test_logged_in_access_events(request):
    # Get the user detail using the logged in context
    path = f"user/access_events"
    print(url(path))
    r = requests.get(
        url(path),
        cookies=request.config.cache.get("cookies", None),
    )
    body = _assert_response(r)
    access_events = body["data"]["events"]
    assert len(access_events) == 2
    assert set(i["data_kind"] for i in access_events) == {"first_name", "email"}
    _assert_no_cookies(r)

def test_logged_in_decrypt(request, tenant1):
    path = "user/decrypt"
    print(url(path))
    data = {
        "attributes": ["phone_number", "email"]
    }
    print(data)
    r = requests.post(
        url(path),
        cookies=request.config.cache.get("cookies", None),
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]["attributes"]
    assert attributes["phone_number"][-4:] == request.config.cache.get("phone_number", None)[-4:]
    assert attributes["email"] == request.config.cache.get("email", None)
    _assert_no_cookies(r)