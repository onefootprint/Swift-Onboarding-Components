import pytest

from tests.headers import PublishableOnboardingKey, IsLive
from tests.constants import EMAIL, LIVE_PHONE_NUMBER
from tests.bifrost_client import BifrostClient
from tests.utils import (
    get,
    post,
    patch,
    clean_up_user,
    get_requirement_from_requirements,
    try_until_success,
    identify_verify,
)


@pytest.fixture(scope="module", autouse="true")
def cleanup():
    # Cleanup the non-sandbox user that is used across all integration test runs
    clean_up_user(LIVE_PHONE_NUMBER, EMAIL)


@pytest.fixture(scope="module")
def bifrost(twilio, tenant):
    """
    Bifrost client for a non-sandbox user
    """
    bifrost_client = BifrostClient.create(
        # Have to use live phone number in non-sandbox mode
        tenant.default_ob_config,
        twilio,
        LIVE_PHONE_NUMBER,
        None,
    )
    return bifrost_client


def test_onboarding_init(bifrost):
    # Already initialized in bifrost client, but try again to make sure this endpoint is
    # idempotent
    body = bifrost.initialize_onboarding()

    body = bifrost.get_status()
    assert body["ob_configuration"]["org_name"] == bifrost.ob_config.tenant.name

    collect_data_req = get_requirement_from_requirements(
        "collect_data", body["all_requirements"]
    )
    expected_data = set(bifrost.ob_config.must_collect_data) - {"phone_number", "email"}
    assert set(collect_data_req["missing_attributes"]) == expected_data

    authorize_fields = get_requirement_from_requirements(
        "authorize", body["all_requirements"], is_met=True
    )["fields_to_authorize"]["collected_data"]
    assert set(authorize_fields) == set(bifrost.ob_config.can_access_data)

    assert get_requirement_from_requirements("liveness", body["all_requirements"])

    # Shouldn't be able to complete the onboarding until user data is provided
    bifrost.handle_authorize(status_code=400)


def test_collect_data(bifrost):
    # Test failed validation
    data = {"id.email": "flerpderp"}
    post("hosted/user/vault/validate", data, bifrost.auth_token, status_code=400)

    bifrost.handle_requirements(kind="collect_data")

    # Should be allowed to update speculative fields that are already set
    data = {
        "id.first_name": "Flerp2",
        "id.last_name": "Derp2",
    }
    patch("hosted/user/vault", data, bifrost.auth_token)

    for k, v in data.items():
        bifrost.data[k] = v


def test_liveness(bifrost):
    bifrost.handle_requirements(kind="liveness")


def test_onboarding_authorize(tenant, bifrost, sandbox_tenant):
    # Manually authorize
    bifrost.handle_requirements(kind="authorize")
    bifrost.handle_requirements(kind="process")
    body = bifrost.validate()
    data = dict(validation_token=body["validation_token"])
    # Shouldn't be able to validate with other tenant
    post("onboarding/session/validate", data, sandbox_tenant.sk.key, status_code=400)
    body = post("onboarding/session/validate", data, tenant.sk.key)
    fp_id = body["user"]["fp_id"]
    assert body["user"]["status"] == "pass"
    assert body["user"]["requires_manual_review"] == False

    # Make sure the fp_id works
    body = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    assert len(body) > 0

    # Should be idempotent if we authorize again
    bifrost.run()
    assert not bifrost.handled_requirements


def test_concurrent_signup_unique_fingerprint(twilio, tenant, sandbox_tenant):
    # Clean up the user from the test run before this
    clean_up_user(LIVE_PHONE_NUMBER, EMAIL)

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
        data = dict(phone_number=LIVE_PHONE_NUMBER, email=EMAIL)
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
        twilio, LIVE_PHONE_NUMBER, challenge_token2, "onboarding", ob_config_key
    )

    # This isn't necessarily desired behavior, but useful to assert that this is the current
    # behavior.
    identify_verify(
        twilio,
        LIVE_PHONE_NUMBER,
        challenge_token1,
        "onboarding",
        tenant.default_ob_config.key,
        expected_error="Operation not allowed: unique constraint violation",
    )
