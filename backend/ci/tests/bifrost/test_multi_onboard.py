from tests.utils import create_ob_config, get
from tests.bifrost_client import BifrostClient


def test_onboard_onto_multiple_obcs(sandbox_tenant):
    # Will onboard onto this ob config
    REQUIRED_ATTRS = ["phone_number", "email", "full_address", "name"]
    data = {
        "name": "Ob config 1",
        "must_collect_data": REQUIRED_ATTRS,
        "can_access_data": ["phone_number", "email"],
    }
    ob_config1 = create_ob_config(sandbox_tenant, **data)
    # Will onboarding onto this config but abort before authorize
    data = {
        "name": "Ob config 2",
        "must_collect_data": REQUIRED_ATTRS + ["ssn9"],
        "can_access_data": ["full_address", "name", "ssn9"],
    }
    ob_config2 = create_ob_config(sandbox_tenant, **data)
    # Will onboarding onto this config
    data = {
        "name": "Ob config 3",
        "must_collect_data": REQUIRED_ATTRS + ["ssn4"],
        # Request ability to decrypt full address and name that weren't approved before
        "can_access_data": ["full_address", "name", "ssn4"],
    }
    ob_config3 = create_ob_config(sandbox_tenant, **data)

    # Onboard onto the first ob config
    bifrost = BifrostClient.new_user(ob_config1)
    user1 = bifrost.run()
    fp_id = user1.fp_id
    sandbox_id = bifrost.sandbox_id
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert set(body["attributes"]) >= {
        "id.phone_number",
        "id.email",
        "id.zip",
        "id.first_name",
    }
    assert set(body["decryptable_attributes"]) >= {"id.phone_number", "id.email"}

    # Decryption perms don't change after onboarding onto ob config 2, but we can see ssn9
    bifrost = BifrostClient.inherit_user(ob_config2, sandbox_id)
    bifrost.handle_requirements(kind="collect_data")
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert set(body["attributes"]) >= {
        "id.phone_number",
        "id.email",
        "id.zip",
        "id.first_name",
        "id.ssn9",
    }
    assert set(body["decryptable_attributes"]) >= {"id.phone_number", "id.email"}
    assert not set(body["decryptable_attributes"]) & {
        "id.first_name",
        "id.zip",
        "id.ssn9",
    }

    # After onboarding onto ob config 3, we get more decrypt permissions. But, still can't decrypt ssn9
    bifrost = BifrostClient.inherit_user(ob_config3, sandbox_id)
    user3 = bifrost.run()
    assert user3.fp_id == fp_id
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert set(body["attributes"]) >= {
        "id.phone_number",
        "id.email",
        "id.zip",
        "id.first_name",
        "id.ssn4",
        "id.ssn9",
    }
    assert set(body["decryptable_attributes"]) >= {
        "id.phone_number",
        "id.email",
        "id.zip",
        "id.first_name",
        "id.ssn4",
    }
    assert not set(body["decryptable_attributes"]) & {"id.ssn9"}
