import json
import pytest
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth, SandboxId
from tests.utils import (
    HttpError,
    post,
    override_webauthn_challenge,
    override_webauthn_attestation,
    inherit_user,
    inherit_user_biometric,
    step_up_user,
    step_up_user_biometric,
)
from tests.constants import TEST_URL, FIXTURE_PHONE_NUMBER
from tests.webauthn_simulator import SoftWebauthnDevice

FIXTURE_PHONE_NUMBER2 = "+15555550111"
FIXTURE_EMAIL2 = f"sandbox2@onefootprint.com"


@pytest.fixture(scope="function")
def user_with_token(sandbox_tenant, auth_playbook):
    """
    An existing user and an auth token for it that can be used to update the user's auth methods
    """
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    return get_auth_token_for_ci_update(user, auth_playbook)


def get_auth_token_for_ci_update(user, auth_playbook):
    def assert_cant_use_token(token, status_code, error_message):
        data = dict(
            kind="sms", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace"
        )
        body = post("hosted/user/challenge", data, token, status_code=status_code)
        assert body["error"]["message"] == error_message

    # Make sure we can't use the onboarding token (not created via API) to update auth
    assert_cant_use_token(
        user.client.auth_token,
        401,
        "Not allowed: required permission is missing: And<explicit_auth,auth>",
    )

    # Also test that a playbook with the auth scopes can't be used
    sandbox_id_h = SandboxId(user.client.sandbox_id)
    token_for_auth = inherit_user("auth", auth_playbook.key, sandbox_id_h)

    assert_cant_use_token(
        token_for_auth, 400, "Can only update auth methods using auth issued via API"
    )

    # Create a new auth token via API that _can_ initiate a challenge, after step up
    data = dict(kind="user")
    body = post(f"users/{user.fp_id}/token", data, user.client.ob_config.tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Make sure we have to explicitly auth (and not use implied auth) to initiate a challenge AND
    # we need the `auth` token scope
    # It would be nice if we could test these two separately, but there isn't a codepath to do so
    assert_cant_use_token(
        auth_token,
        401,
        "Not allowed: required permission is missing: And<explicit_auth,auth>",
    )

    # Finally, step up the token so it can be used to initiate a challenge
    auth_token = step_up_user(auth_token, False, token_scope="auth")

    return (user, auth_token)


@pytest.mark.parametrize(
    "challenge,di",
    [
        (
            dict(kind="sms", phone_number=FIXTURE_PHONE_NUMBER2),
            "id.phone_number",
        ),
        (dict(kind="email", email=FIXTURE_EMAIL2), "id.email"),
    ],
)
def test_replace_ci(sandbox_tenant, challenge, di, user_with_token):
    user, auth_token = user_with_token

    # Replace the contact info with a challenge
    data = dict(**challenge, action_kind="replace")
    body = post("hosted/user/challenge", data, auth_token)
    assert not body["biometric_challenge_json"]
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=[di], reason="Blah")
    body = post(f"entities/{user.fp_id}/vault/decrypt", data, *sandbox_tenant.db_auths)
    assert body[di] == challenge.get("phone_number", None) or challenge.get(
        "email", None
    )


def test_fail_to_add_passkey(user_with_token):
    _, auth_token = user_with_token

    # Try to add a passkey
    data = dict(
        kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)

    challenge_token = body["challenge_token"]
    chal = override_webauthn_challenge(json.loads(body["biometric_challenge_json"]))
    webauthn_device = SoftWebauthnDevice()
    attestation = webauthn_device.create(chal, TEST_URL)
    attestation = override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=challenge_token, challenge_response=json.dumps(attestation)
    )
    body = post("hosted/user/challenge/verify", data, auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Cannot add primary passkey when one already exists."
    )


def test_replace_passkey(user_with_token):
    user, auth_token = user_with_token

    # Can't replace the passkey with this auth token since it only has an SMS auth event
    data = dict(
        kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace"
    )
    body = post("hosted/user/challenge", data, auth_token, status_code=400)
    assert body["error"]["message"] == "Cannot initiate challenge of kind biometric"

    # Step up the token using a passkey
    auth_token = step_up_user_biometric(auth_token, user, scope="auth")

    # Then can initiate replacing the paasskey
    body = post("hosted/user/challenge", data, auth_token)

    challenge_token = body["challenge_token"]
    chal = override_webauthn_challenge(json.loads(body["biometric_challenge_json"]))
    webauthn_device = SoftWebauthnDevice()
    attestation = webauthn_device.create(chal, TEST_URL)
    attestation = override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=challenge_token, challenge_response=json.dumps(attestation)
    )
    body = post("hosted/user/challenge/verify", data, auth_token)
    # Kind of hacky, replace the webauthn cred stored on bifrost client with the one we just registered
    old_webauthn_device = user.client.webauthn_device
    user.client.webauthn_device = webauthn_device

    # Make sure we can log in using the new passkey
    auth_token = inherit_user_biometric(user, "onboarding", user.client.ob_config.key)

    # Make sure we can't log in using the old passkey
    user.client.webauthn_device = old_webauthn_device
    try:
        inherit_user_biometric(user, "onboarding", user.client.ob_config.key)
        assert False, "Expected error"
    except HttpError as e:
        assert e.status_code == 400
        assert (
            json.loads(e.content)["error"]["message"]
            == "The credential requested could not be found"
        )


def test_add_passkey(sandbox_tenant, auth_playbook):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config)
    # Skip registering a passkey during onboarding so we can add it later
    post("hosted/onboarding/skip_passkey_register", None, bifrost.auth_token)
    user = bifrost.run()

    user, auth_token = get_auth_token_for_ci_update(user, auth_playbook)

    # Add a passkey
    data = dict(
        kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)

    challenge_token = body["challenge_token"]
    chal = override_webauthn_challenge(json.loads(body["biometric_challenge_json"]))
    webauthn_device = SoftWebauthnDevice()
    attestation = webauthn_device.create(chal, TEST_URL)
    attestation = override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=challenge_token, challenge_response=json.dumps(attestation)
    )
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Kind of hacky, replace the webauthn cred stored on bifrost client with the one we just registered
    user.client.webauthn_device = webauthn_device
    # Make sure we can log in using the new passkey
    auth_token = inherit_user_biometric(
        user, "onboarding", sandbox_tenant.default_ob_config.key
    )
