from tests.constants import FIXTURE_PHONE_NUMBER, EMAIL
from tests.utils import _gen_random_sandbox_id, post, try_until_success, identify_verify
from tests.constants import FIXTURE_EMAIL, FIXTURE_PHONE_NUMBER
from tests.headers import SandboxId


def test_entity_created_after_signup_challenge(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER, email=EMAIL),
        sandbox_tenant.default_ob_config.key,
        SandboxId(sandbox_id),
    )

    # Make sure entity is created after initiating signup challenge. Should be hidden
    body = post("entities/search", None, *sandbox_tenant.db_auths)
    assert not any(e["sandbox_id"] == sandbox_id for e in body["data"])

    # But we can find it with show_all
    body = post("entities/search", dict(show_all=True), *sandbox_tenant.db_auths)
    entity = next(e for e in body["data"] if e["sandbox_id"] == sandbox_id)
    assert set(entity["decryptable_attributes"]) == {"id.email", "id.phone_number"}
    assert entity["status"] == "in_progress"


def test_concurrent_signup_same_phone_number(twilio, sandbox_tenant):
    """
    Test a race condition where the user tries to sign up with the same phone number at the same
    time.
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    obc = sandbox_tenant.default_ob_config

    # Initiate two signup challenges for the same phone number, email, and sandbox ID.
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL)
    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_token1 = body["challenge_data"]["challenge_token"]

    data = dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL)
    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_token2 = body["challenge_data"]["challenge_token"]

    # Should be able to complete both challenges without conflict, effectively making two vaults
    # with the same phone fingerprint and same sandbox ID.
    identify_verify(
        twilio, FIXTURE_PHONE_NUMBER, challenge_token2, "onboarding", obc.key
    )
    identify_verify(
        twilio, FIXTURE_PHONE_NUMBER, challenge_token1, "onboarding", obc.key
    )


def test_hi(sandbox_user):
    print("user token", sandbox_user.client.auth_token.value)
