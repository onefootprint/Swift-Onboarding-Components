import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import (
    create_ob_config,
    open_multipart_file,
    post,
    get,
    get_requirement_from_requirements,
)


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


def test_upload_documents(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)

    # First, make a few upload sessions that are aborted
    data = {
        "document_type": "id_card",
        "country_code": "US",
    }
    id = post("hosted/user/documents", data, bifrost.auth_token)["id"]
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)
    import copy

    post(
        f"hosted/user/documents/{id}/upload/front",
        None,
        bifrost.auth_token,
        files=bifrost.data["document.drivers_license.front.image"](),
    )
    post(f"hosted/user/documents/{id}/process", None, bifrost.auth_token)

    data = {
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/user/documents", data, bifrost.auth_token)

    # Running bifrost should inherit the already-created DL session
    user = bifrost.run()
    fp_id = user.fp_id
    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)

    tenant = bifrost.ob_config.tenant
    body = get(f"entities/{fp_id}", None, *tenant.db_auths)
    assert set(body["decryptable_attributes"]) > {
        "document.drivers_license.back.barcodes"
    }

    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    assert len([i for i in body if i["kind"] == "id_card"]) == 1
    assert len([i for i in body if i["kind"] == "drivers_license"]) == 1

    users_docs = get(f"users/{fp_id}/documents", None, tenant.sk.key)
    assert users_docs[0]["document_type"] == "drivers_license"


def test_upload_documents_with_ob_config_restriction_legacy_version(
    restricted_doc_ob_config,
):
    bifrost = BifrostClient.new(restricted_doc_ob_config)

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
    users_docs = get(f"users/{fp_id}/documents", None, tenant.sk.key)
    assert users_docs[0]["document_type"] == "drivers_license"


def test_upload_documents_with_ob_config_restriction(
    restricted_doc_ob_config_only_international,
):
    bifrost = BifrostClient.new(restricted_doc_ob_config_only_international)
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
    status = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    # despite having created identity documents for NO passport, MX DL, we only actually uploaded successfully a DL
    assert document_types_to_authorize == ["drivers_license"]


def test_upload_documents_with_new_ob_config_document_and_countries_field(
    sandbox_tenant, must_collect_data, can_access_data
):
    obc = create_ob_config(
        sandbox_tenant,
        "Restricted doc request config (new)",
        # we'll ignore all of this when using `document_types_and_countries`, which we test below by trying to upload a voter ID and it failing
        must_collect_data + ["document.voter_identification.none.require_selfie"],
        can_access_data + ["document.voter_identification.none.require_selfie"],
        # restrict to only DL in US
        document_types_and_countries={
            "global": ["passport"],
            "country_specific": {"US": ["drivers_license"]},
        },
    )
    bifrost = BifrostClient.new(obc)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload DL in MX
    data = {
        "document_type": "drivers_license",
        "country_code": "MX",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: passport"
    )

    # Shouldn't be allowed to passport in US
    data = {
        "document_type": "passport",
        "country_code": "US",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: drivers_license"
    )

    # Shouldn't be allowed to voter id in US
    data = {
        "document_type": "voter_identification",
        "country_code": "US",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["error"]["message"]
        == "Unsupported document type. Supported document types: drivers_license"
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
    status = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    # despite having created identity documents for NO passport, MX DL, we only actually uploaded successfully a DL
    assert document_types_to_authorize == ["drivers_license"]


def test_user_skipping_selfie(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")
    status = bifrost.get_status()
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )

    assert doc_requirement["config"]["should_collect_selfie"]
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
        headers = {
            "x-fp-process-separately": "true",
        }
        post(
            f"hosted/user/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        post(f"hosted/user/documents/{doc_id}/process", None, bifrost.auth_token)
    # now check what fields we have to authorize
    status = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]
    collected_fields_to_authorize = fields_to_authorize["collected_data"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    assert "document_and_selfie" not in collected_fields_to_authorize
    assert document_types_to_authorize == ["drivers_license"]

    # Finish bifrost
    bifrost.run()


def test_upload_apis(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)
    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Make sure re-posting yields same doc ID
    data = {
        "document_type": "id_card",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token)
    doc_id = body["id"]
    body = post("hosted/user/documents", data, bifrost.auth_token)
    assert body["id"] == doc_id

    # Now, make a drivers_license session. Should have a different ID
    data = {
        "document_type": "drivers_license",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token)
    assert body["id"] != doc_id
    doc_id = body["id"]

    # Upload the documents consecutively in separate requests
    sides = ["front", "back", "selfie"]
    for i, side in enumerate(sides):
        headers = {
            "x-fp-process-separately": "true",
            "x-fp-is-extra-compressed": "true" if side == "front" else "false",
        }
        post(
            f"hosted/user/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        body = post(f"hosted/user/documents/{doc_id}/process", None, bifrost.auth_token)
        next_side = sides[i + 1] if i + 1 < len(sides) else None
        assert body["next_side_to_collect"] == next_side
        assert not body["errors"]

    # Finish bifrost
    user = bifrost.run()

    # Test decryption APIs
    tenant = user.tenant
    fp_id = user.fp_id
    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    assert all([d["upload_source"] == "desktop" for d in body])
    # We set is_extra_compressed for the front of this document
    assert all(
        [d["is_extra_compressed"] == (d["side"] == "front") for d in body[0]["uploads"]]
    )


def test_user_uploading_small_image(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")
    status = bifrost.get_status()
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

    body = post(
        f"hosted/user/documents/{doc_id}/upload/front",
        None,
        bifrost.auth_token,
        files=open_multipart_file("small_image.png", "image/png")(),
        status_code=400,
    )
    assert body["error"]["message"].startswith("Image too small")


# When a user has issues with their mobile device's camera initializing, we force the user to upload images
# and we produce a risk signal so that tenants are aware
def test_user_having_trouble_with_their_mobile_camera(
    sandbox_tenant, doc_request_sandbox_ob_config
):
    bifrost = BifrostClient.new(doc_request_sandbox_ob_config)
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")
    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    data = {
        "document_type": "drivers_license",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/user/documents", data, bifrost.auth_token)
    doc_id = body["id"]

    # Upload the documents consecutively in separate requests
    sides = ["front", "back", "selfie"]
    for i, side in enumerate(sides):
        headers = {
            "x-fp-process-separately": "true",
            "x-fp-is-forced-upload": "true",
        }
        post(
            f"hosted/user/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        post(f"hosted/user/documents/{doc_id}/process", None, bifrost.auth_token)

    # Finish bifrost
    user = bifrost.run()

    # we have correct risk signal for forcing upload
    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    reason_codes = set(r["reason_code"] for r in risk_signals)
    assert "document_live_capture_failed" in reason_codes

    # this is added as a default rule, so we test user triggers the rule
    rsr = get(f"entities/{user.fp_id}/rule_set_result", None, *sandbox_tenant.db_auths)
    doc_capture_failed_rule_results = [
        r
        for r in rsr["rule_results"]
        if r["rule"]["rule_expression"][0]["field"] == "document_live_capture_failed"
    ]
    assert doc_capture_failed_rule_results[0]["result"]


def test_no_documents_set_on_obc(sandbox_tenant, must_collect_data, can_access_data):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        # thing under test, empty
        document_types_and_countries={"global": [], "country_specific": {}},
    )
    bifrost = BifrostClient.new(obc)
    status = bifrost.get_status()
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert len(doc_requirement["config"]["supported_country_and_doc_types"].keys()) > 0
    assert len(doc_requirement["config"]["supported_country_and_doc_types"]["US"]) > 0
