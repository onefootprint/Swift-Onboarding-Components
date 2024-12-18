import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import (
    create_ob_config,
    open_multipart_file,
    post,
    get,
    patch,
    get_requirement_from_requirements,
)


@pytest.fixture(scope="session")
def restricted_doc_ob_config(sandbox_tenant, must_collect_data):
    return create_ob_config(
        sandbox_tenant,
        "Restricted doc request config",
        must_collect_data + ["document.drivers_license.us_only.require_selfie"],
    )


@pytest.fixture(scope="session")
def restricted_doc_ob_config_only_international(sandbox_tenant, must_collect_data):
    return create_ob_config(
        sandbox_tenant,
        "Restricted doc request config (new)",
        # technically we don't support DL for anything other than US, so this is just so we can simulate the correct error
        must_collect_data + ["document.drivers_license,passport.none.require_selfie"],
        allow_international_residents=True,
        international_country_restrictions=["MX"],
    )


def test_upload_documents(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    doc_requirement = bifrost.get_requirement("collect_document")

    # First, make a few upload sessions that are aborted
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "id_card",
        "country_code": "US",
    }
    id = post("hosted/documents", data, bifrost.auth_token)["id"]
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    post(
        f"hosted/documents/{id}/upload/front",
        None,
        bifrost.auth_token,
        files=bifrost.data["document.drivers_license.front.image"](),
    )
    post(f"hosted/documents/{id}/process", None, bifrost.auth_token)

    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/documents", data, bifrost.auth_token)

    # Running bifrost should inherit the already-created DL session
    user = bifrost.run()
    fp_id = user.fp_id
    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)

    tenant = bifrost.ob_config.tenant
    body = get(f"entities/{fp_id}", None, *tenant.db_auths)
    assert any(
        i["identifier"] == "document.drivers_license.back.barcodes"
        for i in body["data"]
        if i["is_decryptable"]
    )

    body = get(f"entities/{fp_id}/documents", None, *tenant.db_auths)
    assert len([i for i in body if i["kind"] == "id_card"]) == 1
    assert len([i for i in body if i["kind"] == "drivers_license"]) == 1

    users_docs = get(f"users/{fp_id}/documents", None, tenant.sk.key)
    assert users_docs[0]["document_type"] == "drivers_license"


def test_custom_document_playbook(sandbox_tenant, must_collect_data):
    """
    Test onboarding onto a KYC playbook that also collects a custom document that must be reviewed by a human
    """
    docs = [
        dict(
            kind="custom",
            data=dict(
                name="Utility bill",
                identifier="document.custom.utility_bill",
                description="Please upload a utility bill that shows your full name and address.",
                upload_settings="prefer_capture",
            ),
        )
    ]
    obc = create_ob_config(
        sandbox_tenant, "Custom doc", must_collect_data, documents_to_collect=docs
    )

    bifrost = BifrostClient.new_user(obc, fixture_result="use_rules_outcome")
    user = bifrost.run()
    requirement = next(
        r
        for r in bifrost.handled_requirements
        if r["kind"] == "collect_document" and r["config"]["kind"] == "custom"
    )
    assert requirement["upload_settings"] == "prefer_capture"

    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert any(i["identifier"] == "document.custom.utility_bill" for i in body["data"])
    # The user should be put in manual review for the custom document
    assert body["requires_manual_review"]
    assert body["manual_review_kinds"] == ["document_needs_review"]
    # And their status should be failed because no rules matched and there's a doc ManualReview
    assert body["status"] == "fail"

    # Check the timeline event from uploading the doc
    body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"]["data"]
        for i in body["data"]
        if i["event"]["kind"] == "document_uploaded"
    )
    assert event["config"]["data"]["identifier"] == "document.custom.utility_bill"
    assert event["config"]["data"]["name"] == "Utility bill"

    # And check the documents API
    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert body[0]["kind"] == "custom"
    assert body[0]["status"] == "complete"
    assert body[0]["review_status"] == "pending_human_review"
    assert body[0]["uploads"][0]["identifier"] == "document.custom.utility_bill"

    # Manually review the user
    action = dict(
        annotation=dict(note="Looks good to me", is_pinned=False),
        status="pass",
        kind="manual_decision",
    )
    data = dict(actions=[action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)

    # Now, the user shouldn't require manual review
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert not body["requires_manual_review"]
    assert not body["manual_review_kinds"]

    # And the document should be marked as reviewed
    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert body[0]["review_status"] == "reviewed_by_human"


def test_custom_document_playbook_no_review(sandbox_tenant, must_collect_data):
    """
    Test onboarding onto a KYC playbook that also collects a custom document that does not need to be reviewed by a human
    """
    docs = [
        dict(
            kind="custom",
            data=dict(
                name="Utility bill",
                identifier="document.custom.utility_bill",
                description="Please upload a utility bill that shows your full name and address.",
                requires_human_review=False,
            ),
        )
    ]
    obc = create_ob_config(
        sandbox_tenant, "Custom doc", must_collect_data, documents_to_collect=docs
    )

    bifrost = BifrostClient.new_user(obc, fixture_result="use_rules_outcome")
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert any(i["identifier"] == "document.custom.utility_bill" for i in body["data"])
    # The user should not be put in manual review
    assert not body["requires_manual_review"]
    assert body["status"] == "pass"

    # And check the documents API
    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert body[0]["status"] == "complete"
    assert body[0]["review_status"] == "not_needed"
    assert body[0]["uploads"][0]["identifier"] == "document.custom.utility_bill"


@pytest.mark.parametrize("initial_fixture_result", ["pass", "fail"])
def test_document_playbook_no_rules(sandbox_tenant, initial_fixture_result):
    """
    Test a document-only playbook that doesn't have any rules.
    We should leave the SV status untouched, but still be able to raise a manual review.
    """
    # First, make a user
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result=initial_fixture_result
    )
    user = bifrost.run()
    assert bifrost.validate_response["user"]["status"] == initial_fixture_result

    doc_playbook = create_ob_config(
        sandbox_tenant,
        "Doc request config",
        [],
        kind="document",
        documents_to_collect=[dict(kind="proof_of_address", data=dict())],
        skip_kyc=True,
    )
    body = get(
        f"org/onboarding_configs/{doc_playbook.id}/rules",
        None,
        *sandbox_tenant.db_auths,
    )
    assert not body, "Non-id doc playbook should not have any rules"

    # Onboard the user to the doc-only playbook
    bifrost = BifrostClient.login_user(
        doc_playbook, bifrost.sandbox_id, fixture_result="use_rules_outcome"
    )
    user2 = bifrost.run()
    assert user2.fp_id == user.fp_id
    # The status for the document workflow should be "none" because it has no rules
    assert bifrost.validate_response["user"]["status"] == "none"
    # The status of the user should remain unchanged
    body = get(f"users/{user.fp_id}", None, sandbox_tenant.s_sk)
    assert body["status"] == initial_fixture_result


