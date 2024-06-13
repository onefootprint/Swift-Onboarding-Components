from tests.utils import get, patch


def test_super_admin_users(sandbox_user, tenant):
    # This user belongs to a different tenant. A firm employee auth context should be able to get
    # basic info on this user
    fp_id = sandbox_user.fp_id
    body = get(f"private/entities/{fp_id}", None, *tenant.db_auths)
    assert body["id"] == fp_id
    assert not body["is_live"]
    assert body["tenant_id"] == sandbox_user.tenant.id

    # Prove we're using a different auth class
    org = get(f"org", None, *tenant.db_auths)
    assert org["id"] != sandbox_user.tenant.id


def test_private_tenants(tenant, sandbox_tenant, foo_sandbox_tenant):
    foo_sandbox_tenant  # Just need to use the fixture
    pagination = dict(page_size=100)
    body = get("private/tenants", pagination, *tenant.db_auths)

    assert any(i["id"] == tenant.id for i in body["data"])
    assert any(i["id"] == sandbox_tenant.id for i in body["data"])

    # Test filtering search
    body = get(
        "private/tenants", dict(search="Footprint", **pagination), *tenant.db_auths
    )
    assert len(body["data"]) >= 3  # At least all integration testing tenants
    assert all("footprint" in i["name"].lower() for i in body["data"])

    # Test filtering is_live
    body = get("private/tenants", dict(is_live="true", **pagination), *tenant.db_auths)
    assert all(i["is_live"] for i in body["data"])

    # Test filtering has_domains
    body = get(
        "private/tenants",
        dict(only_with_domains="true", **pagination),
        *tenant.db_auths,
    )
    assert all(i["domains"] for i in body["data"])


def test_cannot_patch_tenant(tenant, sandbox_tenant):
    """
    Make sure only risk ops firm employees can update the tenant, and that the integration testing
    user doesn't have permission
    """
    body = patch(
        f"private/tenants/{sandbox_tenant.id}",
        dict(),
        *tenant.db_auths,
        status_code=401,
    )
    assert body["message"] == "Not allowed: user is not a risk ops firm employee"
