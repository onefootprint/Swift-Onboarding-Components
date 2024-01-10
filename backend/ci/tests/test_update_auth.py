import json
import pytest
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth, SandboxId
from tests.identify_client import IdentifyClient
from tests.utils import (
    HttpError,
    _gen_random_sandbox_id,
    post,
    override_webauthn_challenge,
    override_webauthn_attestation,
)
from tests.constants import (
    TEST_URL,
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
    FIXTURE_EMAIL_OTP_PIN,
)
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
    token_for_auth = IdentifyClient.from_user(
        user,
        playbook_key=auth_playbook.key,
    ).inherit(scope="auth")

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
    auth_token = IdentifyClient.from_token(auth_token).step_up(
        kind="sms", scope="auth", assert_had_no_scopes=True
    )

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


def test_add_phone(sandbox_tenant, skip_phone_obc):
    sandbox_id = _gen_random_sandbox_id()
    headers = [skip_phone_obc.key, SandboxId(sandbox_id)]

    # Create a user on a skip_phone OBC so they don't have a phone
    data = dict(email=FIXTURE_EMAIL)
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    data = dict(
        challenge_response=FIXTURE_EMAIL_OTP_PIN,
        challenge_token=challenge_token,
        scope="onboarding",
    )
    body = post("hosted/identify/verify", data, *headers)

    bifrost = BifrostClient.raw_auth(
        skip_phone_obc,
        FpAuth(body["auth_token"]),
        FIXTURE_PHONE_NUMBER,
        sandbox_id,
        override_email=FIXTURE_EMAIL,
    )
    user = bifrost.run()

    # Create an auth token with permissions to update contact info
    data = dict(kind="user")
    body = post(f"users/{user.fp_id}/token", data, user.client.ob_config.tenant.sk.key)
    auth_token = FpAuth(body["token"])

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        kind="email", scope="auth"
    )

    # Replace the contact info with a challenge
    data = dict(
        kind="sms", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=["id.phone_number"], reason="Blah")
    body = post(f"entities/{user.fp_id}/vault/decrypt", data, *sandbox_tenant.db_auths)
    assert body["id.phone_number"] == FIXTURE_PHONE_NUMBER2


def test_add_email(user_with_token, sandbox_tenant):
    user, auth_token = user_with_token

    # Replace the contact info with a challenge
    data = dict(kind="email", email=FIXTURE_EMAIL2, action_kind="add_primary")
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=["id.email"], reason="Blah")
    body = post(f"entities/{user.fp_id}/vault/decrypt", data, *sandbox_tenant.db_auths)
    assert body["id.email"] == FIXTURE_EMAIL2


@pytest.mark.parametrize(
    "kind,expected_error",
    [
        ("sms", "Cannot add primary contact info when it already exists"),
        ("passkey", "Cannot add primary passkey when one already exists."),
    ],
)
def test_fail_to_add_primary(user_with_token, kind, expected_error):
    _, auth_token = user_with_token

    # Try to add a passkey
    data = dict(
        kind=kind, phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)

    challenge_token = body["challenge_token"]
    if kind == "passkey":
        chal = override_webauthn_challenge(json.loads(body["biometric_challenge_json"]))
        webauthn_device = SoftWebauthnDevice()
        attestation = webauthn_device.create(chal, TEST_URL)
        attestation = override_webauthn_attestation(attestation)
        challenge_response = json.dumps(attestation)
    else:
        challenge_response = "000000"
    data = dict(challenge_token=challenge_token, challenge_response=challenge_response)
    body = post("hosted/user/challenge/verify", data, auth_token, status_code=400)
    assert body["error"]["message"] == expected_error


def test_replace_passkey(user_with_token):
    user, auth_token = user_with_token

    # Can't replace the passkey with this auth token since it only has an SMS auth event
    data = dict(
        kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace"
    )
    body = post("hosted/user/challenge", data, auth_token, status_code=400)
    assert body["error"]["message"] == "Cannot initiate challenge of kind biometric"

    # Step up the token using a passkey
    auth_token = IdentifyClient.from_token(
        auth_token, webauthn=user.client.webauthn_device
    ).inherit(kind="biometric", scope="auth")

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

    # Make sure we can log in using the new passkey
    auth_token = IdentifyClient.from_user(user, webauthn=webauthn_device).inherit(
        kind="biometric"
    )

    # Make sure we can't log in using the old passkey
    try:
        auth_token = IdentifyClient.from_user(user).inherit(kind="biometric")
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

    # Make sure we can log in using the new passkey
    IdentifyClient.from_user(user, webauthn=webauthn_device).inherit(kind="biometric")
