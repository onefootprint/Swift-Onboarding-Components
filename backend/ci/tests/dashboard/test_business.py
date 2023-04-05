import pytest
import typing
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post, build_business_data


class Business(typing.NamedTuple):
    fp_uid: str
    fp_bid: str


@pytest.fixture(scope="session")
def sb_business(sandbox_tenant, kyb_sandbox_ob_config, twilio):
    bifrost_client = BifrostClient(kyb_sandbox_ob_config)
    bifrost_client.init_user_for_onboarding(twilio)
    user = bifrost_client.onboard_user_onto_tenant(
        sandbox_tenant, add_business_data=True
    )
    body = get("entities", dict(kind="business"), sandbox_tenant.sk.key)
    entity = body["data"][0]
    assert entity["kind"] == "business"
    assert set(entity["attributes"]) == set(build_business_data())

    # TODO should get the fp_biz_id from validate
    fp_bid = entity["id"]
    return Business(user.fp_id, fp_bid)


def test_get_entities(sandbox_tenant, sb_business):
    body = get(
        f"entities/{sb_business.fp_bid}",
        None,
        sandbox_tenant.sk.key,
    )
    assert set(body["attributes"]) == set(build_business_data())
    assert body["decrypted_attributes"] == {"business.name": "Foobar Inc"}


def test_get_business_owners(sandbox_tenant, sb_business):
    body = get(
        f"businesses/{sb_business.fp_bid}/owners",
        None,
        sandbox_tenant.sk.key,
    )
    assert len(body) == 2
    primary_bo = body[0]
    secondary_bo = body[1]
    assert primary_bo["id"] == sb_business.fp_uid
    assert primary_bo["ownership_stake"] == 50
    assert primary_bo["status"] == "pass"
    assert not secondary_bo.get("id")
    assert secondary_bo["ownership_stake"] == 30


def test_get_vault(sandbox_tenant, sb_business):
    body = get(
        f"entities/{sb_business.fp_bid}/vault",
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
            "business.tin",
            "business.address_line1",
            "business.address_line2",
        ],
        ["business.city", "business.zip", "business.state", "business.country"],
        ["business.website", "business.phone_number"],
        ["business.beneficial_owners"],
    ],
)
def test_decrypt(sandbox_tenant, sb_business, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )
    expected_data = build_business_data()
    expected_data["business.phone_number"] = expected_data[
        "business.phone_number"
    ].replace(" ", "")

    body = post(
        f"entities/{sb_business.fp_bid}/vault/decrypt",
        data,
        sandbox_tenant.sk.key,
    )
    for field in fields_to_decrypt:
        assert body[field] == expected_data.get(field)

    access_event = latest_access_event_for(sb_business.fp_bid, sandbox_tenant.sk)
    assert set(access_event["targets"]) == set(fields_to_decrypt)
