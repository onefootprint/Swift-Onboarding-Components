import pytest
from tests.utils import (
    get,
    post,
    patch,
    _gen_random_n_digit_number,
)


@pytest.fixture(scope="session")
def limited_role(sandbox_tenant):
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role {suffix}",
        scopes=["read", "api_keys"],
    )
    body = post("org/roles", role_data, sandbox_tenant.auth_token)
    assert body["name"] == role_data["name"]
    assert set(i for i in body["scopes"]) == set(i for i in role_data["scopes"])
    return body


@pytest.fixture(scope="session")
def admin_role(sandbox_tenant):
    body = get("org/roles", None, sandbox_tenant.auth_token)
    roles = body["data"]
    return next(i for i in roles if i["scopes"][0] == "admin")


@pytest.fixture(scope="session")
def tenant_user(sandbox_tenant, admin_role):
    user_data = dict(
        email="integrationtest+1@onefootprint.com",
        role_id=admin_role["id"],
        redirect_url="http://localhost:3001/auth",
    )
    body = post("org/members", user_data, sandbox_tenant.auth_token)
    assert not body["last_login_at"]
    assert body["role_id"] == admin_role["id"]
    return body


def test_get_members(tenant_user, sandbox_tenant, limited_role, admin_role):
    user_id = tenant_user["id"]

    body = get(f"org/members", None, sandbox_tenant.auth_token)
    user = next(u for u in body["data"] if u["id"] == user_id)
    assert user["role_id"] == admin_role["id"]

    # Test filter on role_id
    body = get(
        f"org/members",
        dict(role_ids=limited_role["id"]),
        sandbox_tenant.auth_token,
    )
    assert not any(u["id"] == user_id for u in body["data"])

    body = get(
        f"org/members",
        dict(role_ids=",".join([limited_role["id"], admin_role["id"]])),
        sandbox_tenant.auth_token,
    )
    assert any(u["id"] == user_id for u in body["data"])


def test_get_roles(sandbox_tenant, limited_role, admin_role):
    body = get(f"org/roles", None, sandbox_tenant.auth_token)
    assert any(u["id"] == admin_role["id"] for u in body["data"])
    assert any(u["id"] == limited_role["id"] for u in body["data"])

    # Test filter on scopes
    body = get(f"org/roles", dict(scopes="api_keys"), sandbox_tenant.auth_token)
    assert not any(u["id"] == admin_role["id"] for u in body["data"])
    assert any(u["id"] == limited_role["id"] for u in body["data"])

    body = get(f"org/roles", dict(scopes="admin"), sandbox_tenant.auth_token)
    assert any(u["id"] == admin_role["id"] for u in body["data"])
    assert not any(u["id"] == limited_role["id"] for u in body["data"])

    body = get(f"org/roles", dict(scopes="admin, read"), sandbox_tenant.auth_token)
    assert any(u["id"] == admin_role["id"] for u in body["data"])
    assert any(u["id"] == limited_role["id"] for u in body["data"])


def test_update_roles(sandbox_tenant, limited_role, admin_role):
    role_id = limited_role["id"]
    suffix = _gen_random_n_digit_number(10)
    patch_data = dict(
        name=f"New role name {suffix}",
        scopes=["read", "onboarding_configuration"],
    )
    patch(f"org/roles/{role_id}", patch_data, sandbox_tenant.auth_token)

    body = get("org/roles", None, sandbox_tenant.auth_token)
    role_ids = set(r["id"] for r in body["data"])
    assert role_id in role_ids
    assert admin_role["id"] in role_ids
    role = next(r for r in body["data"] if r["id"] == role_id)
    assert role["name"] == patch_data["name"]
    assert set(i for i in role["scopes"]) == set(i for i in patch_data["scopes"])


def test_cant_update_admin_role(sandbox_tenant, admin_role):
    role_id = admin_role["id"]
    suffix = _gen_random_n_digit_number(10)
    patch_data = dict(
        name=f"New role name {suffix}",
    )
    patch(
        f"org/roles/{role_id}",
        patch_data,
        sandbox_tenant.auth_token,
        status_code=400,
    )


def test_update_user_role(sandbox_tenant, tenant_user, limited_role):
    user_id = tenant_user["id"]
    user_data = dict(role_id=limited_role["id"])
    patch(f"org/members/{user_id}", user_data, sandbox_tenant.auth_token)

    body = get(f"org/members", None, sandbox_tenant.auth_token)
    user = next(u for u in body["data"] if u["id"] == user_id)
    assert user["role_id"] == limited_role["id"]


def test_deactivate_role_and_user(sandbox_tenant, tenant_user, limited_role):
    role_id = limited_role["id"]
    user_id = tenant_user["id"]
    # Make sure the tenant_user is using the limited role
    user_data = dict(role_id=limited_role["id"])
    patch(f"org/members/{user_id}", user_data, sandbox_tenant.auth_token)

    # Can't deactivate role that has activate users
    post(
        f"org/roles/{role_id}/deactivate",
        None,
        sandbox_tenant.auth_token,
        status_code=400,
    )

    # So we deactivate the user
    post(f"org/members/{user_id}/deactivate", None, sandbox_tenant.auth_token)

    # And now we can deactivate it
    post(f"org/roles/{role_id}/deactivate", None, sandbox_tenant.auth_token)

    # Make sure the deactivated user isn't displayed anymore
    body = get("org/members", None, sandbox_tenant.auth_token)
    assert user_id not in set(u["id"] for u in body["data"])

    # Make sure the deactivated role isn't displayed anymore
    body = get("org/roles", None, sandbox_tenant.auth_token)
    assert role_id not in set(u["id"] for u in body["data"])
