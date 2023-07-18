import pytest
from tests.dashboard.utils import latest_access_event_for
from tests.utils import (
    get,
    post,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def user_with_documents(doc_request_sandbox_ob_config, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the document_requesting_tenant_session_scoped
    with document info as well
    """
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config, twilio)
    user = bifrost.run()
    doc_requirement = next(
        r for r in bifrost.handled_requirements if r["kind"] == "collect_document"
    )
    assert doc_requirement["should_collect_selfie"]

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


# Test decryption of vaulted documents
def test_tenant_document_decrypt(user_with_documents):
    from tests.image_fixtures import test_image_dl_front

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

    assert resp["document.drivers_license.front.latest_upload"] == test_image_dl_front
    assert resp["document.drivers_license.front.image"] == test_image_dl_front
    # These OCR values come from TEST_ONLY_FIXTURE
    assert resp["document.drivers_license.document_number"] == "Y12341234"
    assert resp["document.drivers_license.issuing_state"] == "CALIFORNIA"
    assert resp["document.drivers_license.expires_at"] == "2024-10-15"
    assert resp["document.drivers_license.dob"] == "1986-10-16"

    access_event = latest_access_event_for(user_with_documents.fp_id, tenant.sk)
    assert set(access_event["targets"]) == set(fields)


def test_get_entity_documents(user_with_documents):
    tenant = user_with_documents.tenant
    fp_id = user_with_documents.fp_id
    body = get(f"entities/{fp_id}/documents", None, tenant.sk.key)
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


def test_decrypt_historical(user_with_documents):
    from tests.image_fixtures import test_image_dl_front

    tenant = user_with_documents.tenant
    fp_id = user_with_documents.fp_id
    body = get(f"entities/{fp_id}/documents", None, tenant.sk.key)
    doc = body[0]
    assert doc["kind"] == "drivers_license"
    front = next(u for u in doc["uploads"] if u["side"] == "front")
    front_version = front["version"]
    ocr_data_version = doc["completed_version"]

    fields = [
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

    assert body["document.drivers_license.front.latest_upload"] == test_image_dl_front
    assert (
        body[f"document.drivers_license.front.latest_upload:{front_version}"]
        == test_image_dl_front
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
