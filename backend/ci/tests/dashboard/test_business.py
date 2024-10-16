import pytest
import typing
from tests.dashboard.utils import latest_audit_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post, patch
from tests.constants import (
    BUSINESS_DATA,
    BUSINESS_MULTIPLE_BOS,
    CDO_TO_DIS,
)

BUSINESS_VAULT_DERIVED_DATA = {
    "business.formation_state": "CA",
    "business.formation_date": "2024-02-02",
}


@pytest.fixture(scope="session")
def populated_business_data(kyb_cdos):
    """
    The set of fields we expect to be populated on a business vault that onboarded onto an ob config
    with kyb_cdos
    """
    return (
        set(di for cdo in kyb_cdos for di in CDO_TO_DIS[cdo]) & set(BUSINESS_DATA)
    ).union(set(BUSINESS_VAULT_DERIVED_DATA))


@pytest.fixture(scope="session")
def primary_bo(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_business_data",
        "collect_data",
        "liveness",
        "process",
    ]
    return user


def test_get_entities(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert set(body["attributes"]) == populated_business_data
    assert (
        body["decrypted_attributes"]["business.name"]
        == primary_bo.client.data["business.name"]
    )


def test_get_business_owners(sandbox_tenant, primary_bo):
    """Test the business -> users (owners) lookup"""
    body = get(
        f"entities/{primary_bo.fp_bid}/business_owners", None, *sandbox_tenant.db_auths
    )
    assert len(body) == 1
    assert body[0]["fp_id"] == primary_bo.fp_id
    assert body[0]["ownership_stake"] == 50
    assert body[0]["status"] == "pass"
    assert body[0]["kind"] == "primary"


def test_get_businesses(sandbox_tenant, primary_bo):
    """Test the user -> owned businesses lookup"""
    body = get(
        f"entities/{primary_bo.fp_id}/businesses", None, *sandbox_tenant.db_auths
    )
    assert len(body) == 1
    assert body[0]["id"] == primary_bo.fp_bid
    assert body[0]["status"] == "pass"


def test_get_vault(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}/vault",
        None,
        *sandbox_tenant.db_auths,
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
    ],
)
def test_decrypt(sandbox_tenant, primary_bo, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )

    body = post(
        f"entities/{primary_bo.fp_bid}/vault/decrypt",
        data,
        *sandbox_tenant.db_auths,
    )
    for field in fields_to_decrypt:
        assert body[field] == primary_bo.client.decrypted_data.get(field)

    # Check the audit event - but never expect business.name since it's stored in plaintext, or
    # other attributes that don't exist
    audit_event = latest_audit_event_for(primary_bo.fp_bid, sandbox_tenant)
    assert audit_event["name"] == "decrypt_user_data"
    populated_keys = set(primary_bo.client.data)
    expected_audit_event_fields = (
        set(fields_to_decrypt) - {"business.name"}
    ) & populated_keys
    assert (
        set(audit_event["detail"]["data"]["decrypted_fields"])
        == expected_audit_event_fields
    )
