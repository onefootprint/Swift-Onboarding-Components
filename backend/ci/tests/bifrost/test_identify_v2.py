import pytest
from tests.identify_client import IdentifyClient, biometric_challenge_response
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_EMAIL, FIXTURE_PHONE_NUMBER
from tests.headers import FpAuth, SandboxId
from tests.utils import _gen_random_sandbox_id, create_ob_config, get, patch, post


@pytest.fixture(scope="session")
def multi_auth_obc(sandbox_tenant, must_collect_data):
    return create_ob_config(
        sandbox_tenant,
        "Multi Auth",
        must_collect_data,
        required_auth_methods=["phone", "email"],
    )


def test_identify_signup(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)

    data = dict(data={}, scope="onboarding")
    body = post("hosted/identify/session", data, obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # Should need to collect email and phone number
    body = get("hosted/identify/session/requirements", None, token)
    assert body["requirements"][0]["kind"] == "collect_data"
    assert body["requirements"][0]["cdo"] == "email"

    assert body["requirements"][1]["kind"] == "collect_data"
    assert body["requirements"][1]["cdo"] == "phone_number"

    challenge_req = body["requirements"][2]
    assert challenge_req["kind"] == "challenge"
    assert challenge_req["auth_method"] == "phone"
    assert challenge_req["challenge_kinds"] == ["sms", "sms_link"]

    # Can't verify without meeting all requirements
    body = post("hosted/identify/session/verify", None, token, status_code=400)
    assert (
        body["message"]
        == "Identify requirements are not met: collect_data, collect_data, challenge"
    )

    # Vault the phone and email
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token)

    data = {"id.phone_number": FIXTURE_PHONE_NUMBER}
    body = patch("hosted/identify/session/vault", data, token)

    # Completing an email OTP shouldn't fulfill any requirements at all
    data = dict(challenge_kind="email")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)

    # Only SMS challenge should be remaining
    body = get("hosted/identify/session/requirements", None, token)
    assert body["requirements"][0]["kind"] == "challenge"
    assert body["requirements"][0]["auth_method"] == "phone"

    body = post("hosted/identify/session/verify", None, token, status_code=400)
    assert body["message"] == "Identify requirements are not met: challenge"

    # Finish the SMS OTP
    data = dict(challenge_kind="sms")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)

    # Can no longer update vault data
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token, status_code=400)
    assert body["message"] == "Cannot update identify data on an active vault"

    # Once all requirements are met, should be able to verify
    body = post("hosted/identify/session/verify", None, token)
    token = FpAuth(body["auth_token"])

    # And cannot update vault with the final auth token
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token, status_code=400)
    assert body["message"] == "Cannot update identify data on an active vault"

    # Should be able to continue onboarding with this auth token
    bifrost = BifrostClient.raw_auth(obc, token, sandbox_id)
    bifrost.run()


