import pytest
from tests.utils import (
    HttpError,
    get,
    post,
)


def test_partner_companies(tenant, partner_tenant):
    body = get("compliance/partners", {}, *partner_tenant.ro_db_auths)

    assert len(body["companies"]) == 1
    company = body["companies"][0]

    assert company["company_name"] == tenant.name
    assert company["num_controls_complete"] >= 0
    assert company["num_controls_total"] >= 0
    assert company["num_active_playbooks"] >= 0
