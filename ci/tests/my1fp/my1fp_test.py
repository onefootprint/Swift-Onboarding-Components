
import re
import requests
from tests.constants import FIELDS_TO_DECRYPT, EMAIL, PHONE_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_KEY_SECRET

from tests.utils import _assert_response, _my1fp_auth_headers, try_until_success, url

from twilio.rest import Client

twilio_client = Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)

def test_my1fp_basic_auth(request):
    request.config.cache.set("my1fp_auth_token", None) 

    # Identify the user by email
    path = "identify"
    email = EMAIL
    identifier = {"email": email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms", "identify_type": "my1fp"}

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
    challenge_token = try_until_success(identify, 20, 1)

    # Log in as the user
    def identify_verify():
        message = twilio_client.messages.list(to=PHONE_NUMBER, limit=1)[0]
        code = str(re.search("\d{6}", message.body).group(0))
        path = "identify/verify"
        data = {
            "challenge_response": code,
            "challenge_token": challenge_token,
        }
        r = requests.post(
            url(path),
            json=data,
        )
        body = _assert_response(r)
        assert body["data"]["kind"] == "user_inherited"
        auth_token = body["data"]["auth_token"]
        request.config.cache.set("my1fp_auth_token", auth_token)
    try_until_success(identify_verify, 5)


def test_logged_in_decrypt(request):
    path = "user/decrypt"
    data = {
        "attributes": ["phone_number", "email", "street_address", "zip"]
    }
    r = requests.post(
        url(path),
        headers=_my1fp_auth_headers(request),
        json=data,
    )
    body = _assert_response(r)
    attributes = body["data"]
    assert attributes["phone_number"] == PHONE_NUMBER.replace(" ", "")
    assert attributes["email"] == EMAIL
    assert attributes["street_address"] == "1 FOOTPRINT WAY"
    assert attributes["zip"] == "10009"


def test_unauthorized_my1fp_basic_session_decrypt(request):
    path = "user/decrypt"
    data = {
        "attributes": ["ssn"]
    }
    r = requests.post(
        url(path),
        headers=_my1fp_auth_headers(request),
        json=data,
    )
    assert r.status_code == 401


def test_logged_in_user_detail(request):
    # Get the user detail using the logged in context
    path = f"user"
    r = requests.get(
        url(path),
        headers=_my1fp_auth_headers(request),
    )
    body = _assert_response(r)
    user = body["data"]
    assert user["first_name"] == "FLERP2"
    assert user["last_name"] == "DERP2"

def test_logged_in_access_events(request):
    # Get the user detail using the logged in context
    path = f"user/access_events"
    r = requests.get(
        url(path),
        headers=_my1fp_auth_headers(request),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == len(FIELDS_TO_DECRYPT)
    for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
        assert set(access_events[i]["data_kinds"]) == set(expected_fields)
