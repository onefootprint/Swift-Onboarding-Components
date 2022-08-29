import pytest

from tests.auth import FpAuth
from tests.constants import FIELDS_TO_DECRYPT

from tests.utils import try_until_success, post, get, identify_verify


@pytest.fixture(scope="module")
def my1fp_authed_user(user, twilio):
    """
    Returns a user authed under a my1fp scope
    """
    # Identify the user by email
    identifier = {"email": user.email}
    data = dict(
        identifier=identifier, preferred_challenge_kind="sms", identify_type="my1fp"
    )

    def identify():
        body = post("hosted/identify", data)
        assert body["user_found"]
        assert (
            body["challenge_data"]["phone_number_last_two"]
            == user.real_phone_number[-2:]
        )
        assert body["challenge_data"]["challenge_kind"] == "sms"
        return body["challenge_data"]["challenge_token"]

    challenge_token = try_until_success(identify, 20, 1)

    # Log in as the user
    my1fp_auth_token = try_until_success(
        lambda: identify_verify(
            twilio,
            user.real_phone_number,
            challenge_token,
            expected_kind="user_inherited",
        ),
        5,
    )
    return user._replace(auth_token=my1fp_auth_token)


class TestMy1fp:
    def test_decrypt(self, my1fp_authed_user):
        data = {"attributes": ["phone_number", "email", "address_line1", "zip"]}
        body = post("hosted/user/decrypt", data, my1fp_authed_user.auth_token)
        attributes = body
        assert attributes["phone_number"] == my1fp_authed_user.phone_number.replace(
            " ", ""
        )
        assert attributes["email"].upper() == my1fp_authed_user.email.upper()
        assert attributes["address_line1"].upper() == "1 FOOTPRINT WAY"
        assert attributes["zip"] == "10009"

    def test_unauthorized_my1fp_basic_session_decrypt(self, my1fp_authed_user):
        return
        # TODO Re-instate this test after we differentiate between basic and step-up auth
        data = {"attributes": ["ssn9"]}
        post("hosted/user/decrypt", data, my1fp_authed_user.auth_token, status_code=401)

    def test_user_detail(self, my1fp_authed_user):
        # Get the user detail using the logged in context
        body = get("hosted/user", None, my1fp_authed_user.auth_token)
        phone_numbers = body["phone_numbers"]
        assert phone_numbers[0]["is_verified"]
        assert phone_numbers[0]["priority"] == "primary"
        emails = body["emails"]
        assert not emails[0]["is_verified"]
        assert emails[0]["priority"] == "primary"

    def test_authorized_tenants(self, my1fp_authed_user, can_access_data):
        # Get the user detail using the logged in context
        body = get("hosted/user/authorized_orgs", None, my1fp_authed_user.auth_token)
        authorized_orgs = body

        onboarding_info = authorized_orgs[0]["onboardings"][0]
        assert onboarding_info["name"] == "Acme Bank Card"
        assert onboarding_info["insight_event"]
        assert set(onboarding_info["can_access_data"]) == set(can_access_data)

    def test_access_events(self, my1fp_authed_user):
        tenant = my1fp_authed_user.tenant
        # Decrypt as the tenant in order to generate some access events
        for attributes in FIELDS_TO_DECRYPT:
            data = {
                "fields": attributes,
                "reason": "Doing a hecking decrypt",
            }
            post(f"users/{my1fp_authed_user.fp_user_id}/identity/decrypt", data, tenant.sk.key)

        # Get the user detail using the logged in context
        body = get("hosted/user/access_events", None, my1fp_authed_user.auth_token)
        access_events = body
        assert len(access_events) == len(FIELDS_TO_DECRYPT)
        for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
            assert set(access_events[i]["data_kinds"]) == set(expected_fields)
