import pytest
from tests.types import SecretApiKey
from tests.utils import (
    get,
    post,
    patch,
    _gen_random_n_digit_number,
)
from tests.dashboard.utils import (
    assert_has_audit_event_with_details,
    list_audit_events_with_details,
    generate_role,
)


@pytest.fixture(scope="session")
def admin_role(sandbox_tenant):
    body = get("org/roles", dict(kind="api_key"), *sandbox_tenant.db_auths)
    roles = body["data"]
    return next(i for i in roles if i["scopes"][0]["kind"] == "admin")


@pytest.fixture(scope="session")
def limited_role(sandbox_tenant):
    # Don't want to share this with test_iam since we will deactivate it here
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role {suffix}",
        scopes=[
            {"kind": "read"},
            {"kind": "write_entities"},
            {"kind": "decrypt", "data": "dob"},
        ],
        kind="api_key",
    )
    return post("org/roles", role_data, *sandbox_tenant.db_auths)


@pytest.fixture(scope="session")
def secret_key(sandbox_tenant, admin_role):
    data = dict(name="Test secret key", role_id=admin_role["id"])
    body = post("org/api_keys", data, *sandbox_tenant.db_auths)
    return SecretApiKey.from_response(body)


@pytest.fixture(scope="session")
def limited_disabled_secret_key(sandbox_tenant, limited_role):
    data = dict(name="Limited test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, *sandbox_tenant.db_auths)
    data = dict(status="disabled")
    key_id = body["id"]
    body = patch(f"org/api_keys/{key_id}", data, *sandbox_tenant.db_auths)
    return body


def test_api_key_list(secret_key, sandbox_tenant):
    body = get("org/api_keys", None, *sandbox_tenant.db_auths)
    key = next(key for key in body["data"] if key["id"] == secret_key.id)
    assert key["name"] == secret_key.name
    assert key["status"] == secret_key.status
    assert key["created_at"]
    scrubbed_key = key["scrubbed_key"]
    assert scrubbed_key.startswith("sk_test_")
    assert len(scrubbed_key.replace("sk_test_", "").replace("*", "")) == 3
    assert "key" not in key
    assert not key["last_used_at"]

    # Use the secret key
    get("/users", None, secret_key.key)
    body = get("org/api_keys", None, *sandbox_tenant.db_auths)
    key = next(key for key in body["data"] if key["id"] == secret_key.id)
    assert key["last_used_at"]


@pytest.mark.parametrize(
    "params,expect_key1,expect_key2",
    [
        (dict(status="enabled"), True, False),
        (dict(status="disabled"), False, True),
        (dict(search="Test"), True, True),
        (dict(search="limited"), False, True),
        (dict(role_ids=["admin"]), True, False),
        (dict(role_ids=["limited"]), False, True),
        (dict(role_ids=["limited", "admin"]), True, True),
    ],
)
def test_api_key_list_filters(
    secret_key,
    limited_disabled_secret_key,
    params,
    expect_key1,
    expect_key2,
    admin_role,
    limited_role,
    sandbox_tenant,
):
    if params.get("role_ids"):
        role_name_to_id = {
            "admin": admin_role["id"],
            "limited": limited_role["id"],
        }
        params["role_ids"] = ",".join(
            [role_name_to_id[name] for name in params["role_ids"]]
        )

    body = get("org/api_keys", params, *sandbox_tenant.db_auths)
    assert any(u["id"] == secret_key.id for u in body["data"]) == expect_key1
    assert (
        any(u["id"] == limited_disabled_secret_key["id"] for u in body["data"])
        == expect_key2
    )
    assert not any("key" in key for key in body["data"])


def test_api_key_limited_role(sandbox_tenant, admin_role, sandbox_user, limited_role):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, *sandbox_tenant.db_auths)
    key = SecretApiKey.from_response(body)

    # Can do write_entities actions
    data = {"id.first_name": "Hayes Valley"}
    post("users", data, key.key)

    # Cannot do other actions, like decrypt name, with limited role
    decrypt_data = dict(fields=["id.first_name", "id.dob"], reason="HI")
    fp_id = sandbox_user.fp_id
    body = post(
        f"entities/{fp_id}/vault/decrypt", decrypt_data, key.key, status_code=403
    )
    assert (
        body["message"]
        == "Not allowed: required permission is missing: CanDecrypt<id.first_name>. Please review the permissions configured for your role in the Footprint dashboard."
    )

    # Now, change the key's role
    data = dict(role_id=admin_role["id"])
    patch(f"org/api_keys/{key.id}", data, *sandbox_tenant.db_auths)

    # And now can do other actions with admin permissions
    post(f"entities/{fp_id}/vault/decrypt", decrypt_data, key.key)


def test_client_token_perms(limited_role, sandbox_tenant, sandbox_user, admin_role):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, *sandbox_tenant.db_auths)
    key = SecretApiKey.from_response(body)

    # Try creating a client token with missing permissions
    fp_id = sandbox_user.fp_id
    decrypt_datas = [
        dict(scopes=["decrypt"], fields=["id.ssn9"]),
        dict(scopes=["decrypt_download"], fields=["id.ssn9"], decrypt_reason="Flerp"),
    ]
    for data in decrypt_datas:
        post(f"users/{fp_id}/client_token", data, key.key, status_code=403)

    # Can make client token with vault permissions since limited_role allows write_entities
    data = dict(scopes=["vault"], fields=["id.first_name"])
    post(f"users/{fp_id}/client_token", data, key.key)

    # After changing the API key to have admin perms, should be able to make all of these client tokens
    data = dict(role_id=admin_role["id"])
    patch(f"org/api_keys/{key.id}", data, *sandbox_tenant.db_auths)

    for data in decrypt_datas:
        post(f"users/{fp_id}/client_token", data, key.key)


