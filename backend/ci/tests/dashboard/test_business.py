import pytest

from tests.bifrost_client import BifrostClient
from tests.utils import get


@pytest.fixture(scope="session")
def sb_user_with_business(sandbox_tenant, kyb_sandbox_ob_config, twilio):
    bifrost_client = BifrostClient(kyb_sandbox_ob_config)
    bifrost_client.init_user_for_onboarding(twilio)
    user = bifrost_client.onboard_user_onto_tenant(
        sandbox_tenant, add_business_data=True
    )
    return user


def test_entities(sandbox_tenant, sb_user_with_business):
    body = get("entities", dict(kind="business"), sandbox_tenant.sk.key)
    user = body["data"][0]
    assert set(user["attributes"]) == set(sb_user_with_business.business_data)

    # TODO should get the fp_biz_id from validate
    fp_id = user["id"]
    body = get(
        f"entities/{fp_id}/vault",
        None,
        sandbox_tenant.sk.key,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys == set(sb_user_with_business.business_data)
    print(body)
