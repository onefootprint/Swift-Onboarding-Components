import pytest

import re
from tests.auth import My1fpAuth
from tests.constants import FIELDS_TO_DECRYPT

from tests.utils import try_until_success, post, get

"""
Returns a user authed under a my1fp scope
"""
@pytest.fixture(scope="module")
def my1fp_authed_user(user, twilio):
    # Identify the user by email
    identifier = {"email": user.email}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms", "identify_type": "my1fp"}

    def identify():
        body = post("identify", data)
        assert body["data"]["user_found"]
        assert body["data"]["challenge_data"]["phone_number_last_two"] == user.real_phone_number[-2:]
        assert body["data"]["challenge_data"]["challenge_kind"] == "sms"
        return body["data"]["challenge_data"]["challenge_token"]
    challenge_token = try_until_success(identify, 20, 1)

    # Log in as the user
    def identify_verify():
        message = twilio.messages.list(to=user.real_phone_number, limit=1)[0]
        code = str(re.search("\\d{6}", message.body).group(0))
        data = {
            "challenge_response": code,
            "challenge_token": challenge_token,
        }
        body = post("identify/verify", data)
        assert body["data"]["kind"] == "user_inherited"
        return body["data"]["auth_token"]
    my1fp_auth_token = try_until_success(identify_verify, 5)
    return user._replace(auth_token=My1fpAuth(my1fp_auth_token))


class TestMy1fp:
    def test_logged_in_decrypt(self, my1fp_authed_user):
        data = {
            "attributes": ["phone_number", "email", "street_address", "zip"]
        }
        body = post("user/decrypt", data, my1fp_authed_user.auth_token)
        attributes = body["data"]
        assert attributes["phone_number"] == my1fp_authed_user.phone_number.replace(" ", "")
        assert attributes["email"].upper() == my1fp_authed_user.email.upper()
        assert attributes["street_address"].upper() == "1 FOOTPRINT WAY"
        assert attributes["zip"] == "10009"

    def test_unauthorized_my1fp_basic_session_decrypt(self, my1fp_authed_user):
        data = {
            "attributes": ["ssn"]
        }
        post("user/decrypt", data, my1fp_authed_user.auth_token, status_code=401)

    def test_logged_in_user_detail(self, my1fp_authed_user):
        # Get the user detail using the logged in context
        body = get("user", None, my1fp_authed_user.auth_token)
        user = body["data"]
        assert user["first_name"].upper() == my1fp_authed_user.first_name.upper()
        assert user["last_name"].upper() == my1fp_authed_user.last_name.upper()

    def test_logged_in_user_onboardings(self, my1fp_authed_user, can_access_data_kinds):
        # Get the user detail using the logged in context
        body = get("user/onboardings", None, my1fp_authed_user.auth_token)
        onboardings = body["data"]

        onboarding_info = onboardings[0]["onboarding_links"][0]
        assert onboarding_info["name"] == "Acme Bank Card"
        assert onboarding_info["insight_event"]
        assert set(onboarding_info["can_access_data_kinds"]) == set(can_access_data_kinds)
        
    def test_logged_in_access_events(self, my1fp_authed_user):
        tenant = my1fp_authed_user.tenant
        # Decrypt as the tenant in order to generate some access events
        for attributes in FIELDS_TO_DECRYPT:
            data = {
                "footprint_user_id": my1fp_authed_user.fp_user_id,
                "attributes": attributes,
                "reason": "Doing a hecking decrypt",
            }
            post("org/decrypt", data, tenant.sk)

        # Get the user detail using the logged in context
        body = get("user/access_events", None, my1fp_authed_user.auth_token)
        access_events = body["data"]
        assert len(access_events) == len(FIELDS_TO_DECRYPT)
        for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
            assert set(access_events[i]["data_kinds"]) == set(expected_fields)