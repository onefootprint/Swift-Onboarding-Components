import os
import pytest
import random
import requests

# TODO make some utils to reduce duplication

TENANT_AUTH_HEADER = "x-client-public-key"
TENANT_SECRET_HEADER = "x-client-secret-key"
FPUSER_AUTH_HEADER = "x-fpuser-authorization"
TEST_CHALLENGE_CODE = "123456"
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

def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _gen_random_email():
    return f"user_{_gen_random_n_digit_number(7)}@onefootprint.com"

def _gen_random_phone_number():
    last_two = _gen_random_n_digit_number(2)
    return f"+1 (555) 555-01{last_two}"

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

def _fpuser_auth_header_raw(value):
    return {
        FPUSER_AUTH_HEADER: value
    }

def _assert_response(response, status_code=200, msg="Incorrect status code"):
    print(response.content)
    assert response.status_code == status_code, msg
    return response.json()

@pytest.fixture(scope="module")
def workos_tenant():
    path = "private/client"
    data = {"name": "workos_tenant", "workos_org_id": WORKOS_ORG_ID, "email_domain": "onefootprint.com"}
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key
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
        "sk": client_secret_key
    }

def test_identify_email(request):
    path = "identify"
    print(url(path))
    email = _gen_random_email()
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
    phone_number = _gen_random_phone_number()
    request.config.cache.set("phone_number", phone_number)
    identifier = {"phone_number": phone_number}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    # First try identifying with an email. The user won't exist
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def test_identify_challenge(request):
    path = "identify/challenge"
    phone_number = request.config.cache.get("phone_number", None)
    data = {"phone_number": phone_number}
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    request.config.cache.set("challenge_token", body["data"]["challenge_token"])


def test_identify_verify(request):
    path = "identify/verify"
    print(url(path))
    data = {
        "challenge_response": TEST_CHALLENGE_CODE,
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
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(workos_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    assert set(body["data"]["missing_attributes"]) == {"first_name", "last_name", "dob", "ssn", "street_address", "city", "state", "zip", "country", "email"}
    assert body["data"]["missing_webauthn_credentials"] == True
    
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

    # Make sure the auth token can be used to add a biometric credential
    path = "user/biometric/init"
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_header_raw(temp_auth_token),
    )
    body = _assert_response(r)
    assert body["data"]["challenge_token"]

    # Use the auth token to check the status of the d2p session
    path = "onboarding/d2p/status"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_fpuser_auth_header_raw(temp_auth_token),
    )
    body = _assert_response(r)
    assert body["data"]["status"] == "waiting"

    # Update the status of the d2p session
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_header_raw(temp_auth_token),
        json=dict(status="completed"),
    )
    body = _assert_response(r)

    # Check that the status is updated
    path = "onboarding/d2p/status"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_fpuser_auth_header_raw(temp_auth_token),
    )
    body = _assert_response(r)
    assert body["data"]["status"] == "completed"

    # Don't allow transitioning the status backwards
    print(url(path))
    r = requests.post(
        url(path),
        headers=_fpuser_auth_header_raw(temp_auth_token),
        json=dict(status="canceled"),
    )
    body = _assert_response(r, status_code=400)

def test_onboarding_complete(request, workos_tenant): 
    path = "onboarding/complete"
    print(url(path))
    r = requests.post(
        url(path),
        headers=dict(**_client_pub_key_headers(workos_tenant["pk"]), **_fpuser_auth_headers(request)),
    )
    body = _assert_response(r)
    fp_user_id = body["data"]["footprint_user_id"]
    assert body["data"]["missing_webauthn_credentials"] == True
    assert fp_user_id
    request.config.cache.set("fp_user_id", fp_user_id)

def test_identify_repeat_customer(request, foo_tenant):
    request.config.cache.set("fpuser_auth_token", None)  # Remove fpuser_auth_token from previous test

    # Identify the user by email
    path = "identify"
    print(url(path))
    email = request.config.cache.get("email", None)
    phone_number = request.config.cache.get("phone_number", None)
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["user_found"]
    assert body["data"]["challenge_data"]["phone_number_last_two"] == phone_number[-2:]
    assert body["data"]["challenge_data"]["challenge_kind"] == "sms"

    # Now test identifying the user by phone number. Ask for a biometric challenge, which should
    # fall through to an SMS challenge since the user doesn't have webauthn credentials
    identifier = {"phone_number": phone_number}
    data = {"identifier": identifier, "preferred_challenge_kind": "biometric"}
    r = requests.post(
        url(path),
        json=data,
    )
    body = _assert_response(r)
    assert body["data"]["user_found"]
    assert body["data"]["challenge_data"]["phone_number_last_two"] == phone_number[-2:]
    assert body["data"]["challenge_data"]["challenge_kind"] == "sms"

    # Log in as the user
    path = "identify/verify"
    print(url(path))
    data = {
        "challenge_response": TEST_CHALLENGE_CODE,
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
    assert fp_user_id
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert old_fp_user_id != fp_user_id, "Different tenants should have different fp_user_ids"
    
def test_tenant_decrypt(request, workos_tenant):
    path = "org/decrypt"
    print(url(path))
    data = {
        "footprint_user_id": request.config.cache.get("fp_user_id", None),
        "attributes": ["first_name", "email", "zip", "country"]
    }
    print(data)
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]
    assert attributes["first_name"] == "Flerp2"
    assert attributes["zip"] == "10009"
    assert attributes["country"] == "USA"
    assert attributes["email"] == request.config.cache.get("email", None)
    
def test_onboardings_list(request, workos_tenant):
    path = "org/onboardings"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
    )
    body = _assert_response(r)
    onboardings = body["data"]
    assert len(onboardings)
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    assert onboardings[0]["footprint_user_id"] == old_fp_user_id

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
    assert len(access_events) == 4
    assert set(i["data_kind"] for i in access_events) == {"first_name", "email", "zip", "country"}

    # Test filtering on kind
    path = f"org/access_events?footprint_user_id={fp_user_id}&data_kind=email"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == 1
    assert access_events[0]["data_kind"] == "email"

def test_logged_in_user_detail(request):
    # Get the user detail using the logged in context
    path = f"user"
    print(url(path))
    r = requests.get(
        url(path),
        headers=_fpuser_auth_headers(request),
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
        headers=_fpuser_auth_headers(request),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == 4
    assert set(i["data_kind"] for i in access_events) == {"first_name", "email", "zip", "country"}

def test_logged_in_decrypt(request):
    path = "user/decrypt"
    print(url(path))
    data = {
        "attributes": ["phone_number", "email"]
    }
    print(data)
    r = requests.post(
        url(path),
        headers=_fpuser_auth_headers(request),
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]
    assert attributes["phone_number"][-4:] == request.config.cache.get("phone_number", None)[-4:]
    assert attributes["email"] == request.config.cache.get("email", None)

def test_default_attributes(request, workos_tenant):
    path = "org/required_data"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    body = _assert_response(r)
    attributes = set(body["data"])
    print(attributes)
    assert attributes == DEFAULT_ATTRIBUTES

def test_change_attributes(request, workos_tenant):
    path = "org/required_data"
    attributes = ["first_name", "last_name", "phone_number", "email"]
    data = {
        "attributes": attributes
    }
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json=data,
    )
    body = _assert_response(r)
    # make sure we changed
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    body = _assert_response(r)
    assert set(body["data"]) == set(attributes)
    # change back
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json={
            "attributes": list(DEFAULT_ATTRIBUTES)
        }
    )
    _assert_response(r)