def test_identify_signup_bootstrap(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)

    # When email is bootstrapped, should only ask for phone number
    data = dict(data={"id.email": FIXTURE_EMAIL}, scope="onboarding")
    body = post("hosted/identify/session", data, obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    body = get("hosted/identify/session/requirements", None, token)
    assert len(body["requirements"]) == 2
    assert body["requirements"][0]["kind"] == "collect_data"
    assert body["requirements"][0]["cdo"] == "phone_number"
    assert body["requirements"][1]["kind"] == "challenge"

    # When email and phone are bootstrapped, should jump straight to challenge
    data = dict(
        data={"id.email": FIXTURE_EMAIL, "id.phone_number": FIXTURE_PHONE_NUMBER},
        scope="onboarding",
    )
    body = post("hosted/identify/session", data, obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    body = get("hosted/identify/session/requirements", None, token)
    assert len(body["requirements"]) == 1
    assert body["requirements"][0]["kind"] == "challenge"
    assert body["requirements"][0]["auth_method"] == "phone"

    # Finish the SMS OTP
    data = dict(challenge_kind="sms")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)

    # Once all requirements are met, should be able to verify
    post("hosted/identify/session/verify", None, token)


@pytest.mark.parametrize(
    "required_auth_methods", [None, ["phone"], ["email"], ["phone", "email"]]
)
def test_required_auth_methods(sandbox_tenant, required_auth_methods):
    expected_auth_methods = required_auth_methods or ["phone"]
    playbook = create_ob_config(
        sandbox_tenant,
        "Auth playbook w required auth methods",
        ["phone_number", "email"],
        kind="auth",
        required_auth_methods=required_auth_methods,
    )
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)

    data = dict(
        data={"id.email": FIXTURE_EMAIL, "id.phone_number": FIXTURE_PHONE_NUMBER},
        scope="auth",
    )
    body = post("hosted/identify/session", data, playbook.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # Check the requirements
    body = get("hosted/identify/session/requirements", None, token)
    assert len(body["requirements"]) == len(expected_auth_methods)
    reqs = iter(body["requirements"])
    for am in expected_auth_methods:
        req = next(reqs)
        assert req["kind"] == "challenge"
        assert req["auth_method"] == am

    # Fulfill all the requirements
    challenge_kinds = []
    for am in expected_auth_methods:
        challenge_kind = "sms" if am == "phone" else "email"
        challenge_kinds.append(challenge_kind)
        data = dict(challenge_kind=challenge_kind)
        body = post("hosted/identify/session/challenge", data, token)
        challenge_token = body["challenge_data"]["challenge_token"]

        data = dict(challenge_token=challenge_token, challenge_response="000000")
        body = post("hosted/identify/session/challenge/verify", data, token)

    body = post("hosted/identify/session/verify", None, token)
    auth_token = FpAuth(body["auth_token"])

    # Get validation token, verify auth methods
    body = post("hosted/onboarding/validate", None, auth_token)
    validation_token = body["validation_token"]

    data = dict(validation_token=validation_token)
    body = post("onboarding/session/validate", data, sandbox_tenant.sk.key)
    assert set(i["kind"] for i in body["user_auth"]["auth_events"]) == set(
        challenge_kinds
    )


def test_login_challenge(sandbox_user):
    sandbox_id_h = SandboxId(sandbox_user.client.sandbox_id)
    obc = sandbox_user.client.ob_config

    data = dict(
        data={"id.email": FIXTURE_EMAIL, "id.phone_number": FIXTURE_PHONE_NUMBER},
        scope="onboarding",
    )
    body = post("hosted/identify/session", data, obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # If I try to signup challenge, should fail
    data = dict(challenge_kind="sms")
    body = post("hosted/identify/session/challenge", data, token, status_code=400)
    assert body["message"] == "Please log into your existing account"
    assert body["code"] == "E120"

    # Check the requirements
    body = get("hosted/identify/session/requirements", None, token)
    assert len(body["requirements"]) == 1
    req = body["requirements"][0]
    assert req["kind"] == "login"
    token = FpAuth(req["user"]["token"])
    IdentifyClient.from_token(token).login()


def test_doc_playbook(sandbox_tenant):
    playbook = create_ob_config(
        sandbox_tenant,
        "Doc",
        [],
        documents_to_collect=[dict(kind="proof_of_ssn", data=dict())],
        kind="document",
        skip_kyc=True,
    )
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(scope="onboarding", data=dict())
    body = post("hosted/identify/session", data, playbook.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # Check the requirements. Should need to collect phone number and email, just to preserve legacy behavior.
    # In theory, we could only collect phone since phone is the only implicitly required auth method
    body = get("hosted/identify/session/requirements", None, token)
    assert body["requirements"][0]["kind"] == "collect_data"
    assert body["requirements"][0]["cdo"] == "email"
    assert body["requirements"][1]["kind"] == "collect_data"
    assert body["requirements"][1]["cdo"] == "phone_number"
    assert body["requirements"][2]["kind"] == "challenge"
    assert body["requirements"][2]["auth_method"] == "phone"

    # Vault the phone number and email
    data = {"id.phone_number": FIXTURE_PHONE_NUMBER, "id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token)

    # Verify the phone number
    data = dict(challenge_kind="sms")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)

    post("hosted/identify/session/verify", None, token)


def test_skip_bo_playbook(sandbox_tenant):
    playbook = create_ob_config(
        sandbox_tenant,
        "Skip BO",
        ["business_name", "business_tin", "business_address"],
        kind="kyb",
        skip_kyc=True,
    )
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(scope="onboarding", data=dict())
    body = post("hosted/identify/session", data, playbook.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # Check the requirements. Should need to collect phone number and email, just to preserve legacy behavior.
    # In theory, we could only collect phone since phone is the only implicitly required auth method
    body = get("hosted/identify/session/requirements", None, token)
    assert body["requirements"][0]["kind"] == "collect_data"
    assert body["requirements"][0]["cdo"] == "email"
    assert body["requirements"][1]["kind"] == "collect_data"
    assert body["requirements"][1]["cdo"] == "phone_number"
    assert body["requirements"][2]["kind"] == "challenge"
    assert body["requirements"][2]["auth_method"] == "phone"

    # Vault the phone number and email
    data = {"id.phone_number": FIXTURE_PHONE_NUMBER, "id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token)

    # Verify the phone number
    data = dict(challenge_kind="sms")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)

    post("hosted/identify/session/verify", None, token)


def test_no_phone_playbook(skip_phone_obc):
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(scope="onboarding", data=dict())
    body = post("hosted/identify/session", data, skip_phone_obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    # Check the requirements. Should only need to collect email
    body = get("hosted/identify/session/requirements", None, token)
    print(body)
    assert body["requirements"][0]["kind"] == "collect_data"
    assert body["requirements"][0]["cdo"] == "email"
    assert body["requirements"][1]["kind"] == "challenge"
    assert body["requirements"][1]["auth_method"] == "email"

    # Vault the email
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, token)

    # Verify the email
    data = dict(challenge_kind="email")
    body = post("hosted/identify/session/challenge", data, token)
    challenge_token = body["challenge_data"]["challenge_token"]

    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/identify/session/challenge/verify", data, token)


def test_cannot_vault_with_identified_token(sandbox_tenant, sandbox_user):
    """
    Identify session tokens are very similar to unauthenticated tokens generated by the tenant. But make sure
    you can't do anything with an unauthenticated token from the tenant.
    """
    obc = sandbox_tenant.default_ob_config
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.s_sk)
    auth_token = FpAuth(body["token"])
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/identify/session/vault", data, auth_token, status_code=403)
    assert "required permission is missing: identify_session" in body["message"]


def test_cannot_continue_with_unverified(sandbox_tenant):
    """
    Identify session tokens are very similar to unauthenticated tokens generated by the tenant.
    Make sure you can't do anything with an unverified identify session token.
    """
    obc = sandbox_tenant.default_ob_config
    sandbox_id_h = SandboxId(_gen_random_sandbox_id())
    data = dict(data={}, scope="onboarding")
    body = post("hosted/identify/session", data, obc.key, sandbox_id_h)
    token = FpAuth(body["token"])

    body = post("hosted/onboarding/validate", None, token, status_code=403)
    assert (
        body["message"]
        == "Not allowed: required permission is missing: Or<auth,sign_up>"
    )

    body = get("hosted/onboarding/status", None, token, status_code=403)
    assert "Not allowed without workflow" in body["message"]

    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/user/vault", data, token, status_code=403)
    assert "Not allowed without workflow" in body["message"]
