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
    req_id = doc["active_request_id"]
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
    old_active_request_id = doc["active_request_id"]

    # Request another re-upload of the ad-hoc document.
    doc_id = doc["id"]
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reupload", {
        "name": "edited ad-hoc name 2",
        "description": "edited ad-hoc description 2",
    }, *partner_tenant.db_auths)
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    active_request_id = doc["active_request_id"]
    assert active_request_id != old_active_request_id

    # We shouldn't be able to delete the old request.
    resp = delete(f"compliance/partners/{partnership_id}/requests/{old_active_request_id}", {}, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "Can only retract the latest active request"

    # We shouldn't be able to submit a document for the old request.
    doc_id = doc["id"]
    resp = post(f"org/partners/{partnership_id}/documents/{doc_id}/submissions", {
        "request_id": old_active_request_id,
        "url": "https://example.com",
    }, *tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "Can only submit documents for the latest request"

    # We can delete the most recent requests.
    delete(f"compliance/partners/{partnership_id}/requests/{active_request_id}", {}, *partner_tenant.db_auths)

    # There should now be no requests for the ad-hoc document.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == ad_hoc_doc["id"]), None)
    assert doc["active_request_id"] is None

    # Requesting a document from the same template yields an error.
    resp = post(f"compliance/partners/{partnership_id}/documents", {
        "template_version_id": template["latest_version"]["id"],
        "name": "edited template name 2",
        "description": "edited template description 2",
    }, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "A compliance document request already exists for this template"

    # Submit an external URL for the template document.
    doc_id = template_doc["id"]
    request_id = template_doc["active_request_id"]
    post(f"org/partners/{partnership_id}/documents/{doc_id}/submissions", {
        "request_id": request_id,
        "url": "https://example.com/oops",
    }, *tenant.db_auths)
    # The document should now be waiting for review.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["status"] == "waiting_for_review"
    old_submission_id = doc["active_submission_id"]

    # Re-submit for the template document, as if the tenant is fixing a mistake.
    doc_id = template_doc["id"]
    request_id = template_doc["active_request_id"]
    post(f"org/partners/{partnership_id}/documents/{doc_id}/submissions", {
        "request_id": request_id,
        "url": "https://example.com",
    }, *tenant.db_auths)
    # The document should now be waiting for review.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["status"] == "waiting_for_review"

    # We shouldn't be able to delete a document that has submissions.
    resp = delete(f"compliance/partners/{partnership_id}/requests/{request_id}", {}, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "Cannot retract a compliance document request with submissions"

    # We shouldn't be able to review an old submission.
    resp = post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reviews", {
        "submission_id": old_submission_id,
        "decision": "accepted",
        "note": "lgtm",
    }, *partner_tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "Can only review the latest submission"

    # Accept the submission.
    sub_id = doc["active_submission_id"]
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reviews", {
        "submission_id": sub_id,
        "decision": "accepted",
        "note": "lgtm",
    }, *partner_tenant.db_auths)
    # The document should now be accepted.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["status"] == "accepted"

    # Re-review the latest submission.
    prev_request_id = doc["active_request_id"]
    sub_id = doc["active_submission_id"]
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reviews", {
        "submission_id": sub_id,
        "decision": "rejected",
        "note": "try again",
    }, *partner_tenant.db_auths)
    # The document should be waiting for upload.
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    # There should be a new request issued.
    assert doc["active_request_id"] != prev_request_id
    assert doc["status"] == "waiting_for_upload"

    # We shouldn't be able to review the old submission.
    post(f"compliance/partners/{partnership_id}/documents/{doc_id}/reviews", {
        "submission_id": sub_id,
        "decision": "rejected",
        "note": "this won't work",
    }, *partner_tenant.db_auths, status_code=400)

    # Deleting the latest request should put the document in the "not_requested" state.
    request_id = doc["active_request_id"]
    delete(f"compliance/partners/{partnership_id}/requests/{request_id}", {}, *partner_tenant.db_auths)
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["status"] == "not_requested"

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
    assert doc["status"] == "not_requested"

    # Assign the document to a tenant user.
    doc_id = doc["id"]
    assignee = get("org/members", {}, *tenant.ro_db_auths)["data"][0]
    post(f"org/partners/{partnership_id}/documents/{doc_id}/assignments", {
        "user_id": assignee["id"],
    }, *tenant.db_auths)
    # TODO: use a tenant-facing GET API once we make one
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["tenant_assignee"]["id"] == assignee["id"]
    assert doc["tenant_assignee"]["first_name"] == assignee["first_name"]
    assert doc["tenant_assignee"]["last_name"] == assignee["last_name"]

    # Assigning a bogus user ID should fail.
    resp = post(f"org/partners/{partnership_id}/documents/{doc_id}/assignments", {
        "user_id": "testing",
    }, *tenant.db_auths, status_code=400)
    assert resp["error"]["message"] == "User not a member of tenant"

    # Remove the assignment.
    post(f"org/partners/{partnership_id}/documents/{doc_id}/assignments", {
        "user_id": None,
    }, *tenant.db_auths)
    documents = get(f"compliance/partners/{partnership_id}/documents", {}, *partner_tenant.ro_db_auths)
    doc = next((doc for doc in documents if doc["id"] == template_doc["id"]), None)
    assert doc["tenant_assignee"] is None
