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

    # Request a document from the template.
    template_doc = post(f"compliance/partners/{partnership_id}/documents", {
        "template_version_id": template["latest_version"]["id"],
        "name": "edited template name",
        "description": "edited template description",
    }, *partner_tenant.db_auths)

    # List documents and check that the new document is present.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["name"] == "edited template name"
    assert doc["description"] == "edited template description"
    assert doc["status"] == "waiting_for_upload"
    assert doc["template_id"] == template["id"]

    # Request a document ad-hoc.
    ad_hoc_doc = post(f"compliance/partners/{partnership_id}/documents", {
        "name": "ad-hoc template name",
        "description": "ad-hoc template description",
    }, *partner_tenant.db_auths)

    # List documents and check that the new document is present.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    assert doc["name"] == "ad-hoc template name"
    assert doc["description"] == "ad-hoc template description"
    assert doc["status"] == "waiting_for_upload"
    assert doc["template_id"] is None

    # Delete the ad-hoc request.
    req_id = doc["latest_request_id"]
    delete(f"compliance/partners/{partnership_id}/requests/{req_id}", {}, *partner_tenant.db_auths)

    # The ad-hoc document should be in the "not_requested" state.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    assert doc["status"] == "not_requested"
    # Most recent deactivated request names are used in the document list.
    assert doc["name"] == "ad-hoc template name"
    assert doc["description"] == "ad-hoc template description"

    # Request re-upload of the ad-hoc document.
    doc_id = doc["id"]
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reupload", {
        "name": "edited ad-hoc name 2",
        "description": "edited ad-hoc description 2",
    }, *partner_tenant.db_auths)
    # New names are used in the document list and the status is updated.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    assert doc["status"] == "waiting_for_upload"
    assert doc["name"] == "edited ad-hoc name 2"
    assert doc["description"] == "edited ad-hoc description 2"
    old_latest_request_id = doc["latest_request_id"]

    # Request another re-upload of the ad-hoc document.
    doc_id = doc["id"]
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reupload", {
        "name": "edited ad-hoc name 2",
        "description": "edited ad-hoc description 2",
    }, *partner_tenant.db_auths)
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    latest_request_id = doc["latest_request_id"]
    assert latest_request_id != old_latest_request_id

    # We shouldn't be able to delete the old request.
    resp = delete(f"compliance/partners/{partnership_id}/requests/{old_latest_request_id}", {}, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "Cannot retract this compliance document request since there is a newer request for this document"

    # We can delete the most recent requests.
    delete(f"compliance/partners/{partnership_id}/requests/{latest_request_id}", {}, *partner_tenant.db_auths)

    # There should now be no requests for the ad-hoc document.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    assert doc["latest_request_id"] is None

    # Requesting a document from the same template yields an error.
    resp = post(f"compliance/partners/{partnership_id}/documents", {
        "template_version_id": template["latest_version"]["id"],
        "name": "edited template name 2",
        "description": "edited template description 2",
    }, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "A compliance document request already exists for this template"

    # Delete the template
    delete(f"compliance/doc_templates/{template_id}", {}, *partner_tenant.db_auths)

    # List document templates and check for deletion
    templates = get("compliance/doc_templates", {}, *partner_tenant.ro_db_auths)
    assert template not in templates

    # The template doc is still present after deleting the template.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["name"] == "edited template name"
    assert doc["description"] == "edited template description"
    assert doc["status"] == "waiting_for_upload"
