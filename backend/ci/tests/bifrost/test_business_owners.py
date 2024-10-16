from tests.bifrost.test_multi_kyc_kyb import extract_bo_token
from tests.utils import get, patch, post
from tests.bifrost_client import BifrostClient
from tests.constants import BUSINESS_MODERN_BOS

USER_BO_FIELDS = ["id.first_name", "id.last_name", "id.phone_number", "id.email"]
PRIMARY_OWNERSHIP_STAKE = BUSINESS_MODERN_BOS["business.primary_owner_stake"]
SECONDARY_BO_DATA = BUSINESS_MODERN_BOS["business.secondary_beneficial_owners"][0]


def _assert_bo_data(bo, decrypted_fields, populated_fields, expected_data):
    for field in decrypted_fields:
        assert bo["decrypted_data"][field] == expected_data[field]
    assert set(bo["decrypted_data"]) == set(decrypted_fields)
    assert set(bo["populated_data"]) == set(populated_fields)


def test_onboard_new_bo_apis(kyb_sandbox_ob_config, sandbox_tenant):
    """
    This will test the flow using the new BO APIs as we develop them
    """
    primary_bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    primary_bifrost.data.pop("business.kyced_beneficial_owners")
    primary_bifrost.data.update(BUSINESS_MODERN_BOS)
    primary_bo = primary_bifrost.run()
    fp_bid = primary_bo.fp_bid

    # Check the new business owners APIs
    body = get("hosted/business/owners", None, primary_bifrost.auth_token)
    [primary_bo, secondary_bo] = body
    # First BO is self
    assert primary_bo["has_linked_user"]
    assert primary_bo["is_authed_user"]
    assert primary_bo["ownership_stake"] == PRIMARY_OWNERSHIP_STAKE
    _assert_bo_data(primary_bo, USER_BO_FIELDS, USER_BO_FIELDS, primary_bifrost.data)

    # Secondary BO is incomplete, but has all data (from the business vault)
    assert not secondary_bo["has_linked_user"]
    assert not secondary_bo["is_authed_user"]
    assert secondary_bo["ownership_stake"] == SECONDARY_BO_DATA["ownership_stake"]
    _assert_bo_data(secondary_bo, USER_BO_FIELDS, USER_BO_FIELDS, SECONDARY_BO_DATA)

    # Test decrypting the new business owner DIs
    secondary_link_id = secondary_bo["id"]
    dis = [
        f"business.beneficial_owners.{secondary_link_id}.{di}" for di in USER_BO_FIELDS
    ]
    data = dict(fields=dis, reason="Looking at BO data")
    body = post(f"entities/{fp_bid}/vault/decrypt", data, *sandbox_tenant.db_auths)
    for field in USER_BO_FIELDS:
        di = f"business.beneficial_owners.{secondary_link_id}.{field}"
        assert body[di] == SECONDARY_BO_DATA[field]

    #
    # Finish onboarding the secondary BO
    #
    secondary_bo_token = extract_bo_token(primary_bifrost)
    secondary_bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bifrost.run()

    body = get("hosted/business/owners", None, secondary_bifrost.auth_token)
    [primary_bo, secondary_bo] = body

    # Can only see primary owner's first name and last name
    assert primary_bo["has_linked_user"]
    assert not primary_bo["is_authed_user"]
    assert primary_bo["ownership_stake"] == PRIMARY_OWNERSHIP_STAKE
    decrypted_fields = ["id.first_name", "id.last_name"]
    _assert_bo_data(primary_bo, decrypted_fields, USER_BO_FIELDS, primary_bifrost.data)

    # Secondary BO is now the authed user
    assert secondary_bo["has_linked_user"]
    assert secondary_bo["is_authed_user"]
    assert secondary_bo["ownership_stake"] == SECONDARY_BO_DATA["ownership_stake"]
    _assert_bo_data(
        secondary_bo, USER_BO_FIELDS, USER_BO_FIELDS, secondary_bifrost.data
    )


def test_patch_business_owner(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.pop("business.kyced_beneficial_owners")
    bifrost.data.update(BUSINESS_MODERN_BOS)
    bifrost.handle_one_requirement("collect_business_data")

    # Update the secondary BO
    body = get("hosted/business/owners", None, bifrost.auth_token)
    link_id = body[1]["id"]
    new_secondary_data = {
        "data": {
            "id.first_name": "Frederick",
            "id.last_name": SECONDARY_BO_DATA["id.last_name"],
            "id.email": SECONDARY_BO_DATA["id.email"],
            "id.phone_number": SECONDARY_BO_DATA["id.phone_number"],
        },
        "ownership_stake": 33,
    }
    body = patch(
        f"hosted/business/owners/{link_id}", new_secondary_data, bifrost.auth_token
    )

    # Check the secondary BO was updated properly
    body = get("hosted/business/owners", None, bifrost.auth_token)
    secondary_bo = body[1]
    assert secondary_bo["ownership_stake"] == new_secondary_data["ownership_stake"]
    _assert_bo_data(
        secondary_bo, USER_BO_FIELDS, USER_BO_FIELDS, new_secondary_data["data"]
    )


def test_patch_checking_bo_id(kyb_sandbox_ob_config):
    # Create a new user and an associated business_owner
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.pop("business.kyced_beneficial_owners")
    bifrost.data.update(BUSINESS_MODERN_BOS)
    bifrost.handle_one_requirement("collect_business_data")

    body = get("hosted/business/owners", None, bifrost.auth_token)
    link_id = body[1]["id"]

    # On a totally different user, we shouldn't be able to use the link_id from the other user
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    body = patch(
        f"hosted/business/owners/{link_id}",
        SECONDARY_BO_DATA,
        bifrost.auth_token,
        status_code=404,
    )
    assert body["message"] == "Data not found"


def test_patch_cannot_update_linked(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.pop("business.kyced_beneficial_owners")
    bifrost.data.update(BUSINESS_MODERN_BOS)
    bifrost.run()

    body = get("hosted/business/owners", None, bifrost.auth_token)
    link_id = body[0]["id"]

    secondary_bo_token = extract_bo_token(bifrost)
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    data = dict(ownership_stake=PRIMARY_OWNERSHIP_STAKE)
    body = patch(
        f"hosted/business/owners/{link_id}", data, bifrost.auth_token, status_code=400
    )
    assert (
        body["message"]
        == "This business owner is already linked to a user and cannot be updated"
    )