def test_document_playbook_no_collect_data_requirement(sandbox_tenant):
    """
    Test that onboardings onto a document playbook never serialize a collect_data requirement.
    """
    doc_playbook = create_ob_config(
        sandbox_tenant,
        "Doc request config",
        [],
        kind="document",
        documents_to_collect=[dict(kind="proof_of_address", data=dict())],
        skip_kyc=True,
    )
    bifrost = BifrostClient.new_user(doc_playbook)
    bifrost.run()
    # No collect_data requirement
    assert [r["kind"] for r in bifrost.handled_requirements] == [
        "liveness",
        "collect_document",
        "process",
    ]
    assert [r["kind"] for r in bifrost.already_met_requirements] == ["authorize"]


def test_upload_documents_with_ob_config_restriction_legacy_version(
    restricted_doc_ob_config,
):
    bifrost = BifrostClient.new_user(restricted_doc_ob_config)
    doc_requirement = bifrost.get_requirement("collect_document")

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload non-US document
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "NO",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert body["message"].startswith(
        "Unsupported document country. Supported document countries:"
    )
    assert set(body["message"].split(":")[1].replace(" ", "").split(",")) == set(
        ["UM", "VI", "MP", "GU", "PR", "AS", "US"]
    )

    # Shouldn't be allowed to upload non-drivers-license
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "id_card",
        "country_code": "US",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["message"]
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
    bifrost = BifrostClient.new_user(restricted_doc_ob_config_only_international)
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    doc_requirement = bifrost.get_requirement("collect_document")

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
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "MX",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "Unsupported document type. Supported document types: passport"
    )

    # Can upload a non-US passport
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "passport",
        "country_code": "NO",
    }
    post("hosted/documents", data, bifrost.auth_token)

    # Can upload a US DL
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/documents", data, bifrost.auth_token)

    bifrost.handle_one_requirement("collect_document")
    status = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    # despite having created identity documents for NO passport, MX DL, we only actually uploaded successfully a DL
    assert document_types_to_authorize == ["drivers_license"]


