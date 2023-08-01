import pytest
from tests.types import SecretApiKey
from tests.headers import IsLive
from tests.utils import (
    get,
    post,
    patch,
    _gen_random_n_digit_number,
)


@pytest.fixture(scope="session")
def limited_role(sandbox_tenant):
    # Don't want to share this with test_iam since we will deactivate it here
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role {suffix}",
        scopes=[
            {"kind": "read"},
            {"kind": "onboarding_configuration"},
            {"kind": "write_entities"},
        ],
    )
    return post("org/roles", role_data, sandbox_tenant.auth_token)


@pytest.fixture(scope="session")
def secret_key(sandbox_tenant, admin_role):
    data = dict(name="Test secret key", role_id=admin_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token)
    return SecretApiKey.from_response(body)


@pytest.fixture(scope="session")
def limited_disabled_secret_key(sandbox_tenant, limited_role):
    data = dict(name="Limited test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token)
    data = dict(status="disabled")
    key_id = body["id"]
    body = patch(f"org/api_keys/{key_id}", data, sandbox_tenant.auth_token)
    return body


def test_api_key_list(secret_key):
    body = get("org/api_keys", None, secret_key.key)
    key = next(key for key in body["data"] if key["id"] == secret_key.id)
    assert key["name"] == secret_key.name
    assert key["status"] == secret_key.status
    assert key["created_at"]
    assert "key" not in key
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
):
    if params.get("role_ids"):
        role_name_to_id = {
            "admin": admin_role["id"],
            "limited": limited_role["id"],
        }
        params["role_ids"] = ",".join(
            [role_name_to_id[name] for name in params["role_ids"]]
        )

    body = get("org/api_keys", params, secret_key.key)
    assert any(u["id"] == secret_key.id for u in body["data"]) == expect_key1
    assert (
        any(u["id"] == limited_disabled_secret_key["id"] for u in body["data"])
        == expect_key2
    )
    assert not any("key" in key for key in body["data"])


def test_api_key_limited_role(
    sandbox_tenant,
    admin_role,
    must_collect_data,
    can_access_data,
    sandbox_user,
    limited_role,
):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token, IsLive("false"))
    key = SecretApiKey.from_response(body)

    # Can do ob config operations with limited role
    data = {
        "name": "FLERP",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }
    post("org/onboarding_configs", data, key.key)

    # Cannot do other actions with limited role
    decrypt_data = dict(fields=["id.first_name"], reason="HI")
    fp_id = sandbox_user.fp_id
    post(f"entities/{fp_id}/vault/decrypt", decrypt_data, key.key, status_code=401)

    # Now, change the key's role
    data = dict(role_id=admin_role["id"])
    patch(
        f"org/api_keys/{key.id}",
        data,
        sandbox_tenant.auth_token,
        IsLive("false"),
    )

    # And now can do other actions with admin permissions
    post(f"entities/{fp_id}/vault/decrypt", decrypt_data, key.key)


def test_client_token_perms(limited_role, sandbox_tenant, sandbox_user, admin_role):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token, IsLive("false"))
    key = SecretApiKey.from_response(body)

    # Try creating a client token with missing permissions
    fp_id = sandbox_user.fp_id
    decrypt_datas = [
        dict(scopes=["decrypt"], fields=["id.ssn9"]),
        dict(scopes=["decrypt_download"], fields=["id.ssn9"], decrypt_reason="Flerp"),
    ]
    for data in decrypt_datas:
        post(f"entities/{fp_id}/client_token", data, key.key, status_code=401)

    # Can make client token with vault permissions since limited_role allows write_entities
    data = dict(scopes=["vault"], fields=["id.first_name"])
    post(f"entities/{fp_id}/client_token", data, key.key)

    # After changing the API key to have admin perms, should be able to make all of these client tokens
    data = dict(role_id=admin_role["id"])
    patch(
        f"org/api_keys/{key.id}",
        data,
        sandbox_tenant.auth_token,
        IsLive("false"),
    )

    for data in decrypt_datas:
        post(f"entities/{fp_id}/client_token", data, key.key)


def test_deactivate_api_key_role(limited_role, sandbox_tenant):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token, IsLive("false"))
    key_id = body["id"]

    # Can't deactivate role with active API keys
    role_id = limited_role["id"]
    post(
        f"org/roles/{role_id}/deactivate",
        None,
        sandbox_tenant.auth_token,
        status_code=400,
    )

    # Deactivate the API key
    data = dict(status="disabled")
    patch(
        f"org/api_keys/{key_id}",
        data,
        sandbox_tenant.auth_token,
        IsLive("false"),
    )

    # Now we can deactivate the role
    post(
        f"org/roles/{role_id}/deactivate",
        None,
        sandbox_tenant.auth_token,
    )


def test_api_key_reveal(secret_key):
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, secret_key.key)
    key = body
    assert key["key"] == secret_key.key.value
    assert key["status"] == "enabled"
    assert key["name"] == "Test secret key"


def test_api_key_update(sandbox_tenant, secret_key):
    # Test failing to update
    new_name = "Updated secret key name"
    data = dict(name=new_name, status="disabled")
    patch(f"org/api_keys/flerpderp", data, sandbox_tenant.auth_token, status_code=404)

    # Update the name and status
    body = patch(f"org/api_keys/{secret_key.id}", data, sandbox_tenant.auth_token)
    key = body
    assert key["name"] == new_name
    assert key["status"] == "disabled"

    # Verify the update, using the reveal endpoint as the detail endpoint
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, sandbox_tenant.auth_token)
    assert body["name"] == new_name
    assert body["status"] == "disabled"

    # Verify we can't use the disabled API key for anything anymore
    get(
        f"entities",
        None,
        secret_key.key,
        status_code=401,
    )
