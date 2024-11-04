from tests.headers import FpAuth
from tests.identify_client import IdentifyClient
from tests.bifrost.test_multi_kyc_kyb import extract_bo_token
from tests.utils import get, patch, post
from tests.bifrost_client import BifrostClient
from tests.constants import BUSINESS_SECONDARY_BOS
from uuid import uuid4

USER_BO_FIELDS = ["id.first_name", "id.last_name", "id.phone_number", "id.email"]
SECONDARY_BO_DATA = BUSINESS_SECONDARY_BOS["business.secondary_beneficial_owners"][0]


def _assert_bo_data(bo, decrypted_fields, populated_fields, expected_data):
    for field in decrypted_fields:
        assert bo["decrypted_data"][field] == expected_data[field]
    assert set(bo["decrypted_data"]) == set(decrypted_fields)
    assert set(bo["populated_data"]) == set(populated_fields)


def _assert_decrypt_bo_data(link_id, fp_bid, tenant, expected_data):
    dis = [f"business.beneficial_owners.{link_id}.{di}" for di in USER_BO_FIELDS]
    data = dict(fields=dis, reason="Looking at BO data")
    body = post(f"entities/{fp_bid}/vault/decrypt", data, *tenant.db_auths)
    for field in USER_BO_FIELDS:
        di = f"business.beneficial_owners.{link_id}.{field}"
        assert body[di] == expected_data.get(field, None)

        # TODO: check business.beneficial_owners.link_id.ownership_stake


def test_onboard(kyb_sandbox_ob_config, sandbox_tenant):
    primary_bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    primary_bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = primary_bifrost.run()
    primary_ownership_stake = primary_bifrost.data["business.primary_owner_stake"]
    fp_bid = primary_bo.fp_bid

    # Check the new business owners APIs
    body = get("hosted/business/owners", None, primary_bifrost.auth_token)
    [primary_bo_data, secondary_bo_data] = body
    # First BO is self
    assert primary_bo_data["has_linked_user"]
    assert primary_bo_data["is_authed_user"]
    assert primary_bo_data["ownership_stake"] == primary_ownership_stake
    _assert_bo_data(
        primary_bo_data, USER_BO_FIELDS, USER_BO_FIELDS, primary_bifrost.data
    )

    # Secondary BO is incomplete, but has all data (from the business vault)
    assert not secondary_bo_data["has_linked_user"]
    assert not secondary_bo_data["is_authed_user"]
    assert secondary_bo_data["ownership_stake"] == SECONDARY_BO_DATA["ownership_stake"]
    _assert_bo_data(
        secondary_bo_data, USER_BO_FIELDS, USER_BO_FIELDS, SECONDARY_BO_DATA
    )

    # Test decrypting the new business owner DIs
    secondary_link_id = secondary_bo_data["link_id"]
    _assert_decrypt_bo_data(
        secondary_link_id, fp_bid, sandbox_tenant, SECONDARY_BO_DATA
    )

    #
    # Finish onboarding the secondary BO
    #
    secondary_bo_token = extract_bo_token(primary_bo)
    secondary_bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bifrost.run()

    body = get("hosted/business/owners", None, secondary_bifrost.auth_token)
    [primary_bo, secondary_bo] = body

    # Can only see primary owner's first name and last name
    assert primary_bo["has_linked_user"]
    assert not primary_bo["is_authed_user"]
    assert primary_bo["ownership_stake"] == primary_ownership_stake
    decrypted_fields = ["id.first_name", "id.last_name"]
    _assert_bo_data(primary_bo, decrypted_fields, USER_BO_FIELDS, primary_bifrost.data)

    # Secondary BO is now the authed user
    assert secondary_bo["has_linked_user"]
    assert secondary_bo["is_authed_user"]
    assert secondary_bo["ownership_stake"] == SECONDARY_BO_DATA["ownership_stake"]
    _assert_bo_data(
        secondary_bo, USER_BO_FIELDS, USER_BO_FIELDS, secondary_bifrost.data
    )


