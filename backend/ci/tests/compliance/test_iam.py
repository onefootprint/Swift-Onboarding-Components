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
    get("compliance/partners", {}, *partner_tenant.db_auths)
    get("compliance/partners", {}, *partner_tenant.ro_db_auths)

    # Regular tenant should not be able to access the partner APIs.
    get("compliance/partners", {}, *tenant.db_auths, status_code=401)
    get("compliance/partners", {}, *tenant.ro_db_auths, status_code=401)

    # Should be able to access a admin compliance API only with partner
    # admin auth.
    post("compliance/members", {}, *partner_tenant.db_auths)
    post("compliance/members", {}, *partner_tenant.ro_db_auths, status_code=401)

    # Regular tenant should not be able to access the admin partner APIs.
    post("compliance/members", {}, *tenant.db_auths, status_code=401)
    post("compliance/members", {}, *tenant.ro_db_auths, status_code=401)

    # Should be able to access APIs that accept either tenant or partner tenant auth.
    get("org/roles", {}, *partner_tenant.db_auths)
    get("org/roles", {}, *partner_tenant.ro_db_auths)
    get("org/roles", {}, *tenant.db_auths)
    get("org/roles", {}, *tenant.ro_db_auths)

    # Should not be able to access an org API with either partner role.
    get("org/client_security_config", {}, *partner_tenant.db_auths, status_code=401)
    get("org/client_security_config", {}, *partner_tenant.ro_db_auths, status_code=401)


def test_partner_tenant_iam_roles(partner_tenant):
    # Create a role.
    name = "test " + _gen_random_str(16)
    post("org/roles", {
      "kind": "compliance_partner_dashboard_user",
      "name": name,
      "scopes": [
        {
          "kind": "compliance_partner_read"
        }
      ]
    }, *partner_tenant.db_auths)

    # Can't create with read-only auth.
    post("org/roles", {
      "kind": "compliance_partner_dashboard_user",
      "name": name,
      "scopes": [
        {
          "kind": "compliance_partner_read"
        }
      ]
    }, *partner_tenant.ro_db_auths, status_code=401)

    # Check that it was created.
    resp = get("org/roles", {
        "search": name,
    }, *partner_tenant.db_auths)
    assert len(resp["data"]) == 1
    role = resp["data"][0]
    role_id = role["id"]
    assert role["kind"] == "compliance_partner_dashboard_user"
    assert role["name"] == name
    assert role["scopes"] == [{"kind": "compliance_partner_read"}]

    # Update the role.
    name += _gen_random_str(16)
    patch(f"org/roles/{role_id}", {
        "name": name,
    }, *partner_tenant.db_auths)

    # Can't update with read-only auth.
    patch(f"org/roles/{role_id}", {
        "name": name + _gen_random_str(16),
    }, *partner_tenant.ro_db_auths, status_code=401)

    # Check that it was updated.
    resp = get("org/roles", {
        "search": name,
    }, *partner_tenant.db_auths)
    assert len(resp["data"]) == 1
    role = resp["data"][0]
    assert role["id"] == role_id
    assert role["kind"] == "compliance_partner_dashboard_user"
    assert role["name"] == name
    assert role["scopes"] == [{"kind": "compliance_partner_read"}]

    # Can't deactivate with read-only auth.
    post(f"org/roles/{role_id}/deactivate", {}, *partner_tenant.ro_db_auths, status_code=401)

    # Deactivate the role.
    post(f"org/roles/{role_id}/deactivate", {}, *partner_tenant.db_auths)

    # Check that it was deactivated
    resp = get("org/roles", {
        "search": name,
    }, *partner_tenant.db_auths)
    assert len(resp["data"]) == 0