def test_upload_documents_with_new_ob_config_document_and_countries_field(
    sandbox_tenant, must_collect_data
):
    obc = create_ob_config(
        sandbox_tenant,
        "Restricted doc request config (new)",
        # we'll ignore all of this when using `document_types_and_countries`, which we test below by trying to upload a voter ID and it failing
        must_collect_data + ["document.voter_identification.none.require_selfie"],
        # restrict to only DL in US
        document_types_and_countries={
            "global": ["passport"],
            "country_specific": {"US": ["drivers_license"]},
        },
    )
    bifrost = BifrostClient.new_user(obc)
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    doc_requirement = bifrost.get_requirement("collect_document")

    # Manually handle the document requirement with some invalid data
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Shouldn't be allowed to upload DL in MX
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "MX",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "Unsupported document type. Supported document types: passport"
    )

    # Shouldn't be allowed to passport in US
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "passport",
        "country_code": "US",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "Unsupported document type. Supported document types: drivers_license"
    )

    # Shouldn't be allowed to voter id in US
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "voter_identification",
        "country_code": "US",
    }
    body = post("hosted/documents", data, bifrost.auth_token, status_code=400)
    assert (
        body["message"]
        == "Unsupported document type. Supported document types: drivers_license"
    )

    # Can upload a non-US passport
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "passport",
        "country_code": "NO",
    }
    post("hosted/documents", data, bifrost.auth_token)

    # Can upload a US DL
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
    }
    post("hosted/documents", data, bifrost.auth_token)

    bifrost.handle_one_requirement("collect_document")
    status = bifrost.get_status()
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]
    document_types_to_authorize = fields_to_authorize["document_types"]
    # despite having created identity documents for NO passport, MX DL, we only actually uploaded successfully a DL
    assert document_types_to_authorize == ["drivers_license"]


def test_user_skipping_selfie(doc_request_sandbox_ob_config):
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    status = bifrost.get_status()
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )

    assert doc_requirement["config"]["should_collect_selfie"]
    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
        "skip_selfie": True,
        "device_type": "desktop",
    }
    body = post("hosted/documents", data, bifrost.auth_token)
    doc_id = body["id"]

    # Upload the documents consecutively in separate requests
    sides = ["front", "back"]
    for i, side in enumerate(sides):
        headers = {
            "x-fp-process-separately": "true",
        }
        post(
            f"hosted/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        post(f"hosted/documents/{doc_id}/process", None, bifrost.auth_token)
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
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    doc_requirement = bifrost.get_requirement("collect_document")

    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    # Make sure re-posting yields same doc ID
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "id_card",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/documents", data, bifrost.auth_token)
    doc_id = body["id"]
    body = post("hosted/documents", data, bifrost.auth_token)
    assert body["id"] == doc_id

    # Now, make a drivers_license session. Should have a different ID
    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/documents", data, bifrost.auth_token)
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
            f"hosted/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        body = post(f"hosted/documents/{doc_id}/process", None, bifrost.auth_token)
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
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    doc_requirement = bifrost.get_requirement("collect_document")

    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
        "skip_selfie": True,
        "device_type": "desktop",
    }
    body = post("hosted/documents", data, bifrost.auth_token)
    doc_id = body["id"]

    body = post(
        f"hosted/documents/{doc_id}/upload/front",
        None,
        bifrost.auth_token,
        files=open_multipart_file("small_image.png", "image/png")(),
        status_code=400,
    )
    assert body["message"].startswith("File too small")


# When a user has issues with their mobile device's camera initializing, we force the user to upload images
# and we produce a risk signal so that tenants are aware
def test_user_having_trouble_with_their_mobile_camera(
    sandbox_tenant, doc_request_sandbox_ob_config
):
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    doc_requirement = bifrost.get_requirement("collect_document")

    # consent
    consent_data = {"consent_language_text": "I consent"}
    post("hosted/user/consent", consent_data, bifrost.auth_token)

    data = {
        "request_id": doc_requirement["document_request_id"],
        "document_type": "drivers_license",
        "country_code": "US",
        "device_type": "desktop",
    }
    body = post("hosted/documents", data, bifrost.auth_token)
    doc_id = body["id"]

    # Upload the documents consecutively in separate requests
    sides = ["front", "back", "selfie"]
    for i, side in enumerate(sides):
        headers = {
            "x-fp-process-separately": "true",
            "x-fp-is-forced-upload": "true",
        }
        post(
            f"hosted/documents/{doc_id}/upload/{side}",
            None,
            bifrost.auth_token,
            files=bifrost.data[f"document.drivers_license.{side}.image"](),
            addl_headers=headers,
        )
        post(f"hosted/documents/{doc_id}/process", None, bifrost.auth_token)

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


def test_no_documents_set_on_obc(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        # thing under test, empty
        document_types_and_countries={"global": [], "country_specific": {}},
    )
    bifrost = BifrostClient.new_user(obc)
    status = bifrost.get_status()
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert len(doc_requirement["config"]["supported_country_and_doc_types"].keys()) > 0
    assert len(doc_requirement["config"]["supported_country_and_doc_types"]["US"]) > 0
