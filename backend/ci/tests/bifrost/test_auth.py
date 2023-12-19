import pytest
import typing
from tests.utils import (
    create_ob_config,
    post,
    get,
    create_user,
    _gen_random_sandbox_id,
    inherit_user_biometric,
)
from tests.constants import FIXTURE_PHONE_NUMBER, EMAIL
from tests.bifrost_client import BifrostClient
from tests.headers import SandboxId, FpAuth


class User(typing.NamedTuple):
    fp_id: str
    sandbox_id: str
    validate_response: dict


@pytest.fixture(scope="session")
def authed_user(auth_playbook, sandbox_tenant, twilio):
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_header = SandboxId(sandbox_id)
    auth_token = create_user(
        twilio,
        FIXTURE_PHONE_NUMBER,
        EMAIL,
        "auth",
        auth_playbook.key,
        sandbox_id_header,
    )

    # Enforce we can't start an onboarding with this auth token
    body = post("/hosted/onboarding", None, auth_token, status_code=401)
    assert (
        body["error"]["message"]
        == "Not allowed: required permission is missing: sign_up"
    )

    # Grab a validation token
    body = post("/hosted/onboarding/validate", None, auth_token)

    # And validate it via the backend API
    validate_response = post(
        "/onboarding/session/validate", body, sandbox_tenant.sk.key
    )
    fp_id = validate_response["user_auth"]["fp_id"]
    auth_events = validate_response["user_auth"]["auth_events"]
    assert len(auth_events) == 1
    assert auth_events[0]["kind"] == "sms"
    # Not provided for non-onboarding validation
    assert "user" not in validate_response

    # Check that this is the same user
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert body["sandbox_id"] == sandbox_id
    return User(fp_id, sandbox_id, validate_response)


def test_onboarding_authed_user(authed_user, sandbox_tenant):
    """
    Test running a user through a KYC playbook after they onboard to an auth playbook
    """
    body = post(
        f"users/{authed_user.fp_id}/token", dict(kind="user"), sandbox_tenant.sk.key
    )
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    # Start onboarding with public key here
    post("hosted/onboarding", None, auth_token, sandbox_tenant.default_ob_config.key)

    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config,
        auth_token,
        FIXTURE_PHONE_NUMBER,
        authed_user.sandbox_id,
    )
    user = bifrost.run()
    assert user.fp_id == authed_user.fp_id
    # Auth events should be inherited
    assert (
        user.client.validate_response["user_auth"]
        == authed_user.validate_response["user_auth"]
    )


def test_auth_onto_onboarded_user(sandbox_user, auth_playbook, sandbox_tenant):
    """
    Test running a user through an auth playbook after they onboard to a KYC playbook.
    Use a passkey to log in
    """
    auth_token = inherit_user_biometric(sandbox_user, "auth", auth_playbook.key)
    # Grab a validation token
    body = post("/hosted/onboarding/validate", None, auth_token)

    # And validate it via the backend API
    validate_response = post(
        "/onboarding/session/validate", body, sandbox_tenant.sk.key
    )
    fp_id = validate_response["user_auth"]["fp_id"]
    assert fp_id == sandbox_user.fp_id
    auth_events = validate_response["user_auth"]["auth_events"]
    assert len(auth_events) == 1
    assert auth_events[0]["kind"] == "passkey"
    # Not provided for non-onboarding validation
    assert "user" not in validate_response
