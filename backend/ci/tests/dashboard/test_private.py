from tests.utils import get


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


def test_private_tenants(tenant, sandbox_tenant):
    body = get("private/tenants", None, *tenant.db_auths)

    assert any(i["id"] == tenant.id for i in body)
    assert any(i["id"] == sandbox_tenant.id for i in body)

    # Test filtering search
    body = get("private/tenants", dict(search="Footprint"), *tenant.db_auths)
    assert len(body) >= 3  # At least all integration testing tenants
    assert all("footprint" in i["name"].lower() for i in body)

    # Test filtering is_live
    body = get("private/tenants", dict(is_live="true"), *tenant.db_auths)
    assert all(i["is_live"] for i in body)

    # Test filtering has_domains
    body = get("private/tenants", dict(only_with_domains="true"), *tenant.db_auths)
    assert all(i["domains"] for i in body)