def test_deactivate_api_key_role(limited_role, sandbox_tenant):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, *sandbox_tenant.db_auths)
    key_id = body["id"]

    # Can't deactivate role with active API keys
    role_id = limited_role["id"]
    post(
        f"org/roles/{role_id}/deactivate",
        None,
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # Deactivate the API key
    data = dict(status="disabled")
    patch(f"org/api_keys/{key_id}", data, *sandbox_tenant.db_auths)

    # Now we can deactivate the role
    post(f"org/roles/{role_id}/deactivate", None, *sandbox_tenant.db_auths)


def test_api_key_reveal(secret_key, sandbox_tenant, admin_role):
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, *sandbox_tenant.db_auths)
    key = body
    assert key["key"] == secret_key.key.value
    assert key["scrubbed_key"][-3:] == key["key"][-3:]
    assert key["status"] == "enabled"
    assert key["name"] == "Test secret key"

    # Make sure we can't reveal other keys with an API key
    post(
        f"org/api_keys/{secret_key.id}/reveal",
        None,
        sandbox_tenant.sk.key,
        status_code=401,
    )
    # Make sure we have an audit event
    assert_has_audit_event_with_details(
        tenant=sandbox_tenant,
        name="decrypt_org_api_key",
        api_key={
            "id": secret_key.id,
            "name": secret_key.name,
            "role": {
                "id": admin_role["id"],
                "name": admin_role["name"],
                "scopes": admin_role["scopes"],
                "is_immutable": admin_role["is_immutable"],
                "created_at": admin_role["created_at"],
                "kind": admin_role["kind"],
            },
        },
    )


def test_api_key_update(sandbox_tenant, secret_key):
    # Test failing to update
    new_name = "Updated secret key name"
    data = dict(name=new_name, status="disabled")
    patch(f"org/api_keys/flerpderp", data, *sandbox_tenant.db_auths, status_code=404)

    # Update the name and status
    body = patch(f"org/api_keys/{secret_key.id}", data, *sandbox_tenant.db_auths)
    key = body
    assert key["name"] == new_name
    assert key["status"] == "disabled"

    # Verify the update, using the reveal endpoint as the detail endpoint
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, *sandbox_tenant.db_auths)
    assert body["name"] == new_name
    assert body["status"] == "disabled"

    # Verify we can't use the disabled API key for anything anymore
    post(
        f"entities/search",
        None,
        secret_key.key,
        status_code=401,
    )


def test_api_key_role_update(sandbox_tenant):
    # Create three roles with different scopes
    role_1 = generate_role(sandbox_tenant, [{"kind": "read"}])
    role_2 = generate_role(
        sandbox_tenant, [{"kind": "write_entities"}, {"kind": "read"}]
    )
    role_3 = generate_role(
        sandbox_tenant, [{"kind": "decrypt", "data": "ssn9"}, {"kind": "read"}]
    )

    # Create API key with role_1
    data = dict(name="Test API key for role updates", role_id=role_1["id"])
    api_key = post("org/api_keys", data, *sandbox_tenant.db_auths)

    # Verify initial state
    body = get(
        "org/api_keys",
        dict(ids=[api_key["id"]], status=None, search=None),
        *sandbox_tenant.db_auths,
    )
    # Verify initial state is role_1
    assert body["data"][0]["role"]["id"] == role_1["id"]

    # Update role_1 -> role_2
    patch(
        f"org/api_keys/{api_key['id']}",
        dict(role_id=role_2["id"]),
        *sandbox_tenant.db_auths,
    )

    # Get all role update events for this API key
    events = list(
        list_audit_events_with_details(
            sandbox_tenant, "update_org_api_key_role", api_key={"id": api_key["id"]}
        )
    )
    assert len(events) == 1

    # Verify first update event (role_1 -> role_2)
    first_event = events[0]
    assert first_event["detail"]["data"]["old_role"]["id"] == role_1["id"]
    assert first_event["detail"]["data"]["new_role"]["id"] == role_2["id"]
    assert first_event["detail"]["data"]["api_key"]["role"]["id"] == role_2["id"]

    # Update role_2 -> role_3
    patch(
        f"org/api_keys/{api_key['id']}",
        dict(role_id=role_3["id"]),
        *sandbox_tenant.db_auths,
    )

    # Get all role update events for this API key
    events = list(
        list_audit_events_with_details(
            sandbox_tenant, "update_org_api_key_role", api_key={"id": api_key["id"]}
        )
    )
    assert len(events) == 2

    # Most recent event: role_2 -> role_3 (current role is role_3)
    assert events[0]["detail"]["data"]["old_role"]["id"] == role_2["id"]
    assert events[0]["detail"]["data"]["new_role"]["id"] == role_3["id"]
    assert events[0]["detail"]["data"]["api_key"]["role"]["id"] == role_3["id"]

    # First event: role_1 -> role_2 (current role is now also role_3)
    assert events[1]["detail"]["data"]["old_role"]["id"] == role_1["id"]
    assert events[1]["detail"]["data"]["new_role"]["id"] == role_2["id"]
    assert events[1]["detail"]["data"]["api_key"]["role"]["id"] == role_3["id"]
