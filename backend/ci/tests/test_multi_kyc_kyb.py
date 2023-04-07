import pytest
from tests.auth import BusinessOwnerAuth
from tests.utils import (
    get,
    create_ob_config,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    kyb_cdos = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_kyced_beneficial_owners",
    ]
    return create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config",
        must_collect_data + kyb_cdos,
        can_access_data + kyb_cdos,
    )


@pytest.fixture(scope="session")
def primary_bo(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient(kyb_sandbox_ob_config, twilio)
    return bifrost.run()


def test_onboard_secondary_bo(primary_bo, kyb_sandbox_ob_config, twilio):
    # TODO For now, we are returning the secondary BO tokens via API. In the future, we should
    # send this directly to the user's phone
    token = primary_bo.client.put_business_response["tokens"][0]
    secondary_bo_token = BusinessOwnerAuth(token)

    # Send the secondary BO through KYC
    bifrost = BifrostClient(
        kyb_sandbox_ob_config, twilio, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = bifrost.run()
    # Shouldn't have collected business data from the secondary owner
    assert not any(
        req["kind"] == "collect_business_data"
        for req in secondary_bo.client.handled_requirements
    )

    # TODO get fp_bid from bifrost client eventually
    tenant_sk = kyb_sandbox_ob_config.tenant.sk.key
    body = get("entities", dict(kind="business"), tenant_sk)
    fp_bid = body["data"][0]["id"]

    # Validate the business owners
    body = get(f"businesses/{fp_bid}/owners", None, tenant_sk)
    assert len(body) == 2
    assert body[0]["kind"] == "primary"
    assert body[0]["id"] == primary_bo.fp_id
    assert body[0]["status"] == "pass"
    assert body[0]["ownership_stake"] == 50
    assert body[1]["kind"] == "secondary"
    assert body[1]["id"] == secondary_bo.fp_id
    assert body[1]["status"] == "pass"
    assert body[1]["ownership_stake"] == 30

    # TODO test can't reuse secondary BO token for other user but can reuse for same user


# TODO test when secondary BO one-clicks
