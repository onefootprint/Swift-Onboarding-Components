import pytest
from tests.utils import (
    HttpError,
    get,
    post,
)


def test_partner_companies(tenant, partner_tenant):
    companies = get("compliance/partners", {}, *partner_tenant.ro_db_auths)

    assert len(companies) == 1
    company = companies[0]

    partnership_id = company["id"]
    assert company["company_name"] == tenant.name
    assert company["num_controls_complete"] >= 0
    assert company["num_controls_total"] >= 0
    assert company["num_active_playbooks"] >= 0

    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    assert len(documents) == 0

