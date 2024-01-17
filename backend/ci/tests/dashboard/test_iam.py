import arrow
import pytest
from tests.headers import IsLive
from tests.utils import (
    get,
    post,
    patch,
    _gen_random_n_digit_number,
)


@pytest.fixture(scope="session")
def admin_role(sandbox_tenant):
    body = get("org/roles", dict(kind="dashboard_user"), *sandbox_tenant.db_auths)
    roles = body["data"]
    return next(i for i in roles if i["scopes"][0]["kind"] == "admin")


@pytest.fixture(autouse=True, scope="session")
def test_deactivate_old_roles_and_members(sandbox_tenant, limited_role):
    """
    Deactivate roles at this tenant that were created by previous integration testing runs.
    Otherwise, the users you want to see end up on the second page...
    """
    for is_live in ["true", "false"]:
        is_live = IsLive(is_live)
        body = get(
            f"org/roles", dict(page_size=100), sandbox_tenant.auth_token, is_live
        )
        roles_to_deactivate = (
            i
            for i in body["data"]
            if not i["is_immutable"]
            and i["id"] != limited_role["id"]
            and arrow.get(i["created_at"]) < arrow.now().shift(minutes=-5)
        )

        for r in roles_to_deactivate:
            # Deactivate members using this role
            r_id = r["id"]
            members = get(f"org/members", dict(role_ids=r_id), *sandbox_tenant.db_auths)
            for m in members["data"]:
                m_id = m["id"]
                post(
                    f"org/members/{m_id}/deactivate",
                    None,
                    *sandbox_tenant.db_auths,
                )
            # Deactivate api keys using this role
            data = dict(role_ids=r_id, status="enabled")
            api_keys = get("org/api_keys", data, sandbox_tenant.auth_token, is_live)
            for k in api_keys["data"]:
                k_id = k["id"]
                patch(
                    f"org/api_keys/{k_id}",
                    dict(status="disabled"),
                    sandbox_tenant.auth_token,
                    is_live,
                )
            # Deactivate the role
            post(f"org/roles/{r_id}/deactivate", None, *sandbox_tenant.db_auths)

        body = get(
            f"org/members", dict(page_size=100), sandbox_tenant.auth_token, is_live
        )
        users_to_deactivate = (
            i
            for i in body["data"]
            if "custom_it_user" in i["email"]
            and arrow.get(i["created_at"]) < arrow.now().shift(minutes=-5)
        )
        for m in users_to_deactivate:
            m_id = m["id"]
            post(
                f"org/members/{m_id}/deactivate",
                None,
                *sandbox_tenant.db_auths,
            )


@pytest.fixture(scope="session")
def limited_role(sandbox_tenant):
    # Don't want to share this with test_api_keys since we will deactivate it here
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role {suffix}",
        scopes=[{"kind": "read"}, {"kind": "manage_webhooks"}],
        kind="dashboard_user",
    )
    body = post("org/roles", role_data, *sandbox_tenant.db_auths)
    assert body["name"] == role_data["name"]
    assert set(i["kind"] for i in body["scopes"]) == set(
        i["kind"] for i in role_data["scopes"]
    )
    return body


def create_tenant_user(tenant, role, email, first_name=None, last_name=None):
    # Since we reuse this tenant across integration test runs, an incomplete previous integration
    # test run may leave active users that cause conflict. Deactivate any old integration test
    # users
    body = get("org/members", dict(search=email), tenant.auth_token)
    if body["data"]:
        rb_id = body["data"][0]["id"]
        post(f"org/members/{rb_id}/deactivate", None, tenant.auth_token)

    # Create the tenant_user
    user_data = dict(
        email=email,
        role_id=role["id"],
        first_name=first_name,
        last_name=last_name,
        redirect_url="http://localhost:3001/auth",
    )
    body = post("org/members", user_data, tenant.auth_token)
    assert not body["rolebinding"]["last_login_at"]
    assert body["role"]["id"] == role["id"]
    return body


@pytest.fixture(scope="session")
def tenant_user(sandbox_tenant, admin_role, run_id):
    email = f"custom_it_user.{run_id}.fixture+1@onefootprint.com"
    return create_tenant_user(sandbox_tenant, admin_role, email, "Flerp", "Grinman")


@pytest.fixture(scope="session")
def tenant_user2(sandbox_tenant, limited_role, run_id):
    email = f"custom_it_user.{run_id}.fixture+2@onefootprint.com"
    return create_tenant_user(sandbox_tenant, limited_role, email, "Merp", "Wachs")


