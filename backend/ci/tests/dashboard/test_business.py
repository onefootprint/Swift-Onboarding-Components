import pytest
import typing
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post
from tests.constants import BUSINESS_DATA


class Business(typing.NamedTuple):
    fp_uid: str
    fp_bid: str


@pytest.fixture(scope="session")
def sb_business(sandbox_tenant, kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient(kyb_sandbox_ob_config, twilio)
    user = bifrost.run()
    body = get("entities", dict(kind="business"), sandbox_tenant.sk.key)
    entity = body["data"][0]
    assert entity["kind"] == "business"
    assert set(entity["attributes"]) == set(BUSINESS_DATA)

    # TODO should get the fp_biz_id from validate
    fp_bid = entity["id"]
    return Business(user.fp_id, fp_bid)


def test_get_entities(sandbox_tenant, sb_business):
    body = get(
        f"entities/{sb_business.fp_bid}",
        None,
        sandbox_tenant.sk.key,
    )
    assert set(body["attributes"]) == set(BUSINESS_DATA)
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
    assert primary_bo["kind"] == "primary"
    assert not secondary_bo.get("id")
    assert secondary_bo["ownership_stake"] == 30
    assert secondary_bo["kind"] == "secondary"


def test_get_vault(sandbox_tenant, sb_business):
    body = get(
        f"entities/{sb_business.fp_bid}/vault",
        None,
        sandbox_tenant.sk.key,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys == set(BUSINESS_DATA)


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
    expected_data = BUSINESS_DATA
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
