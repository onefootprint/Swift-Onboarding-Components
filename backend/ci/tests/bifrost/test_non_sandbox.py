import pytest

from tests.constants import EMAIL, PHONE_NUMBER
from tests.bifrost_client import BifrostClient
from tests.utils import (
    get,
    post,
    put,
    clean_up_user,
)


@pytest.fixture(scope="module", autouse="true")
def cleanup():
    # Cleanup the non-sandbox user that is used across all integration test runs
    clean_up_user(PHONE_NUMBER, EMAIL)


@pytest.fixture(scope="module")
def bifrost(twilio, tenant):
    """
    Bifrost client for a non-sandbox user
    """
    bifrost_client = BifrostClient(
        tenant.default_ob_config, twilio, override_create_phone=PHONE_NUMBER
    )
    return bifrost_client


def test_onboarding_init(bifrost):
    # Already initialized in bifrost client, but try again to make sure this endpoint is
    # idempotent
    body = bifrost.initialize_onboarding()
    assert not body["validation_token"]

    body = bifrost.get_status()
    assert body["ob_configuration"]["org_name"] == bifrost.ob_config.tenant.name

    req = lambda kind: next(r for r in body["requirements"] if r["kind"] == kind)

    collect_data_req = req("collect_data")
    expected_data = set(bifrost.ob_config.must_collect_data) - {"phone_number", "email"}
    assert set(collect_data_req["missing_attributes"]) == expected_data

    # requirements are non-null, so we expect this to be None
    authorize_fields = body["fields_to_authorize"]
    assert not authorize_fields

    assert req("liveness")

    # Shouldn't be able to complete the onboarding until user data is provided
    bifrost.authorize(status_code=400)


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
    put("hosted/user/vault", data, bifrost.auth_token)

    for k, v in data.items():
        bifrost.data[k] = v


def test_liveness(bifrost):
    bifrost.handle_requirements(kind="liveness")


def test_onboarding_authorize(tenant, bifrost, sandbox_tenant):
    # Manually authorize
    body = bifrost.authorize()
    data = dict(validation_token=body["validation_token"])
    # Shouldn't be able to validate with other tenant
    post("onboarding/session/validate", data, sandbox_tenant.sk.key, status_code=400)
    body = post("onboarding/session/validate", data, tenant.sk.key)
    fp_id = body["user"]["fp_id"]
    assert body["user"]["status"]

    # Make sure the fp_id works
    body = get(f"entities/{fp_id}/timeline", None, tenant.sk.key)
    assert len(body) > 0

    # Should be idempotent if we authorize again
    bifrost.run()
    assert not bifrost.handled_requirements
