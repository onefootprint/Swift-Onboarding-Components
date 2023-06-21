import pytest
import typing
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post
from tests.constants import BUSINESS_DATA, CDO_TO_DIS


@pytest.fixture(scope="session")
def populated_business_data(kyb_cdos):
    """
    The set of fields we expect to be populated on a business vault that onboarded onto an ob config
    with kyb_cdos
    """
    return set(di for cdo in kyb_cdos for di in CDO_TO_DIS[cdo]) & set(BUSINESS_DATA)


@pytest.fixture(scope="session")
def primary_bo(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient.new(kyb_sandbox_ob_config, twilio)
    return bifrost.run()


def test_get_entities(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}",
        None,
        sandbox_tenant.sk.key,
    )
    assert set(body["attributes"]) == populated_business_data
    assert (
        body["decrypted_attributes"]["business.name"]
        == primary_bo.client.data["business.name"]
    )


def test_get_business_owners(sandbox_tenant, primary_bo):
    body = get(
        f"businesses/{primary_bo.fp_bid}/owners",
        None,
        sandbox_tenant.sk.key,
    )
    assert len(body) == 2
    assert body[0]["id"] == primary_bo.fp_id
    assert body[0]["ownership_stake"] == 50
    assert body[0]["status"] == "pass"
    assert body[0]["kind"] == "primary"
    assert not body[1].get("id")
    assert body[1]["ownership_stake"] == 30
    assert body[1]["kind"] == "secondary"


def test_get_vault(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}/vault",
        None,
        sandbox_tenant.sk.key,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys == populated_business_data


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
def test_decrypt(sandbox_tenant, primary_bo, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )

    expected_data = primary_bo.client.data
    expected_data["business.phone_number"] = expected_data[
        "business.phone_number"
    ].replace(" ", "")

    body = post(
        f"entities/{primary_bo.fp_bid}/vault/decrypt",
        data,
        sandbox_tenant.sk.key,
    )
    for field in fields_to_decrypt:
        assert body[field] == expected_data.get(field)

    # Check the access event - but never expect business.name since it's stored in plaintext
    access_event = latest_access_event_for(primary_bo.fp_bid, sandbox_tenant.sk)
    expected_access_event_fields = set(fields_to_decrypt) - {"business.name"}
    assert set(access_event["targets"]) == expected_access_event_fields