@pytest.fixture(scope="session")
def tenant_user3(sandbox_tenant, limited_role, run_id):
    email = f"custom_it_user.{run_id}.fixture+3@onefootprint.com"
    return create_tenant_user(
        sandbox_tenant, limited_role, email, "Piip", "The Warrior"
    )


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
    data = dict(page_size=100, **(filters or dict()))
    body = get(f"org/members", data, *sandbox_tenant.db_auths)
    # There are some flakes here, just print some debugging info
    print([(u["id"], u["created_at"]) for u in body["data"]])
    print(tenant_user["id"], tenant_user["created_at"])
    print(tenant_user2["id"], tenant_user2["created_at"])
    print(arrow.now())
    assert any(u["id"] == tenant_user["id"] for u in body["data"]) == expected_user1
    assert any(u["id"] == tenant_user2["id"] for u in body["data"]) == expected_user2


def test_get_members_pagination(
    tenant_user,
    tenant_user2,
    tenant_user3,
    sandbox_tenant,
    run_id,
):
    ORDERED_USERS = [tenant_user, tenant_user2, tenant_user3]
    NUM_USERS = len(ORDERED_USERS)
    for i in range(NUM_USERS):
        body = get(
            f"org/members",
            dict(search=f"custom_it_user.{run_id}.fixture", page_size=1, page=i),
            *sandbox_tenant.db_auths,
        )
        assert len(body["data"]) == 1
        assert body["data"][0]["id"] == ORDERED_USERS[i]["id"]
        next_page = body["meta"]["next_page"]
        if i != NUM_USERS - 1:
            assert next_page == i + 1
        else:
            assert not next_page

    # Null page should return first page
    body = get(
        f"org/members",
        dict(search=f"custom_it_user.{run_id}.fixture", page_size=1),
        *sandbox_tenant.db_auths,
    )
    assert len(body["data"]) == 1
    assert body["data"][0]["id"] == tenant_user["id"]


def test_get_members_filter_role_id(run_id, sandbox_tenant, admin_role):
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role filter {suffix}",
        scopes=[{"kind": "read"}, {"kind": "manage_webhooks"}],
        kind="dashboard_user",
    )
    my_role = post("org/roles", role_data, *sandbox_tenant.db_auths)

    email = f"custom_it_user.{run_id}+1111@onefootprint.com"
    tenant_user = create_tenant_user(
        sandbox_tenant, admin_role, email, "Flerp", "Grinman"
    )

    email = f"custom_it_user.{run_id}+2222@onefootprint.com"
    tenant_user2 = create_tenant_user(sandbox_tenant, my_role, email, "Merp", "Wachs")

    tu_role_id = tenant_user["role"]["id"]
    tu2_role_id = tenant_user2["role"]["id"]
    tests = [
        (dict(role_ids=tu_role_id), True, False),
        (
            dict(role_ids=",".join([tu_role_id, tu2_role_id])),
            True,
            True,
        ),
    ]

    for filters, expected_user1, expected_user2 in tests:
        data = dict(page_size=100, **filters)
        body = get(f"org/members", data, *sandbox_tenant.db_auths)
        assert any(u["id"] == tenant_user["id"] for u in body["data"]) == expected_user1
        assert (
            any(u["id"] == tenant_user2["id"] for u in body["data"]) == expected_user2
        )


def test_update_name(sandbox_tenant):
    first_name = f"Footprint {_gen_random_n_digit_number(5)}"
    last_name = f"Integration Testing {_gen_random_n_digit_number(5)}"
    data = dict(first_name=first_name, last_name=last_name)
    body = patch(f"org/member", data, *sandbox_tenant.db_auths)
    assert body["first_name"] == first_name
    assert body["last_name"] == last_name

    body = get(f"org/member", data, *sandbox_tenant.db_auths)
    assert body["first_name"] == first_name
    assert body["last_name"] == last_name


def test_update_user_role(sandbox_tenant, admin_role, limited_role, run_id):
    email = f"custom_it_user.{run_id}+111@onefootprint.com"
    tenant_user = create_tenant_user(
        sandbox_tenant, admin_role, email, "Flerp", "Grinman"
    )

    user_id = tenant_user["id"]
    user_data = dict(role_id=limited_role["id"])
    patch(f"org/members/{user_id}", user_data, *sandbox_tenant.db_auths)

    body = get(f"org/members", dict(page_size=100), *sandbox_tenant.db_auths)
    user = next(u for u in body["data"] if u["id"] == user_id)
    assert user["role"]["id"] == limited_role["id"]


@pytest.fixture
def authed_member_id(sandbox_tenant):
    return get("org/member", None, *sandbox_tenant.db_auths)["id"]


def test_cannot_edit_current_user(authed_member_id, sandbox_tenant, limited_role):
    patch(
        f"org/members/{authed_member_id}",
        dict(role_id=limited_role["id"]),
        *sandbox_tenant.db_auths,
        status_code=400,
    )


def test_cannot_deactivate_current_user(authed_member_id, sandbox_tenant):
    post(
        f"org/members/{authed_member_id}/deactivate",
        None,
        *sandbox_tenant.db_auths,
        status_code=400,
    )


