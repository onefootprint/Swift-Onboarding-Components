import json
from tests.constants import TEST_URL
from tests.headers import FpAuth, SandboxId
from tests.bifrost_client import BifrostClient
from tests.utils import (
    override_webauthn_attestation,
    override_webauthn_challenge,
    get,
    post,
    inherit_user_biometric,
)

from tests.webauthn_simulator import SoftWebauthnDevice

WEBAUTHN_DEVICE = SoftWebauthnDevice()


def test_skip_liveness(twilio, sandbox_tenant):
    # Create user with requirements handled except liveness
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)

    # Liveness requirement exists
    body = bifrost.get_status()
    assert list(r for r in body["requirements"] if r["kind"] == "liveness")

    post("hosted/onboarding/skip_liveness", None, bifrost.auth_token)

    # After skipping, liveness requirement does not exist
    body = bifrost.get_status()
    assert not list(r for r in body["requirements"] if r["kind"] == "liveness")


def test_d2p_biometric(twilio, sandbox_tenant):
    # Create user with requirements handled except liveness
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    bifrost.handle_requirements(kind="collect_data")

    # Try generating tokens with no metadata for backwards compatibility
    post("hosted/onboarding/d2p/generate", None, bifrost.auth_token)
    post("hosted/onboarding/d2p/generate", dict(), bifrost.auth_token)
    # Get new auth token in d2p/generate endpoint
    meta = dict(opener="mobile", style_params="lots of CSS things", sandbox_id_doc_outcome="success")
    body = post("hosted/onboarding/d2p/generate", dict(meta=meta), bifrost.auth_token)
    d2p_auth_token = FpAuth(body["auth_token"])

    # Send the d2p token to the user via SMS
    data = dict(url="https://onefootprint.com/#{}".format(d2p_auth_token))
    post("hosted/onboarding/d2p/sms", data, d2p_auth_token)

    def _update_status(status, status_code=200):
        post(
            "hosted/onboarding/d2p/status",
            dict(status=status),
            d2p_auth_token,
            status_code=status_code,
        )

    def _assert_get_status(expected_status):
        body = get("hosted/onboarding/d2p/status", None, d2p_auth_token)
        assert body["status"] == expected_status
        assert body["meta"] == meta

    # Use the auth token to check the status of the d2p session
    _assert_get_status("waiting")

    # Add a biometric credential using the d2p token
    _update_status("in_progress")
    body = post("hosted/user/biometric/init", None, d2p_auth_token)
    chal_token = body["challenge_token"]
    chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
    attestation = WEBAUTHN_DEVICE.create(chal, TEST_URL)
    attestation = override_webauthn_attestation(attestation)

    # Register credential
    data = dict(
        challenge_token=chal_token, device_response_json=json.dumps(attestation)
    )
    post("hosted/user/biometric", data, d2p_auth_token)

    # Check that the status is updated
    _update_status("completed")
    _assert_get_status("completed")

    # Don't allow transitioning the status backwards
    _update_status("canceled", status_code=400)

    # Shouldn't be able to add a second biometric credential
    post("hosted/user/biometric/init", None, d2p_auth_token, status_code=400)
    post("hosted/user/biometric", data, d2p_auth_token, status_code=400)

    # Make sure the liveness requirement is met
    assert not any(
        i["kind"] == "liveness" for i in bifrost.get_status()["requirements"]
    )


def test_identify_login_repeat_customer_biometric(sandbox_user):
    # Identify the user by email, should have ability to auth via biometric
    identifier = {"email": sandbox_user.client.data["id.email"]}
    sandbox_id = sandbox_user.client.sandbox_id
    data = dict(
        identifier=identifier,
    )
    body = post(
        "hosted/identify",
        data,
        sandbox_user.client.ob_config.key,
        SandboxId(sandbox_id),
    )
    assert body["user_found"]
    assert set(body["available_challenge_kinds"]) == {"sms", "biometric"}

    # Inherit the user via biometric
    auth_token = inherit_user_biometric(sandbox_user)

    # Should be able to use the auth token
    get("hosted/onboarding/status", None, auth_token)
