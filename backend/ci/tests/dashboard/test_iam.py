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


def create_tenant_user(tenant, role, email, first_name=None, last_name=None):
    user_data = dict(
        email=email,
        role_id=role["id"],
        first_name=first_name,
        last_name=last_name,
        redirect_url="http://localhost:3001/auth",
    )
    body = post("org/members", user_data, tenant.auth_token)
    assert not body["last_login_at"]
    assert body["role_id"] == role["id"]
    return body


@pytest.fixture(scope="session")
def tenant_user(sandbox_tenant, admin_role):
    email = f"integrationtest+1@onefootprint.com"
    return create_tenant_user(sandbox_tenant, admin_role, email, "Flerp", "Grinman")


@pytest.fixture(scope="session")
def tenant_user2(sandbox_tenant, limited_role):
    email = f"integrationtest+2@onefootprint.com"
    return create_tenant_user(sandbox_tenant, limited_role, email, "Merp", "Wachs")


@pytest.mark.parametrize(
    "filters,expected_user1,expected_user2",
    [
        (None, True, True),  # No filters
        # Filter on search
        (dict(search="wach"), False, True),
        (dict(search="wachs"), False, True),
        (dict(search="flerp"), True, False),
        (dict(search="grin"), True, False),
        (dict(search="erp"), True, True),
        (dict(search="@onefootprint.com"), True, True),
        # Filter on is_invite_pending
        (dict(is_invite_pending="true"), True, True),
        (dict(is_invite_pending="false"), False, False),
    ],
)
def test_get_members(
    tenant_user,
    tenant_user2,
    sandbox_tenant,
    filters,
    expected_user1,
    expected_user2,
):
    body = get(f"org/members", filters, sandbox_tenant.auth_token)
    assert any(u["id"] == tenant_user["id"] for u in body["data"]) == expected_user1
    assert any(u["id"] == tenant_user2["id"] for u in body["data"]) == expected_user2


def test_get_members_filter_role_id(tenant_user, tenant_user2, sandbox_tenant):
    # Test filter on role_id, have to do in separate test bc can't parameterize
    assert tenant_user["role_id"] != tenant_user2["role_id"]

    tests = [
        (dict(role_ids=tenant_user["role_id"]), True, False),
        (
            dict(role_ids=",".join([tenant_user["role_id"], tenant_user2["role_id"]])),
            True,
            True,
        ),
    ]

    for (filters, expected_user1, expected_user2) in tests:
        body = get(f"org/members", filters, sandbox_tenant.auth_token)
        assert any(u["id"] == tenant_user["id"] for u in body["data"]) == expected_user1
        assert (
            any(u["id"] == tenant_user2["id"] for u in body["data"]) == expected_user2
        )


@pytest.mark.parametrize(
    "filters,expected_admin_role,expected_limited_role",
    [
        (None, True, True),  # No filters
        # Filter on scopes
        (dict(scopes="api_keys"), False, True),
        (dict(scopes="admin"), True, False),
        (dict(scopes="admin, read"), True, True),
        # Filter on name
        (dict(name="test limit"), False, True),
        # Filter on both!
        (dict(name="admin", scopes="admin, read"), True, False),
    ],
)
def test_get_roles(
    sandbox_tenant,
    limited_role,
    admin_role,
    filters,
    expected_admin_role,
    expected_limited_role,
):
    body = get(f"org/roles", filters, sandbox_tenant.auth_token)
    assert any(u["id"] == admin_role["id"] for u in body["data"]) == expected_admin_role
    assert (
        any(u["id"] == limited_role["id"] for u in body["data"])
        == expected_limited_role
    )


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


def test_deactivate_role_and_user(
    sandbox_tenant, tenant_user, tenant_user2, limited_role
):
    role_id = limited_role["id"]
    user_id = tenant_user["id"]
    user_id2 = tenant_user2["id"]
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

    # So we deactivate the users
    post(f"org/members/{user_id}/deactivate", None, sandbox_tenant.auth_token)
    post(f"org/members/{user_id2}/deactivate", None, sandbox_tenant.auth_token)

    # And now we can deactivate it
    post(f"org/roles/{role_id}/deactivate", None, sandbox_tenant.auth_token)

    # Make sure the deactivated user isn't displayed anymore
    body = get("org/members", None, sandbox_tenant.auth_token)
    assert user_id not in set(u["id"] for u in body["data"])

    # Make sure the deactivated role isn't displayed anymore
    body = get("org/roles", None, sandbox_tenant.auth_token)
    assert role_id not in set(u["id"] for u in body["data"])
