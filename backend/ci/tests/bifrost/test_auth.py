import pytest
import typing
from tests.identify_client import IdentifyClient
from tests.utils import create_ob_config, post, get, _gen_random_sandbox_id
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth


class User(typing.NamedTuple):
    fp_id: str
    sandbox_id: str
    validate_response: dict


@pytest.fixture(scope="session")
def authed_user(auth_playbook, sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(auth_playbook.key, sandbox_id).create_user(scope="auth")

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
    assert body["status"] == "none"
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
    assert not "explicit_auth" in body["scopes"]

    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config,
        auth_token,
        authed_user.sandbox_id,
        provide_playbook_auth=True,
    )

    # Since bifrost has implicit auth, we need to skip passkey registering - can only register with
    # explicit auth
    body = post("hosted/onboarding/skip_passkey_register", None, auth_token)

    # Check that the status is incomplete (aka in progress)
    body = get(f"entities/{authed_user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"

    # Finish running bifrost
    user = bifrost.run()
    assert user.fp_id == authed_user.fp_id

    # Auth events should be inherited
    assert (
        user.client.validate_response["user_auth"]
        == authed_user.validate_response["user_auth"]
    )

    # Check that the status is incomplete (aka in progress)
    body = get(f"entities/{authed_user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "pass"


def test_auth_onto_onboarded_user(sandbox_user, auth_playbook, sandbox_tenant):
    """
    Test running a user through an auth playbook after they onboard to a KYC playbook.
    Use a passkey to log in
    """
    auth_token = IdentifyClient.from_user(
        sandbox_user,
        playbook_key=auth_playbook.key,
    ).inherit(kind="biometric", scope="auth")
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

    # Make sure we didn't prefill the phone and email back into the same tenant
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert not any(i["source"] == "prefill" for i in body["data"])


def test_multi_tenant_auth(sandbox_user, foo_sandbox_tenant, must_collect_data):
    """
    Test onboarding onto a second tenant via an auth playbook
    """
    auth_playbook = create_ob_config(
        foo_sandbox_tenant,
        "Auth playbook",
        ["phone_number", "email"],
        ["phone_number", "email"],
        kind="auth",
    )
    playbook = create_ob_config(
        foo_sandbox_tenant, "My product", must_collect_data, must_collect_data
    )

    #
    # First, onboard the user onto an auth playbook at Foo tenant
    #

    auth_token = IdentifyClient.from_user(
        sandbox_user,
        playbook_key=auth_playbook.key,
    ).inherit(kind="biometric", scope="auth")
    body = post("/hosted/onboarding/validate", None, auth_token)

    # And validate it via the backend API
    validate_response = post(
        "/onboarding/session/validate", body, foo_sandbox_tenant.sk.key
    )
    fp_id = validate_response["user_auth"]["fp_id"]
    assert fp_id != sandbox_user.fp_id

    # Make sure we prefilled phone and email when this user one-click authed
    body = get(f"entities/{fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert body["status"] == "none"
    assert set(i["identifier"] for i in body["data"] if i["source"] == "prefill") == {
        "id.phone_number",
        "id.email",
    }

    #
    # Now, onboard the user onto a KYC playbook at the new tenant at Foo tenant
    #

    data = dict(kind="onboard", key=playbook.key.value)
    body = post(f"users/{fp_id}/token", data, foo_sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # For now, we won't have implicit auth here because the user token has permission to see
    # portable data at other tenants that foo_sandbox_tenant does not havej
    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(
        playbook, auth_token, sandbox_user.client.sandbox_id
    )
    bifrost.run()

    # Make sure we prefill the remaining data when they onboard
    body = get(f"entities/{fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert body["status"] == "pass"
    assert set(i["identifier"] for i in body["data"] if i["source"] == "prefill") >= {
        "id.phone_number",
        "id.email",
        "id.first_name",
        "id.address_line1",
    }

    # And make sure the timeline events show we prefilled phone + email and then later prefilled
    # the rest
    body = get(f"entities/{fp_id}/timeline", None, *foo_sandbox_tenant.db_auths)
    prefill_events = [
        i["event"]["data"]
        for i in body
        if i["event"]["kind"] == "data_collected" and i["event"]["data"]["is_prefill"]
    ]
    assert set(prefill_events[0]["attributes"]) == {
        "full_address",
        "name",
        "dob",
        "ssn9",
    }
    assert set(prefill_events[1]["attributes"]) == {"phone_number", "email"}
