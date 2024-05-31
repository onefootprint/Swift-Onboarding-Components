import pytest
import typing
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post, patch
from tests.constants import BUSINESS_DATA, CDO_TO_DIS, BUSINESS_VAULT_DERIVED_DATA


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
    assert len(body) == 2
    assert body[0]["id"] == primary_bo.fp_id
    assert body[0]["ownership_stake"] == 50
    assert body[0]["status"] == "pass"
    assert body[0]["kind"] == "primary"
    assert not body[1].get("id")
    assert body[1]["ownership_stake"] == 30
    assert body[1]["kind"] == "secondary"


def test_get_businesses(sandbox_tenant, primary_bo):
    """Test the user -> owned businesses lookup"""
    body = get(
        f"entities/{primary_bo.fp_id}/businesses", None, *sandbox_tenant.db_auths
    )
    assert len(body) == 1
    assert body[0]["id"] == primary_bo.fp_bid
    assert body[0]["status"] == "pass"


def test_public_bos(sandbox_tenant, primary_bo):
    body = get(f"businesses/{primary_bo.fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert len(body["data"]) == 1
    assert body["data"][0]["fp_id"] == primary_bo.fp_id
    # Missing second BO because there's no scoped vault for them


def test_link_bos(sandbox_tenant, sandbox_user):
    body = post("businesses", None, sandbox_tenant.sk.key)
    fp_bid = body["id"]
    fp_id = sandbox_user.fp_id

    body = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert not body["data"]

    # Then, link a BO via API
    data = dict(fp_id=fp_id)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)
    body = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert len(body["data"]) == 1
    assert body["data"][0]["fp_id"] == fp_id

    # Cannot add the same user as a BO twice
    data = dict(fp_id=fp_id)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]
        == "The provided user is already an owner of the provided business"
    )

    # Cannot add an owner to a user vault
    data = dict(fp_id=fp_id)
    body = post(
        f"businesses/{fp_id}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"] == "Provided fp_bid does not correspond to a business"
    )

    # Cannot set a business as an owner
    data = dict(fp_id=fp_bid)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert body["error"]["message"] == "Provided fp_id does not correspond to a person"


def test_error_linking_bo(primary_bo, sandbox_tenant, sandbox_user):
    # Cannot link a BO when the business was created via bifrost
    fp_bid = primary_bo.fp_bid
    data = dict(fp_id=sandbox_user.fp_id)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]
        == "Provided business was created by onboarding onto a playbook. Business owners are managed automatically by the playbook, so they cannot be mutated."
    )


@pytest.mark.parametrize(
    "bo_di",
    [
        "business.beneficial_owners",
        "business.kyced_beneficial_owners",
    ],
)
def test_error_linking_bo_with_vaulted_bos(bo_di, sandbox_tenant, sandbox_user):
    body = post("businesses", None, sandbox_tenant.sk.key)
    fp_bid = body["id"]
    data = {bo_di: BUSINESS_DATA[bo_di]}
    patch(f"businesses/{fp_bid}/vault", data, sandbox_tenant.sk.key)

    # Cannot link a BO when the business has vaulted BOs
    data = dict(fp_id=sandbox_user.fp_id)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]
        == f"Business already has {bo_di} vaulted. If you'd like to link a user as the beneficial owner of this business, please clear out {bo_di}"
    )

    # When we clear out the vaulted BOs, we can link
    data = {bo_di: None}
    patch(f"businesses/{fp_bid}/vault", data, sandbox_tenant.sk.key)
    data = dict(fp_id=sandbox_user.fp_id)
    body = post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)


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
        ["business.beneficial_owners"],
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

    # Check the access event - but never expect business.name since it's stored in plaintext, or
    # other attributes that don't exist
    access_event = latest_access_event_for(primary_bo.fp_bid, sandbox_tenant)
    populated_keys = set(primary_bo.client.data)
    expected_access_event_fields = (
        set(fields_to_decrypt) - {"business.name"}
    ) & populated_keys
    assert set(access_event["targets"]) == expected_access_event_fields
