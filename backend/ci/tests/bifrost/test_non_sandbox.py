import pytest
import time
import arrow
import re

from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth
from tests.utils import (
    get,
    post,
    patch,
    get_requirement_from_requirements,
    try_until_success,
    HttpError,
    NotRetryableException,
)
from tests.constants import EMAIL


def identify_verify_real_sms(
    twilio,
    phone_number,
    challenge_data,
    scope,
    expected_error=None,
):
    def verify(code):
        data = {
            "challenge_response": code,
            "challenge_kind": "sms",
            "challenge_token": challenge_data["challenge_token"],
            "scope": scope,
        }
        token = FpAuth(challenge_data["token"])
        body = post("hosted/identify/verify", data, token)
        return FpAuth(body["auth_token"])

    def inner():
        print(
            f"At {arrow.now().isoformat()}, looking for 2fac code sent to {phone_number}"
        )
        messages = twilio.messages.list(to=phone_number, limit=10)
        first_error = None
        for message in messages:
            code = re.search("\\d{6}", message.body).group(0)
            if not code:
                print("No code in message", message.body)
                # No code in this message, move on
                continue

            result = None
            try:
                print(f"Trying {code}")
                result = verify(code)
            except HttpError as e:
                print("  Got error:", e)
                if expected_error and expected_error in str(e):
                    # The specific error we expected to see was returned from verify - we can exit
                    return
                if not first_error:
                    first_error = e

            if result and expected_error:
                raise NotRetryableException(
                    "Expected error in identify verify but got result:", result
                )
            if result:
                return result

        if first_error:
            raise first_error
        else:
            ts = arrow.now().isoformat()
            raise Exception(
                f"SMS 2fac code is not present to {phone_number}. Failed at: {ts}"
            )

    time.sleep(2)
    return try_until_success(inner, 30)


@pytest.mark.flaky
def test_onboarding_init(twilio, tenant, live_phone_number, sandbox_tenant):
    # Create a user with the live phone number, fetching the OTP from the actual SMS
    def initiate_challenge():
        data = dict(
            phone_number=dict(value=live_phone_number),
            email=dict(value=EMAIL),
            scope="onboarding",
        )
        body = post(
            "hosted/identify/signup_challenge", data, tenant.default_ob_config.key
        )
        return body["challenge_data"]

    # Rate limiting may take a while
    challenge_data = try_until_success(initiate_challenge, 20)

    auth_token = identify_verify_real_sms(
        twilio,
        live_phone_number,
        challenge_data,
        "onboarding",
    )

    bifrost = BifrostClient.raw_auth(
        tenant.default_ob_config,
        auth_token,
        None,
        override_phone=live_phone_number,
        override_email=EMAIL,
    )

    # Already initialized in bifrost client, but try again to make sure this endpoint is
    # idempotent
    body = bifrost.initialize_onboarding(False)

    body = bifrost.get_status()
    collect_data_req = get_requirement_from_requirements(
        "collect_data", body["all_requirements"]
    )
    expected_data = set(bifrost.ob_config.must_collect_data) - {"phone_number", "email"}
    assert set(collect_data_req["missing_attributes"]) == expected_data

    authorize_fields = get_requirement_from_requirements(
        "authorize", body["all_requirements"], is_met=True
    )["fields_to_authorize"]["collected_data"]
    assert set(authorize_fields) == set(bifrost.ob_config.can_access_data)

    assert get_requirement_from_requirements("liveness", body["all_requirements"])

    # Shouldn't be able to complete the onboarding until user data is provided
    bifrost.handle_authorize(status_code=400)

    # Test failed validation
    data = {"id.email": "flerpderp"}
    post("hosted/user/vault/validate", data, bifrost.auth_token, status_code=400)

    bifrost.handle_one_requirement("collect_data")

    # Should be allowed to update speculative fields that are already set
    data = {
        "id.first_name": "Flerp2",
        "id.last_name": "Derp2",
    }
    patch("hosted/user/vault", data, bifrost.auth_token)

    for k, v in data.items():
        bifrost.data[k] = v

    bifrost.handle_one_requirement("liveness")

    bifrost.handle_one_requirement("process")
    body = bifrost.validate()
    data = dict(validation_token=body["validation_token"])
    # Shouldn't be able to validate with other tenant
    post("onboarding/session/validate", data, sandbox_tenant.sk.key, status_code=400)
    body = post("onboarding/session/validate", data, tenant.sk.key)
    fp_id = body["user"]["fp_id"]
    assert body["user"]["status"] == "pass"
    assert body["user"]["requires_manual_review"] == False

    # Make sure the fp_id works
    body = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    assert len(body) > 0

    # Should be idempotent if we authorize again
    num_already_handled_reqs = len(bifrost.handled_requirements)
    bifrost.run()
    assert len(bifrost.handled_requirements) == num_already_handled_reqs

    # Identify lite should return a response here
    for data in [
        dict(phone_number=live_phone_number),
        dict(email=EMAIL),
        dict(phone_number=live_phone_number, email=EMAIL),
    ]:
        body = post("/hosted/identify/lite", data)
        assert body["user_found"] == True
