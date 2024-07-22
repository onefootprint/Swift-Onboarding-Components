import pytest
from tests.utils import (
    get,
    patch,
    post,
    _gen_random_str,
)


def test_partner_tenant_iam(tenant, partner_tenant):
    # Should be able to access a read-only compliance API with both partner
    # admin and read-only auth.
    get("partner/partnerships", {}, *partner_tenant.db_auths)
    get("partner/partnerships", {}, *partner_tenant.ro_db_auths)

    # Regular tenant should not be able to access the partner APIs.
    get("partner/partnerships", {}, *tenant.db_auths, status_code=401)
    get("partner/partnerships", {}, *tenant.ro_db_auths, status_code=401)

    # Should be able to access APIs stubbed out to common implementations.
    get("partner/roles", {}, *partner_tenant.db_auths)
    get("partner/roles", {}, *partner_tenant.ro_db_auths)

    # Should not be able to access an org API with either partner role.
    get("org/roles", {}, *partner_tenant.db_auths, status_code=401)
    get("org/roles", {}, *partner_tenant.ro_db_auths, status_code=401)

    # Get the orgs this tenant can access.
    roles = get("partner/auth/roles", {}, *partner_tenant.db_auths)
    assert len(roles) == 1
    assert roles[0]["id"] == partner_tenant.id


def test_partner_tenant_iam_roles(partner_tenant):
    # Create a role.
    name = "test " + _gen_random_str(16)
    post(
        "partner/roles",
        {
            "kind": "compliance_partner_dashboard_user",
            "name": name,
            "scopes": [{"kind": "compliance_partner_read"}],
        },
        *partner_tenant.db_auths,
    )

    # Can't create with read-only auth.
    post(
        "partner/roles",
        {
            "kind": "compliance_partner_dashboard_user",
            "name": name,
            "scopes": [{"kind": "compliance_partner_read"}],
        },
        *partner_tenant.ro_db_auths,
        status_code=403,
    )

    # Check that it was created.
    resp = get(
        "partner/roles",
        {
            "search": name,
        },
        *partner_tenant.db_auths,
    )
    assert len(resp["data"]) == 1
    role = resp["data"][0]
    role_id = role["id"]
    assert role["kind"] == "compliance_partner_dashboard_user"
    assert role["name"] == name
    assert role["scopes"] == [{"kind": "compliance_partner_read"}]

    # Update the role.
    name += _gen_random_str(16)
    patch(
        f"partner/roles/{role_id}",
        {
            "name": name,
        },
        *partner_tenant.db_auths,
    )

    # Can't update with read-only auth.
    patch(
        f"partner/roles/{role_id}",
        {
            "name": name + _gen_random_str(16),
        },
        *partner_tenant.ro_db_auths,
        status_code=403,
    )

    # Check that it was updated.
    resp = get(
        "partner/roles",
        {
            "search": name,
        },
        *partner_tenant.db_auths,
    )
    assert len(resp["data"]) == 1
    role = resp["data"][0]
    assert role["id"] == role_id
    assert role["kind"] == "compliance_partner_dashboard_user"
    assert role["name"] == name
    assert role["scopes"] == [{"kind": "compliance_partner_read"}]

    # Can't deactivate with read-only auth.
    post(
        f"partner/roles/{role_id}/deactivate",
        {},
        *partner_tenant.ro_db_auths,
        status_code=403,
    )

    # Deactivate the role.
    post(f"partner/roles/{role_id}/deactivate", {}, *partner_tenant.db_auths)

    # Check that it was deactivated
    resp = get(
        "partner/roles",
        {
            "search": name,
        },
        *partner_tenant.db_auths,
    )
    assert len(resp["data"]) == 0