def test_update_business_owners(kyb_sandbox_ob_config, sandbox_tenant):
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, fixture_result="use_rules_outcome"
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    bifrost.handle_one_requirement("collect_business_data")
    fp_bid = get("hosted/user/private/token", None, bifrost.auth_token)["fp_bid"]

    # Update the secondary BO
    body = get("hosted/business/owners", None, bifrost.auth_token)
    primary_uuid = body[0]["uuid"]
    uuid = body[1]["uuid"]
    link_id = body[1]["link_id"]
    new_secondary_data = {
        "id.first_name": "Frederick",
        "id.last_name": SECONDARY_BO_DATA["id.last_name"],
        "id.email": SECONDARY_BO_DATA["id.email"],
        "id.phone_number": SECONDARY_BO_DATA["id.phone_number"],
    }
    op = dict(op="update", uuid=uuid, data=new_secondary_data, ownership_stake=33)
    body = patch(f"hosted/business/owners", [op], bifrost.auth_token)
    _assert_bo_data(body[0], USER_BO_FIELDS, USER_BO_FIELDS, new_secondary_data)

    # Make sure cannot update the second owner to sum up to more than 100%
    op = dict(op="update", uuid=uuid, ownership_stake=51)
    body = patch(f"hosted/business/owners", [op], bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "Cumulative ownership stake for all beneficial owners cannot exceed 100%"
    )

    # Check the secondary BO was updated properly
    body = get("hosted/business/owners", None, bifrost.auth_token)
    secondary_bo = body[1]
    assert secondary_bo["ownership_stake"] == 33
    _assert_bo_data(secondary_bo, USER_BO_FIELDS, USER_BO_FIELDS, new_secondary_data)
    _assert_decrypt_bo_data(link_id, fp_bid, sandbox_tenant, new_secondary_data)

    # Delete the secondary BO that was just added and add a new one. Should not fail 100% ownership stake validation
    secondary_uuid = str(uuid4())
    ops = [
        dict(op="update", uuid=primary_uuid, ownership_stake=60),
        dict(
            op="create",
            uuid=secondary_uuid,
            data=new_secondary_data,
            ownership_stake=40,
        ),
        dict(op="delete", uuid=uuid),
    ]
    body = patch(f"hosted/business/owners", ops, bifrost.auth_token)
    uuid = body[1]["uuid"]

    # Delete the secondary BO that was just added
    op = dict(op="delete", uuid=uuid)
    patch(f"hosted/business/owners", [op], bifrost.auth_token)
    body = get("hosted/business/owners", None, bifrost.auth_token)
    assert len(body) == 1
    assert body[0]["uuid"] != uuid
    _assert_decrypt_bo_data(link_id, fp_bid, sandbox_tenant, {})

    # Should be able to finish bifrost normally without waiting for the secondary BO
    bifrost.run()
    assert bifrost.validate_response["business"]["status"] != "incomplete"


def test_can_only_update_owned_bos(kyb_sandbox_ob_config):
    # Create a new user and an associated business_owner
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    bifrost.handle_one_requirement("collect_business_data")

    body = get("hosted/business/owners", None, bifrost.auth_token)
    uuid = body[1]["uuid"]

    # On a totally different user, we shouldn't be able to use the uuid from the other user
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    op = dict(op="update", uuid=uuid, **SECONDARY_BO_DATA)
    body = patch(f"hosted/business/owners", [op], bifrost.auth_token, status_code=400)
    assert body["message"] == "Business owner with UUID belongs to different business"

    # And cannot delete the BO that we don't own
    op = dict(op="delete", uuid=uuid)
    body = patch("hosted/business/owners", [op], bifrost.auth_token, status_code=400)
    assert body["message"] == "Business owner with UUID belongs to different business"


def test_updating_linked_bo(kyb_sandbox_ob_config, sandbox_tenant):
    # Create a business with 2 BOs
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    user = bifrost.run()

    secondary_bo_token = extract_bo_token(user)
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    bifrost.run()

    # Create a trigger to re-onboard the business
    trigger = dict(
        kind="onboard",
        data=dict(playbook_id=bifrost.ob_config.id, reuse_existing_bo_kyc=True),
    )
    action = dict(trigger=trigger, kind="trigger", fp_bid=user.fp_bid)
    data = dict(actions=[action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    auth_token = FpAuth(body[0]["token"])

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(
        kyb_sandbox_ob_config, auth_token, user.client.sandbox_id
    )

    body = get("hosted/business/owners", None, bifrost.auth_token)
    bo = next(bo for bo in body if not bo["is_authed_user"])
    uuid = bo["uuid"]

    # Can update a linked BO's ownership
    op = dict(op="update", uuid=uuid, ownership_stake=50)
    patch(f"hosted/business/owners", [op], bifrost.auth_token)

    # Cannot update their data
    op = dict(op="update", uuid=uuid, data={"id.first_name": "Fred"})
    body = patch(f"hosted/business/owners", [op], bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "This owner is already linked to a user and cannot be updated"
    )

    # And cannot delete them
    op = dict(op="delete", uuid=uuid)
    body = patch(f"hosted/business/owners", [op], bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "This owner is already linked to a user and cannot be deleted"
    )


def test_cannot_vault_bo_data_directly(kyb_sandbox_ob_config, sandbox_tenant):
    """
    BO data can only be managed via the dedicated BO APIs. Make sure we can't vault it directly here
    """
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)

    di = "business.beneficial_owners.bo_link_primary.id.first_name"
    data = {di: "Franklin"}
    body = patch("hosted/business/vault", data, bifrost.auth_token, status_code=400)
    assert body["context"][di] == "Cannot vault beneficial owner data via API"

    user = bifrost.run()
    patch(
        f"entities/{user.fp_bid}/vault", data, *sandbox_tenant.db_auths, status_code=400
    )
    assert body["context"][di] == "Cannot vault beneficial owner data via API"
