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

    resp = post(
        f"users/{user_with_documents.fp_id}/vault/decrypt",
        data,
        tenant.sk.key,
        status_code=200,
    )

    assert resp["document.drivers_license.front.latest_upload"] == test_image_dl_front
    assert resp["document.drivers_license.front.image"] == test_image_dl_front
    # These OCR values come from TEST_ONLY_FIXTURE
    assert resp["document.drivers_license.document_number"] == "Y12341234"
    assert resp["document.drivers_license.issuing_state"] == "MA"
    assert resp["document.drivers_license.expires_at"] == "2024-10-15"
    assert resp["document.drivers_license.dob"] == "1986-10-16"

    access_event = latest_access_event_for(user_with_documents.fp_id, tenant.sk)
    assert set(access_event["targets"]) == set(fields)
