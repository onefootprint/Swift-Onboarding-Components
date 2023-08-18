import pytest
from tests.utils import inherit_user_email
from tests.headers import SandboxId
from tests.headers import FpAuth
from tests.constants import FIXTURE_PHONE_NUMBER, INTEGRATION_SANDBOX_EMAIL_OTP_PIN
from tests.utils import _gen_random_sandbox_id
from tests.constants import EMAIL
from tests.utils import patch, post
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


@pytest.fixture(scope="session")
def skip_phone_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "KYC with optional ssn",
        must_collect_data=["full_address", "name", "email"],
        can_access_data=["full_address", "name", "email"],
        optional_data=[],
        is_no_phone_flow=True,
    )


@pytest.fixture(scope="session")
def no_phone_user(skip_phone_obc):
    sandbox_id = _gen_random_sandbox_id()
    headers = [skip_phone_obc.key, SandboxId(sandbox_id)]

    res = post("hosted/identify/signup_challenge", dict(email=EMAIL), *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    res = post(
        "hosted/identify/verify",
        dict(
            challenge_response=INTEGRATION_SANDBOX_EMAIL_OTP_PIN,
            challenge_token=challenge_token,
        ),
        *headers,
    )

    bifrost = BifrostClient(
        skip_phone_obc,
        FpAuth(res["auth_token"]),
        FIXTURE_PHONE_NUMBER,
        sandbox_id,
        True,
    )
    return bifrost.run()


def test_new_user(skip_phone_obc):
    collect_data = ["full_address", "name", "email"]
    headers = [skip_phone_obc.key, SandboxId(_gen_random_sandbox_id())]

    res = post("hosted/identify/signup_challenge", dict(email=EMAIL), *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    # incorrect PIN fails
    res = post(
        "hosted/identify/verify",
        dict(challenge_response="323232", challenge_token=challenge_token),
        *headers,
        status_code=400,
    )
    assert res["error"]["message"] == "Incorrect PIN code"
    # correct PIN suceeds and gives auth
    res = post(
        "hosted/identify/verify",
        dict(
            challenge_response=INTEGRATION_SANDBOX_EMAIL_OTP_PIN,
            challenge_token=challenge_token,
        ),
        *headers,
    )

    auth_token = FpAuth(res["auth_token"])

    # TODO: should probably give BifrostClient a concept of skip phone but this works for now
    bifrost = BifrostClient(
        skip_phone_obc, auth_token, FIXTURE_PHONE_NUMBER, _gen_random_sandbox_id(), True
    )

    reqs = bifrost.get_status()["requirements"]

    assert get_requirement_from_requirements("liveness", reqs) is None

    collect_data_req = get_requirement_from_requirements("collect_data", reqs)
    assert set(collect_data_req["missing_attributes"]) == set(["full_address", "name"])
    assert set(collect_data_req["populated_attributes"]) == set(["email"])

    authorize_req = get_requirement_from_requirements("authorize", reqs)
    assert set(authorize_req["fields_to_authorize"]["collected_data"]) == set(
        collect_data
    )

    _ = bifrost.run()


def test_inherit_from_email(no_phone_user):
    body = post(
        "hosted/identify",
        dict(identifier={"email": no_phone_user.client.data["id.email"]}),
        no_phone_user.client.ob_config.key,
        SandboxId(no_phone_user.client.sandbox_id),
    )
    assert body["user_found"]
    assert set(body["available_challenge_kinds"]) == {"email"}

    auth_token = inherit_user_email(no_phone_user)
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
        f"entities/{no_phone_user.fp_id}/trigger",
        dict(trigger=dict(kind="redo_kyc"), note="yo"),
        *no_phone_user.tenant.db_auths,
    )
