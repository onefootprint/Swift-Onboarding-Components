import pytest
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post, build_business_data


@pytest.fixture(scope="session")
def sb_user_with_business(sandbox_tenant, kyb_sandbox_ob_config, twilio):
    bifrost_client = BifrostClient(kyb_sandbox_ob_config)
    bifrost_client.init_user_for_onboarding(twilio)
    user = bifrost_client.onboard_user_onto_tenant(
        sandbox_tenant, add_business_data=True
    )
    body = get("entities", dict(kind="business"), sandbox_tenant.sk.key)
    user = body["data"][0]
    assert set(user["attributes"]) == set(build_business_data())

    # TODO should get the fp_biz_id from validate
    fp_id = user["id"]
    return fp_id


def test_get_vault(sandbox_tenant, sb_user_with_business):
    body = get(
        f"entities/{sb_user_with_business}/vault",
        None,
        sandbox_tenant.sk.key,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys == set(build_business_data())


@pytest.mark.parametrize(
    "fields_to_decrypt",
    [
        [
            "business.name",
            "business.dba",
            "business.ein",
            "business.address_line1",
            "business.address_line2",
        ],
        ["business.city", "business.zip", "business.state", "business.country"],
        ["business.website", "business.phone_number"],
    ],
)
def test_decrypt(sandbox_tenant, sb_user_with_business, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )
    expected_data = build_business_data()
    expected_data["business.phone_number"] = expected_data[
        "business.phone_number"
    ].replace(" ", "")

    body = post(
        f"entities/{sb_user_with_business}/vault/decrypt",
        data,
        sandbox_tenant.sk.key,
    )
    for field in fields_to_decrypt:
        assert body[field] == expected_data.get(field)

    access_event = latest_access_event_for(sb_user_with_business, sandbox_tenant.sk)
    assert set(access_event["targets"]) == set(fields_to_decrypt)
