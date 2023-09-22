import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config, post, get, get_requirement_from_requirements


@pytest.fixture(scope="session")
def restricted_doc_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant,
        "Restricted doc request config",
        must_collect_data + ["document.drivers_license.us_only.require_selfie"],
        can_access_data + ["document.drivers_license.us_only.require_selfie"],
    )


@pytest.fixture(scope="session")
def restricted_doc_ob_config_only_international(
    sandbox_tenant, must_collect_data, can_access_data
):
    return create_ob_config(
        sandbox_tenant,
        "Restricted doc request config (new)",
        # technically we don't support DL for anything other than US, so this is just so we can simulate the correct error
        must_collect_data + ["document.drivers_license,passport.none.require_selfie"],
        can_access_data + ["document.drivers_license,passport.none.require_selfie"],
        allow_international_residents=True,
        international_country_restrictions=["MX"],
    )


def test_upload_documents(doc_request_sandbox_ob_config, twilio):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config, twilio)

    # First, make a few upload sessions that are aborted
    data = {
        "document_type": "id_card",
        "country_code": "US",
    }
    post("hosted/user/documents", data, bifrost.auth_token)
    data = {
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/user/documents", data, bifrost.auth_token)

    # Running bifrost should create a new identity document upload session
    user = bifrost.run()
    fp_id = user.fp_id
    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)

    tenant = bifrost.ob_config.tenant
    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    assert len([i for i in body if i["kind"] == "id_card"]) == 1
    assert len([i for i in body if i["kind"] == "drivers_license"]) == 2

    users_docs = get(f"users/{fp_id}/documents", None, *tenant.db_auths)
    assert users_docs[0]["document_type"] == "drivers_license"


def test_upload_documents_with_ob_config_restriction_legacy_version(
    restricted_doc_ob_config, twilio
):
    bifrost = BifrostClient.new(restricted_doc_ob_config, twilio)

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload non-US document
    data = {
        "document_type": "drivers_license",
        "country_code": "NO",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert body["error"]["message"].startswith(
        "Unsupported document country. Supported document countries:"
    )
    assert set(
        body["error"]["message"].split(":")[1].replace(" ", "").split(",")
    ) == set(["UM", "VI", "MP", "GU", "PR", "AS", "US"])

    # Shouldn't be allowed to upload non-drivers-license
    data = {
        "document_type": "id_card",
        "country_code": "US",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: drivers_license"
    )

    # Bifrost client uploads the right kind of doc, so this should work
    user = bifrost.run()
    fp_id = user.fp_id
    tenant = bifrost.ob_config.tenant
    users_docs = get(f"users/{fp_id}/documents", None, *tenant.db_auths)
    assert users_docs[0]["document_type"] == "drivers_license"


def test_upload_documents_with_ob_config_restriction(
    restricted_doc_ob_config_only_international, twilio
):
    bifrost = BifrostClient.new(restricted_doc_ob_config_only_international, twilio)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")
    # make sure we've collected country
    met_requirement = get_requirement_from_requirements(
        "collect_data", bifrost.get_status()["all_requirements"], is_met=True
    )
    assert "full_address" in met_requirement["populated_attributes"]

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload DL
    data = {
        "document_type": "drivers_license",
        "country_code": "MX",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: passport"
    )

    # Can upload a non-US passport
    data = {
        "document_type": "passport",
        "country_code": "NO",
    }
    post("hosted/user/documents", data, bifrost.auth_token)

    # Can upload a US DL
    data = {
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/user/documents", data, bifrost.auth_token)

    bifrost.handle_requirements(kind="collect_document")
    status_after_doc_upload = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status_after_doc_upload["all_requirements"]
    )["fields_to_authorize"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    # despite having created identity documents for NO passport, MX DL, we only actually uploaded successfully a DL
    assert document_types_to_authorize == ["drivers_license"]


def test_user_skipping_selfie(doc_request_sandbox_ob_config, twilio):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config, twilio)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")
    status = bifrost.get_status()
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )

    assert doc_requirement["should_collect_selfie"]
    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    data = {
        "document_type": "drivers_license",
        "country_code": "US",
        "skip_selfie": True,
        "device_type": "desktop",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token)
    doc_id = body["id"]

    # Upload the documents consecutively in separate requests
    sides = ["front", "back"]
    for i, side in enumerate(sides):
        data = dict(
            image=bifrost.data[f"document.drivers_license.{side}.image"],
            side=side,
            mime_type="image/png",
        )
        body = post(f"hosted/user/documents/{doc_id}/upload", data, bifrost.auth_token)
        next_side = sides[i + 1] if i + 1 < len(sides) else None
        assert body["next_side_to_collect"] == next_side
        assert not body["errors"]
    # now check what fields we have to authorize
    status_after_doc = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status_after_doc["all_requirements"]
    )["fields_to_authorize"]
    collected_fields_to_authorize = fields_to_authorize["collected_data"]
    document_types_to_authorize = fields_to_authorize["document_types"]

    # we didn't authorize selfie
    # TODO: i think this should authorize document but not doc + selfie. will check with frontend
    assert "document_and_selfie" not in collected_fields_to_authorize
    assert document_types_to_authorize == ["drivers_license"]

    # finish bifrost
    user = bifrost.run()

    tenant = user.tenant
    fp_id = user.fp_id
    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    assert all([d["upload_source"] == "desktop" for d in body])
