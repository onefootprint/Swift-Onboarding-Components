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
    data = dict(
        email=dict(value=FIXTURE_EMAIL),
        phone_number=dict(value="+15555555555"),
        scope="onboarding",
    )
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]
    token = FpAuth(res["challenge_data"]["token"])

    data = dict(
        challenge_response=FIXTURE_EMAIL_OTP_PIN,
        challenge_token=challenge_token,
        scope="onboarding",
    )
    res = post("hosted/identify/verify", data, token)

    bifrost = BifrostClient.raw_auth(
        skip_phone_obc, FpAuth(res["auth_token"]), sandbox_id
    )
    user = bifrost.run()

    return user


def test_new_user(skip_phone_obc):
    collect_data = ["full_address", "name", "email"]
    headers = [skip_phone_obc.key, SandboxId(_gen_random_sandbox_id())]

    data = dict(email=dict(value=FIXTURE_EMAIL), scope="onboarding")
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]
    token = FpAuth(res["challenge_data"]["token"])

    # incorrect PIN fails
    data = dict(
        challenge_response="323232",
        challenge_token=challenge_token,
        scope="onboarding",
    )
    res = post("hosted/identify/verify", data, token, status_code=400)
    assert res["message"] == "Incorrect PIN code"
    # correct PIN suceeds and gives auth
    data = dict(
        challenge_response=FIXTURE_EMAIL_OTP_PIN,
        challenge_token=challenge_token,
        scope="onboarding",
    )
    res = post("hosted/identify/verify", data, token)

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

    data = dict(email=email, scope="onboarding")
    body = post("hosted/identify", data, sandbox_user.client.ob_config.key, sandbox_id)
    assert body["user"]
    assert "email" not in body["user"]["available_challenge_kinds"]
    token = FpAuth(body["user"]["token"])

    # TODO: after adding is_otp_verified, confirm this still fails even if email is_verified
    data = dict(email=email, preferred_challenge_kind="email", scope="onboarding")
    post("hosted/identify/login_challenge", data, token, status_code=400)


def test_trigger(no_phone_user):
    # Should not error because the user is missing phone (we should email them instead)
    # TODO: later could use something like mailtrap/mailslurp to strongly assert the email was sent
    action = dict(trigger=dict(kind="redo_kyc"), note="yo", kind="trigger")
    data = dict(actions=[action])
    post(
        f"entities/{no_phone_user.fp_id}/actions", data, *no_phone_user.tenant.db_auths
    )


def test_step_up(no_phone_user, sandbox_tenant, skip_phone_obc):
    data = dict(kind="onboard", key=no_phone_user.client.ob_config.key.value)
    body = post(f"users/{no_phone_user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Step up the auth token using an email challenge
    auth_token = IdentifyClient.from_token(auth_token).step_up(kind="email")

    # And use the auth token to onboard
    bifrost2 = BifrostClient.raw_auth(
        skip_phone_obc, auth_token, no_phone_user.client.sandbox_id
    )
    user2 = bifrost2.run()
    assert user2.fp_id == no_phone_user.fp_id
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]
