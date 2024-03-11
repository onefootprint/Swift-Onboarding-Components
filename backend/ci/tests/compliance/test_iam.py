import json
import arrow
import pytest
from tests.headers import IsLive
from tests.utils import (
    HttpError,
    get,
    post,
    patch,
    _gen_random_n_digit_number,
)


def test_partner_tenant_iam(tenant, partner_tenant):
    # Should be able to access a compliance API with partner admin and read-only auth.
    body = get("compliance/companies", {}, *partner_tenant.db_auths)
    assert body == {}
    body = get("compliance/companies", {}, *partner_tenant.ro_db_auths)
    assert body == {}

    # Regular tenant should not be able to access the partner APIs.
    get("compliance/companies", {}, *tenant.db_auths, status_code=401)
    get("compliance/companies", {}, *tenant.ro_db_auths, status_code=401)

    # Should not be able to access an org API with either partner role.
    get("org/roles", {"kind": "dashboard_user"}, *partner_tenant.db_auths, status_code=401)
    get("org/roles", {"kind": "dashboard_user"}, *partner_tenant.ro_db_auths, status_code=401)

