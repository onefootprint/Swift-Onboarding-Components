import pytest
from tests.utils import (
    get,
    post,
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
    post("compliance/org/members", {}, *partner_tenant.db_auths)
    post("compliance/org/members", {}, *partner_tenant.ro_db_auths, status_code=401)

    # Regular tenant should not be able to access the admin partner APIs.
    post("compliance/org/members", {}, *tenant.db_auths, status_code=401)
    post("compliance/org/members", {}, *tenant.ro_db_auths, status_code=401)

    # Should not be able to access an org API with either partner role.
    get("org/roles", {"kind": "dashboard_user"}, *partner_tenant.db_auths, status_code=401)
    get("org/roles", {"kind": "dashboard_user"}, *partner_tenant.ro_db_auths, status_code=401)
