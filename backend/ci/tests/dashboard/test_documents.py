import pytest
from tests.dashboard.utils import latest_access_event_for
from tests.utils import (
    get,
    post,
    get_raw,
)

from tests.bifrost_client import BifrostClient
from tests.utils import compare_contents, compare_b64_contents, open_multipart_file


@pytest.fixture(scope="session")
def user_with_documents(doc_request_sandbox_ob_config):
    """
    Create a user with registered data and webuathn creds and onboard them onto the document_requesting_tenant_session_scoped
    with document info as well
    """
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)
    user = bifrost.run()
    doc_requirement = next(
        r for r in bifrost.handled_requirements if r["kind"] == "collect_document"
    )
    assert doc_requirement["config"]["should_collect_selfie"]

    return user


# Check which things are available in the vault
def test_tenant_document_get_decrypt(user_with_documents):
    tenant = user_with_documents.tenant
    resp = get(
        f"users/{user_with_documents.fp_id}/vault",
        None,
        tenant.sk.key,
        status_code=200,
    )
    assert resp["document.drivers_license.front.image"]
    assert resp["document.drivers_license.selfie.image"]
    assert resp["document.drivers_license.document_number"]
    assert resp["document.drivers_license.issuing_state"]
    assert resp["document.drivers_license.expires_at"]
    assert resp["document.drivers_license.full_name"]
    assert resp["document.drivers_license.issuing_country"]
    assert resp["document.drivers_license.full_address"]
    assert resp["document.drivers_license.gender"]
    assert resp["document.drivers_license.dob"]


def test_tenant_document_decrypt(user_with_documents):
    tenant = user_with_documents.tenant
    fields = [
        "document.drivers_license.front.latest_upload",
        "document.drivers_license.front.image",
        "document.drivers_license.document_number",
        "document.drivers_license.issuing_state",
        "document.drivers_license.expires_at",
        "document.drivers_license.dob",
    ]
    data = {
        "fields": fields,
        "reason": "Responding to a customer request",
    }

    resp = post(f"users/{user_with_documents.fp_id}/vault/decrypt", data, tenant.sk.key)

    assert compare_b64_contents(
        resp["document.drivers_license.front.latest_upload"],
        "drivers_license.front.png",
    )
    assert compare_b64_contents(
        resp["document.drivers_license.front.image"], "drivers_license.front.png"
    )
    # These OCR values come from TEST_ONLY_FIXTURE
    assert resp["document.drivers_license.document_number"] == "Y12341234"
    assert resp["document.drivers_license.issuing_state"] == "CALIFORNIA"
    assert resp["document.drivers_license.expires_at"] == "2024-10-15"
    # by default, we put the id.dob into the OCR response in sandbox
    assert resp["document.drivers_license.dob"] == "1995-12-25"

    access_event = latest_access_event_for(user_with_documents.fp_id, tenant)
    assert set(access_event["targets"]) == set(fields)


def test_tenant_document_decrypt_download(user_with_documents):
    tenant = user_with_documents.tenant
    fields = [
        "document.drivers_license.front.image",
    ]
    data = {
        "fields": fields,
        "scopes": ["decrypt_download"],
        "decrypt_reason": "Responding to a customer request",
    }

    body = post(f"users/{user_with_documents.fp_id}/client_token", data, tenant.sk.key)
    token = body["token"]

    # Make raw request since the downloaded content is not json
    response = get_raw(f"users/vault/decrypt/{token}")
    assert response.headers.get("content-disposition") == "attachment"
    assert response.headers.get("content-type") == "image/png"
    assert compare_contents(response.content, "drivers_license.front.png")

    access_event = latest_access_event_for(user_with_documents.fp_id, tenant)
    assert set(access_event["targets"]) == set(fields)


def test_get_entity_documents(user_with_documents):
    tenant = user_with_documents.tenant
    fp_id = user_with_documents.fp_id
    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    doc = body[0]
    assert doc["kind"] == "drivers_license"
    assert doc["status"] == "complete"
    assert all(u["failure_reasons"] == [] for u in doc["uploads"])
    front = next(u for u in doc["uploads"] if u["side"] == "front")
    back = next(u for u in doc["uploads"] if u["side"] == "back")
    selfie = next(u for u in doc["uploads"] if u["side"] == "selfie")
    assert front["version"] < back["version"]
    assert back["version"] < selfie["version"]
    assert selfie["version"] < doc["completed_version"]


def test_get_entity_documents_uploaded_via_api(sandbox_tenant):
    body = post("users", None, sandbox_tenant.sk.key)
    fp_id = body["id"]

    post(
        f"users/{fp_id}/vault/document.drivers_license.front.image/upload",
        None,
        sandbox_tenant.sk.key,
        files=open_multipart_file("drivers_license.front.png", "image/png")(),
    )

    body = get(f"entities/{fp_id}/documents", None, *sandbox_tenant.db_auths)
    doc = body[0]
    assert doc["kind"] == "drivers_license"
    assert not doc["status"]
    assert not doc["started_at"]
    assert doc["upload_source"] == "api"
    assert all(u["failure_reasons"] == [] for u in doc["uploads"])
    assert any(u["side"] == "front" for u in doc["uploads"])


def test_decrypt_historical(user_with_documents):
    tenant = user_with_documents.tenant
    fp_id = user_with_documents.fp_id
    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    doc = body[0]
    assert doc["kind"] == "drivers_license"
    front = next(u for u in doc["uploads"] if u["side"] == "front")
    front_version = front["version"]
    ocr_data_version = doc["completed_version"]

    fields = [
        "id.first_name",
        "document.drivers_license.front.latest_upload",
        f"document.drivers_license.front.latest_upload:{front_version}",
        f"document.drivers_license.front.latest_upload:{front_version - 1}",
        "document.drivers_license.document_number",
        f"document.drivers_license.document_number:{ocr_data_version}",
        f"document.drivers_license.document_number:{ocr_data_version - 1}",
    ]
    data = {
        "fields": fields,
        "reason": "Testing historical decryption",
    }
    body = post(f"users/{user_with_documents.fp_id}/vault/decrypt", data, tenant.sk.key)

    assert compare_b64_contents(
        body["document.drivers_license.front.latest_upload"],
        "drivers_license.front.png",
    )
    assert compare_b64_contents(
        body[f"document.drivers_license.front.latest_upload:{front_version}"],
        "drivers_license.front.png",
    )
    # Version before created version should be empty
    assert (
        body[f"document.drivers_license.front.latest_upload:{front_version - 1}"]
        == None
    )
    assert body["document.drivers_license.document_number"] == "Y12341234"
    assert (
        body[f"document.drivers_license.document_number:{ocr_data_version}"]
        == "Y12341234"
    )
    # Version before created version should be empty
    assert (
        body[f"document.drivers_license.document_number:{ocr_data_version - 1}"] == None
    )

    body = get(
        "org/access_events",
        dict(search=fp_id),
        *tenant.db_auths,
    )
    access_event = body["data"][0]
    assert set(access_event["targets"]) == set(
        [
            "id.first_name",
            "document.drivers_license.front.latest_upload",
            "document.drivers_license.document_number",
        ]
    )
