import json
import pytest
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth, SandboxId
from tests.identify_client import IdentifyClient
from tests.utils import (
    HttpError,
    get,
    _gen_random_sandbox_id,
    post,
    override_webauthn_challenge,
    override_webauthn_attestation,
)
from tests.constants import (
    TEST_URL,
    FIXTURE_PHONE_NUMBER2,
    FIXTURE_EMAIL,
    FIXTURE_EMAIL2,
    FIXTURE_EMAIL_OTP_PIN,
)
from tests.webauthn_simulator import SoftWebauthnDevice


@pytest.fixture(scope="function")
def user_with_token(sandbox_tenant, auth_playbook):
    """
    An existing user and an auth token for it that can be used to update the user's auth methods
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    return get_auth_token_for_ci_update(user, auth_playbook)


def get_auth_token_for_ci_update(user, auth_playbook, limit_auth_methods=None):
    def assert_cant_use_token(token, status_code, error_message):
        data = dict(
            kind="phone", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace"
        )
        body = post("hosted/user/challenge", data, token, status_code=status_code)
        assert body["message"] == error_message

    # Also test that a playbook with the auth scopes can't be used
    token_for_auth = IdentifyClient.from_user(user, playbook=auth_playbook).login(
        scope="auth"
    )

    assert_cant_use_token(
        token_for_auth, 400, "Can only replace auth methods using auth issued via API"
    )

    # Create a new auth token via API that _can_ initiate a challenge, after step up
    data = dict(kind="update_auth_methods", limit_auth_methods=limit_auth_methods)
    body = post(f"users/{user.fp_id}/token", data, user.client.ob_config.tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Make sure we have to explicitly auth (and not use implied auth) to initiate a challenge AND
    # we need the `auth` token scope
    # It would be nice if we could test these two separately, but there isn't a codepath to do so
    assert_cant_use_token(
        auth_token,
        403,
        "Not allowed: required permission is missing: And<explicit_auth,Or<auth,sign_up>>",
    )

    # Finally, step up the token so it can be used to initiate a challenge
    auth_token = IdentifyClient.from_token(auth_token).step_up(
        kind="sms", scope="auth", assert_had_no_scopes=True
    )

    return (user, auth_token)


def test_scrubbed_phone_email(sandbox_user, sandbox_tenant):
    data = dict(kind="update_auth_methods")
    body = post(f"entities/{sandbox_user.fp_id}/token", data, *sandbox_tenant.db_auths)
    auth_token = FpAuth(body["token"])

    data = dict(scope="onboarding")
    body = post("hosted/identify", data, auth_token)
    assert body["user"]["scrubbed_phone"] == "+1 (***) ***-**00"
    assert body["user"]["scrubbed_email"] == "f*@e******.com"


def test_auth_methods(user_with_token):
    _, auth_token = user_with_token
    body = get("hosted/user/auth_methods", None, auth_token)
    assert next(i["is_verified"] for i in body if i["kind"] == "phone")
    assert not next(i["is_verified"] for i in body if i["kind"] == "email")
    assert next(i["is_verified"] for i in body if i["kind"] == "phone")

    data = dict(scope="onboarding")
    body = post("hosted/identify", data, auth_token)
    auth_methods = body["user"]["auth_methods"]
    assert next(i["is_verified"] for i in auth_methods if i["kind"] == "phone")
    assert not next(i["is_verified"] for i in auth_methods if i["kind"] == "email")
    assert next(i["is_verified"] for i in auth_methods if i["kind"] == "phone")


@pytest.mark.parametrize(
    "challenge,di",
    [
        (
            dict(kind="phone", phone_number=FIXTURE_PHONE_NUMBER2),
            "id.phone_number",
        ),
        (dict(kind="email", email=FIXTURE_EMAIL2), "id.email"),
    ],
)
def test_replace_ci(challenge, di, user_with_token):
    _, auth_token = user_with_token

    # Replace the contact info with a challenge
    data = dict(**challenge, action_kind="replace")
    body = post("hosted/user/challenge", data, auth_token)
    assert not body["biometric_challenge_json"]
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=[di])
    body = post(f"hosted/user/vault/decrypt", data, auth_token)
    assert body[di] == challenge.get("phone_number", None) or challenge.get(
        "email", None
    )


def test_add_phone(skip_phone_obc):
    sandbox_id = _gen_random_sandbox_id()
    headers = [skip_phone_obc.key, SandboxId(sandbox_id)]

    # Create a user on a skip_phone OBC so they don't have a phone
    data = dict(email=dict(value=FIXTURE_EMAIL), scope="onboarding")
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]
    token = FpAuth(res["challenge_data"]["token"])

    data = dict(
        challenge_response=FIXTURE_EMAIL_OTP_PIN,
        challenge_token=challenge_token,
        scope="onboarding",
    )
    body = post("hosted/identify/verify", data, token)

    bifrost = BifrostClient.raw_auth(
        skip_phone_obc,
        FpAuth(body["auth_token"]),
        sandbox_id,
    )
    user = bifrost.run()

    # Create an auth token with permissions to update contact info
    data = dict(kind="update_auth_methods")
    body = post(
        f"entities/{user.fp_id}/token", data, *user.client.ob_config.tenant.db_auths
    )
    auth_token = FpAuth(body["token"])

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        kind="email", scope="auth"
    )

    # Replace the contact info with a challenge
    data = dict(
        kind="phone", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=["id.phone_number"])
    body = post(f"hosted/user/vault/decrypt", data, auth_token)
    assert body["id.phone_number"] == FIXTURE_PHONE_NUMBER2


def test_add_phone_bifrost(skip_phone_obc):
    """
    Make sure we can add a piece of contact info using a token from the onboarding flow.
    """
    sandbox_id = _gen_random_sandbox_id()
    headers = [skip_phone_obc.key, SandboxId(sandbox_id)]

    # Create a user on a skip_phone OBC so they don't have a phone
    data = dict(email=dict(value=FIXTURE_EMAIL), scope="onboarding")
    res = post("hosted/identify/signup_challenge", data, *headers)
    challenge_token = res["challenge_data"]["challenge_token"]
    token = FpAuth(res["challenge_data"]["token"])

    data = dict(
        challenge_response=FIXTURE_EMAIL_OTP_PIN,
        challenge_token=challenge_token,
        scope="onboarding",
    )
    body = post("hosted/identify/verify", data, token)
    auth_token = FpAuth(body["auth_token"])

    # Make sure we can't _replace_ contact info using this auth token
    data = dict(kind="email", email=FIXTURE_EMAIL2, action_kind="replace")
    body = post("hosted/user/challenge", data, auth_token, status_code=400)
    assert body["message"] == "Can only replace auth methods using auth issued via API"

    # But, we can add a new phone
    data = dict(
        kind="phone", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=["id.phone_number"])
    body = post(f"hosted/user/vault/decrypt", data, auth_token)
    assert body["id.phone_number"] == FIXTURE_PHONE_NUMBER2


def test_add_email(user_with_token):
    _, auth_token = user_with_token

    # Replace the contact info with a challenge
    data = dict(kind="email", email=FIXTURE_EMAIL2, action_kind="add_primary")
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth_token)

    # Make sure the contact info has been updated
    data = dict(fields=["id.email"])
    body = post(f"hosted/user/vault/decrypt", data, auth_token)
    assert body["id.email"] == FIXTURE_EMAIL2

    # Make sure email is marked as verified
    body = get("hosted/user/auth_methods", None, auth_token)
    assert next(i["is_verified"] for i in body if i["kind"] == "phone")
    assert next(i["is_verified"] for i in body if i["kind"] == "email")
    assert next(i["is_verified"] for i in body if i["kind"] == "phone")


@pytest.mark.parametrize(
    "kind,expected_error",
    [
        ("phone", "Cannot add primary contact info when it already exists"),
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
    assert body["message"] == expected_error


def test_replace_passkey(user_with_token):
    user, auth_token = user_with_token

    # Can't replace the passkey with this auth token since it only has an sms auth event
    data = dict(
        kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace"
    )
    body = post("hosted/user/challenge", data, auth_token, status_code=400)
    assert body["message"] == "Cannot initiate challenge of kind passkey"

    # Step up the token using a passkey
    auth_token = IdentifyClient.from_token(
        auth_token, webauthn=user.client.webauthn_device
    ).login(kind="biometric", scope="auth")

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
    auth_token = IdentifyClient.from_user(user, webauthn=webauthn_device).login(
        kind="biometric"
    )

    # Make sure we can't log in using the old passkey
    try:
        auth_token = IdentifyClient.from_user(user).login(kind="biometric")
        assert False, "Expected error"
    except HttpError as e:
        assert e.status_code == 400
        assert (
            json.loads(e.content)["message"]
            == "The credential requested could not be found"
        )


def test_add_passkey(sandbox_tenant, auth_playbook):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
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
    IdentifyClient.from_user(user, webauthn=webauthn_device).login(kind="biometric")


def test_restrict_adding_email(sandbox_user, auth_playbook):
    _, auth_token = get_auth_token_for_ci_update(
        sandbox_user, auth_playbook, limit_auth_methods=["email"]
    )

    # Assert can only update email, not phone
    body = get("hosted/user/auth_methods", None, auth_token)
    assert not next(i["can_update"] for i in body if i["kind"] == "phone")
    assert next(i["can_update"] for i in body if i["kind"] == "email")

    # Make sure we can't initiate a challenge to update phone
    data = dict(kind="phone", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="replace")
    body = post("hosted/user/challenge", data, auth_token, status_code=400)
    assert body["message"] == "Token cannot initiate challenge of kind phone"

    # But we can initiate a challenge to replace email
    data = dict(kind="email", email=FIXTURE_EMAIL2, action_kind="replace")
    body = post("hosted/user/challenge", data, auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    post("hosted/user/challenge/verify", data, auth_token)
