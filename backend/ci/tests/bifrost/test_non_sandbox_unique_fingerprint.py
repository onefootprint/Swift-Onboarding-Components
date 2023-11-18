from tests.headers import PublishableOnboardingKey, IsLive
from tests.constants import EMAIL
from tests.utils import post, try_until_success, identify_verify


def test_concurrent_signup_unique_fingerprint(
    twilio, tenant, sandbox_tenant, live_phone_number
):
    # Make a non-sandbox ob config for sandbox_tenant. Only live OBCs have unique fingerprints
    data = dict(
        name="Live OBC",
        must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
        can_access_data=["ssn4", "phone_number", "email", "name", "full_address"],
    )
    obc = post(
        "org/onboarding_configs", data, sandbox_tenant.auth_token, IsLive("true")
    )
    ob_config_key = PublishableOnboardingKey(obc["key"])

    def initiate_challenge(obc):
        data = dict(phone_number=live_phone_number, email=EMAIL)
        body = post("hosted/identify/signup_challenge", data, obc)
        return body["challenge_data"]["challenge_token"]

    # Initiate two signup challenges for the same phone number, email, and sandbox ID.
    # This should make two different vaults with the same phone number at different tenants
    # Rate limiting may take a while
    challenge_token1 = try_until_success(
        lambda: initiate_challenge(tenant.default_ob_config.key), 20
    )
    challenge_token2 = try_until_success(lambda: initiate_challenge(ob_config_key), 20)

    # Should be able to complete challenge at only one tenant
    identify_verify(
        twilio, live_phone_number, challenge_token2, "onboarding", ob_config_key
    )

    # This isn't necessarily desired behavior, but useful to assert that this is the current
    # behavior.
    identify_verify(
        twilio,
        live_phone_number,
        challenge_token1,
        "onboarding",
        tenant.default_ob_config.key,
        expected_error="Operation not allowed: unique constraint violation",
    )
