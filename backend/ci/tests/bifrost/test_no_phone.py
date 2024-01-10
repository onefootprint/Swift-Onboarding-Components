import pytest
from tests.headers import SandboxId
from tests.headers import FpAuth
from tests.constants import FIXTURE_EMAIL_OTP_PIN, FIXTURE_EMAIL
from tests.utils import _gen_random_sandbox_id
from tests.utils import post, patch
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient


@pytest.fixture(scope="session")
def no_phone_user(skip_phone_obc):
    sandbox_id = _gen_random_sandbox_id()
    headers = [skip_phone_obc.key, SandboxId(sandbox_id)]

    # Should ignore phone number and initiate an email challenge
    data = dict(email=FIXTURE_EMAIL, phone_number="+15555555555")
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    res = post(
        "hosted/identify/verify",
        dict(
            challenge_response=FIXTURE_EMAIL_OTP_PIN,
            challenge_token=challenge_token,
            scope="onboarding",
        ),
        *headers,
    )

    bifrost = BifrostClient.raw_auth(
        skip_phone_obc, FpAuth(res["auth_token"]), sandbox_id
    )
    user = bifrost.run()

    # Assert we can't replace the verified email
    data = {"id.email": FIXTURE_EMAIL}
    key = skip_phone_obc.tenant.sk.key
    body = patch(f"entities/{user.fp_id}/vault", data, key, status_code=400)
    assert (
        body["error"]["message"]["id.email"]
        == "Cannot replace verified contact information via API."
    )
    return user


def test_new_user(skip_phone_obc):
    collect_data = ["full_address", "name", "email"]
    headers = [skip_phone_obc.key, SandboxId(_gen_random_sandbox_id())]

    res = post("hosted/identify/signup_challenge", dict(email=FIXTURE_EMAIL), *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    # incorrect PIN fails
    res = post(
        "hosted/identify/verify",
        dict(
            challenge_response="323232",
            challenge_token=challenge_token,
            scope="onboarding",
        ),
        *headers,
        status_code=400,
    )
    assert res["error"]["message"] == "Incorrect PIN code"
    # correct PIN suceeds and gives auth
    res = post(
        "hosted/identify/verify",
        dict(
            challenge_response=FIXTURE_EMAIL_OTP_PIN,
            challenge_token=challenge_token,
            scope="onboarding",
        ),
        *headers,
    )

    auth_token = FpAuth(res["auth_token"])

    bifrost = BifrostClient.raw_auth(
        skip_phone_obc, auth_token, _gen_random_sandbox_id()
    )

    reqs = bifrost.get_status()["all_requirements"]

    assert get_requirement_from_requirements("liveness", reqs) is None

    collect_data_req = get_requirement_from_requirements("collect_data", reqs)
    assert set(collect_data_req["missing_attributes"]) == set(["full_address", "name"])
    assert set(collect_data_req["populated_attributes"]) == set(["email"])

    authorize_req = get_requirement_from_requirements("authorize", reqs, is_met=True)
    assert set(authorize_req["fields_to_authorize"]["collected_data"]) == set(
        collect_data
    )

    _ = bifrost.run()


def test_inherit_from_email(no_phone_user):
    auth_token = IdentifyClient.from_user(no_phone_user).inherit(kind="email")
    # auth_token is valid and can be used to start onboarding
    post("hosted/onboarding", None, auth_token)


def test_phone_user_cannot_inherit_from_email(sandbox_user):
    email = sandbox_user.client.data["id.email"]
    sandbox_id = SandboxId(sandbox_user.client.sandbox_id)

    body = post(
        "hosted/identify",
        dict(identifier=dict(email=email)),
        sandbox_user.client.ob_config.key,
        sandbox_id,
    )
    assert body["user_found"]
    assert "email" not in body["available_challenge_kinds"]

    # TODO: after adding is_otp_verified, confirm this still fails even if email is_verified
    post(
        "hosted/identify/login_challenge",
        dict(
            identifier=dict(email=email),
            preferred_challenge_kind="email",
        ),
        sandbox_user.client.ob_config.key,
        sandbox_id,
        status_code=400,
    )


def test_trigger(no_phone_user):
    # Should not error because the user is missing phone (we should email them instead)
    # TODO: later could use something like mailtrap/mailslurp to strongly assert the email was sent
    post(
        f"entities/{no_phone_user.fp_id}/triggers",
        dict(trigger=dict(kind="redo_kyc"), note="yo"),
        *no_phone_user.tenant.db_auths,
    )


def test_step_up(no_phone_user, sandbox_tenant):
    data = dict(kind="onboard", key=no_phone_user.client.ob_config.key.value)
    body = post(f"users/{no_phone_user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Step up the auth token using an email challenge
    auth_token = IdentifyClient.from_token(auth_token).step_up(kind="email")

    # And use the auth token to onboard
    bifrost2 = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, no_phone_user.client.sandbox_id
    )
    user2 = bifrost2.run()
    assert user2.fp_id == no_phone_user.fp_id
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]
