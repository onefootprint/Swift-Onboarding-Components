import pytest
from tests.utils import (
    HttpError,
    get,
    post,
    put,
    delete,
)


def test_partner_document_flow(tenant, partner_tenant):
    # List partnerships
    companies = get("compliance/partners", {}, *partner_tenant.ro_db_auths)

    assert len(companies) == 1
    company = companies[0]

    partnership_id = company["id"]
    assert company["company_name"] == tenant.name
    assert company["num_controls_complete"] >= 0
    assert company["num_controls_total"] >= 0
    assert company["num_active_playbooks"] >= 0

    # Create a template
    template = post("compliance/doc_templates", {
        "name": "name v1",
        "description": "description v1",
    }, *partner_tenant.db_auths)

    template_id = template["id"]
    assert template["latest_version"]["name"] == "name v1"
    assert template["latest_version"]["description"] == "description v1"

    # List templates
    templates = get("compliance/doc_templates", {}, *partner_tenant.ro_db_auths)
    assert template in templates

    # Update template
    template = put(f"compliance/doc_templates/{template_id}", {
        "name": "name v2",
        "description": "description v2",
    }, *partner_tenant.db_auths)

    template_id = template["id"]
    assert template["latest_version"]["name"] == "name v2"
    assert template["latest_version"]["description"] == "description v2"

    # List document templates and check for update
    templates = get("compliance/doc_templates", {}, *partner_tenant.ro_db_auths)
    assert template in templates

    # List documents
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    assert len(documents) == 0

    # Delete the template
    delete(f"compliance/doc_templates/{template_id}", {}, *partner_tenant.db_auths)

    # List document templates and check for deletion
    templates = get("compliance/doc_templates", {}, *partner_tenant.ro_db_auths)
    assert template not in templates
