import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config, post


@pytest.fixture(scope="session")
def restricted_doc_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant,
        "Restricted doc request config",
        must_collect_data + ["document.drivers_license.us_only.require_selfie"],
        can_access_data + ["document.drivers_license.us_only.require_selfie"],
    )


def test_upload_documents(doc_request_sandbox_ob_config, twilio):
    # TODO need to make this with non-sandbox in order to actually test workflow
    bifrost = BifrostClient(doc_request_sandbox_ob_config, twilio)
    bifrost.run()

    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)


def test_upload_documents_with_ob_config_restriction(restricted_doc_ob_config, twilio):
    bifrost = BifrostClient(restricted_doc_ob_config, twilio)

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload non-US document
    data = {
        "document_type": "driver_license",
        "country_code": "NO",
        "front_image": "flerpblerp",
    }
    body = post("hosted/user/document", data, bifrost.auth_token, status_code=400)
    assert body["error"]["message"] == "Non-US documents are not supported"

    # Shouldn't be allowed to upload non-drivers-license
    data = {
        "document_type": "id_card",
        "country_code": "US",
        "front_image": "flerpblerp",
    }
    body = post("hosted/user/document", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: drivers_license"
    )

    # Bifrost client uploads the right kind of doc, so this should work
    bifrost.run()