@pytest.mark.parametrize(
    "filters,expected_admin_role,expected_limited_role",
    [
        (None, True, True),  # No filters
        (dict(search="test limit"), False, True),  # Filter on name
    ],
)
def test_get_roles(
    sandbox_tenant,
    limited_role,
    tenant_user,
    tenant_user2,
    tenant_user3,
    admin_role,
    filters,
    expected_admin_role,
    expected_limited_role,
):
    # Need to use these fixtures
    tenant_user
    tenant_user2
    tenant_user3

    filters = dict(page_size=100, kind="dashboard_user", **(filters or dict()))
    body = get(f"org/roles", filters, *sandbox_tenant.db_auths)
    assert any(u["id"] == admin_role["id"] for u in body["data"]) == expected_admin_role
    assert (
        any(u["id"] == limited_role["id"] for u in body["data"])
        == expected_limited_role
    ), f"""Roles IDs: {",".join([u["id"] for u in body["data"]])}. Looking for: {limited_role["id"]}"""

    if expected_limited_role:
        limited_role = next(u for u in body["data"] if u["id"] == limited_role["id"])
        # Check num_active_users
        body = get(
            "org/members", dict(role_ids=limited_role["id"]), *sandbox_tenant.db_auths
        )
        expected_num_users = len(body["data"])
        assert limited_role["num_active_users"] == expected_num_users
        assert limited_role["num_active_api_keys"] != None


def test_update_roles(sandbox_tenant, admin_role):
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test myrole role {suffix}",
        scopes=[{"kind": "read"}, {"kind": "manage_webhooks"}],
        kind="dashboard_user",
    )
    body = post("org/roles", role_data, *sandbox_tenant.db_auths)
    role_id = body["id"]

    patch_data = dict(
        name=f"New myrole name {suffix}",
        scopes=[{"kind": "read"}, {"kind": "onboarding_configuration"}],
    )
    patch(f"org/roles/{role_id}", patch_data, *sandbox_tenant.db_auths)

    body = get("org/roles", None, *sandbox_tenant.db_auths)
    role_ids = set(r["id"] for r in body["data"])
    assert role_id in role_ids
    assert admin_role["id"] in role_ids
    role = next(r for r in body["data"] if r["id"] == role_id)
    assert role["name"] == patch_data["name"]
    assert set(i["kind"] for i in role["scopes"]) == set(
        i["kind"] for i in patch_data["scopes"]
    )


def test_cant_update_admin_role(sandbox_tenant, admin_role):
    role_id = admin_role["id"]
    suffix = _gen_random_n_digit_number(10)
    patch_data = dict(
        name=f"New role name {suffix}",
    )
    patch(
        f"org/roles/{role_id}",
        patch_data,
        *sandbox_tenant.db_auths,
        status_code=400,
    )


@pytest.mark.flaky
def test_deactivate_role_and_user(sandbox_tenant, run_id):
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test myrole role {suffix}",
        scopes=[{"kind": "read"}, {"kind": "manage_webhooks"}],
        kind="dashboard_user",
    )
    my_role = post("org/roles", role_data, *sandbox_tenant.db_auths)

    email = f"custom_it_user.{run_id}+11@onefootprint.com"
    tenant_user = create_tenant_user(sandbox_tenant, my_role, email, "Flerp", "Grinman")

    email = f"custom_it_user.{run_id}+22@onefootprint.com"
    tenant_user2 = create_tenant_user(sandbox_tenant, my_role, email, "Merp", "Wachs")

    email = f"custom_it_user.{run_id}+33@onefootprint.com"
    tenant_user3 = create_tenant_user(
        sandbox_tenant, my_role, email, "Piip", "The Warrior"
    )

    role_id = my_role["id"]
    user_id = tenant_user["id"]
    user_id2 = tenant_user2["id"]
    user_id3 = tenant_user3["id"]

    # Can't deactivate role that has activate users
    post(
        f"org/roles/{role_id}/deactivate",
        None,
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # So we deactivate the users
    post(f"org/members/{user_id}/deactivate", None, *sandbox_tenant.db_auths)
    post(f"org/members/{user_id2}/deactivate", None, *sandbox_tenant.db_auths)
    post(f"org/members/{user_id3}/deactivate", None, *sandbox_tenant.db_auths)

    # And now we can deactivate it
    post(f"org/roles/{role_id}/deactivate", None, *sandbox_tenant.db_auths)

    # Make sure the deactivated user isn't displayed anymore
    body = get("org/members", dict(page_size=100), *sandbox_tenant.db_auths)
    assert user_id not in set(u["id"] for u in body["data"])

    # Make sure the deactivated role isn't displayed anymore
    body = get("org/roles", dict(page_size=100), *sandbox_tenant.db_auths)
    assert role_id not in set(r["id"] for r in body["data"])
