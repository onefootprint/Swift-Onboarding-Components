import json
import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import (
    post,
    override_webauthn_challenge,
    override_webauthn_attestation,
    inherit_user_biometric,
)
from tests.constants import TEST_URL
from tests.webauthn_simulator import SoftWebauthnDevice

FIXTURE_PHONE_NUMBER2 = "+15555550111"
FIXTURE_EMAIL2 = f"sandbox2@onefootprint.com"


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
def test_replace_ci(sandbox_tenant, twilio, challenge, di):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    user = bifrost.run()
    auth_token = bifrost.auth_token

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


def test_add_passkey(sandbox_tenant, twilio):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    user = bifrost.run()
    auth_token = bifrost.auth_token

    # Add a passkey
    data = dict(kind="passkey", phone_number=FIXTURE_PHONE_NUMBER2, action_kind="add")
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
