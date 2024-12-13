import pytest
from tests.dashboard.utils import latest_audit_event_for
from tests.utils import (
    create_ob_config,
    get,
    post,
    get_raw,
)
from tests.headers import FpAuth
from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.utils import compare_contents, compare_b64_contents, open_multipart_file


@pytest.fixture(scope="session")
def user_with_documents(doc_request_sandbox_ob_config):
    """
    Create a user with registered data and webuathn creds and onboard them onto the document_requesting_tenant_session_scoped
    with document info as well
    """
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
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
        "drivers_license.front.jpg",
    )
    assert compare_b64_contents(
        resp["document.drivers_license.front.image"], "drivers_license.front.jpg"
    )
    # These OCR values come from TEST_ONLY_FIXTURE
    assert resp["document.drivers_license.document_number"] == "Y12341234"
    assert resp["document.drivers_license.issuing_state"] == "CALIFORNIA"
    assert resp["document.drivers_license.expires_at"] == "2050-10-15"
    # by default, we put the id.dob into the OCR response in sandbox
    assert resp["document.drivers_license.dob"] == "1995-12-25"

    audit_event = latest_audit_event_for(user_with_documents.fp_id, tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == set(fields)


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
    assert response.headers.get("content-type") == "image/jpg"
    assert compare_contents(response.content, "drivers_license.front.jpg")

    audit_event = latest_audit_event_for(user_with_documents.fp_id, tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == set(fields)


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


def test_get_entity_documents_with_lots_of_docs(sandbox_tenant, must_collect_data):
    """
    Test GET /entities/<>/documents API for a user with identity docs from bifrost (with a CURP),
    custom docs from bifrost, custom docs uploaded via the dashboard, and id doc uploded via api.
    """
    obc = create_ob_config(
        sandbox_tenant,
        "Lots of docs config",
        must_collect_data + ["document_and_selfie"],
        document_types_and_countries={
            "global": [],
            "country_specific": {"MX": ["voter_identification"]},
        },
        documents_to_collect=[
            dict(
                kind="custom",
                data=dict(
                    name="Utility bill",
                    identifier="document.custom.utility_bill",
                    description="Please upload a utility bill that shows your full name and address.",
                ),
            ),
            dict(kind="proof_of_ssn", data=dict()),
        ],
        verification_checks=[
            dict(kind="curp_validation", data={}),
            # not used, but for consistency with what FE actually writes
            dict(kind="identity_document", data={}),
        ],
    )
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()

    # Then, also upload some docs via API
    post(
        f"users/{user.fp_id}/vault/document.id_card.front.image/upload",
        None,
        sandbox_tenant.sk.key,
        files=open_multipart_file("drivers_license.front.jpg", "image/jpg")(),
    )
    post(
        f"users/{user.fp_id}/vault/document.id_card.back.image/upload",
        None,
        sandbox_tenant.sk.key,
        files=open_multipart_file("drivers_license.back.jpg", "image/jpg")(),
    )
    post(
        f"users/{user.fp_id}/vault/document.custom.my_special_doc/upload",
        None,
        *sandbox_tenant.db_auths,
        files=open_multipart_file("example_pdf.pdf", "application/pdf")(),
    )
    post(
        f"users/{user.fp_id}/vault/document.ssn_card.image/upload",
        None,
        *sandbox_tenant.db_auths,
        files=open_multipart_file("example_pdf.pdf", "application/pdf")(),
    )

    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    docs = iter(body)

    # Test ssn_card uploaded via api, even though there was one already uploaded via bifrost
    ssn_card = next(docs)
    assert ssn_card["uploads"][0]["identifier"] == "document.ssn_card.image"
    assert ssn_card["kind"] == "ssn_card"
    assert ssn_card["upload_source"] == "api"
    assert ssn_card["status"] is None
    assert ssn_card["review_status"] is None

    # Test custom doc uploaded via API
    special_doc = next(docs)
    assert special_doc["kind"] == "custom"
    assert special_doc["uploads"][0]["identifier"] == "document.custom.my_special_doc"
    assert special_doc["upload_source"] == "api"

    # Test identity doc uploaded via API. Note, the front and back will be represented as separate documents
    # when uploaded via API
    id_card_back = next(docs)
    assert id_card_back["kind"] == "id_card"
    assert id_card_back["uploads"][0]["side"] == "back"
    assert id_card_back["upload_source"] == "api"

    id_card_front = next(docs)
    assert id_card_front["kind"] == "id_card"
    assert id_card_front["uploads"][0]["side"] == "front"
    assert id_card_front["upload_source"] == "api"

    # Test custom doc uploaded via bifrost
    utility_bill = next(docs)
    assert utility_bill["uploads"][0]["identifier"] == "document.custom.utility_bill"
    assert utility_bill["kind"] == "custom"
    assert utility_bill["upload_source"] == "mobile"
    assert utility_bill["status"] == "complete"
    assert utility_bill["review_status"] == "pending_human_review"

    # Test ssn_card uploaded via bifrost
    ssn_card = next(docs)
    assert ssn_card["uploads"][0]["identifier"] == "document.ssn_card.image"
    assert ssn_card["kind"] == "ssn_card"
    assert ssn_card["upload_source"] == "mobile"
    assert ssn_card["status"] == "complete"
    assert ssn_card["review_status"] == "pending_human_review"

    # Test voter ID with curp uploaded via bifrost
    voter_id = next(docs)
    assert voter_id["kind"] == "voter_identification"
    assert voter_id["upload_source"] == "mobile"
    assert voter_id["status"] == "complete"
    assert voter_id["review_status"] == "reviewed_by_machine"
    assert all(u["failure_reasons"] == [] for u in voter_id["uploads"])
    front = next(u for u in voter_id["uploads"] if u["side"] == "front")
    back = next(u for u in voter_id["uploads"] if u["side"] == "back")
    curp_version = voter_id["curp_completed_version"]
    assert curp_version
    assert front["version"] < back["version"]
    assert back["version"] < curp_version
    assert voter_id["completed_version"] < curp_version

    assert len(list(docs)) == 0, "Iterator should be exhausted"


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
        "drivers_license.front.jpg",
    )
    assert compare_b64_contents(
        body[f"document.drivers_license.front.latest_upload:{front_version}"],
        "drivers_license.front.jpg",
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
        "org/audit_events",
        dict(search=fp_id),
        *tenant.db_auths,
    )
    audit_event = body["data"][0]
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == set(
        [
            "id.first_name",
            "document.drivers_license.front.latest_upload",
            "document.drivers_license.document_number",
        ]
    )


def test_review_documents(sandbox_tenant):
    """
    Manually reviewing a user will implicitly mark documents as reviewed by a human
    """
    obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()

    # Then, add a PoA in one workflow and PoSsn in another
    document_configs = [
        dict(kind="proof_of_address", data=dict()),
        dict(kind="proof_of_ssn", data=dict()),
    ]
    for config in document_configs:
        action = data = dict(
            trigger=dict(kind="document", data=dict(configs=[config])), kind="trigger"
        )
        data = dict(actions=[action])
        body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
        token = FpAuth(body[0]["token"])
        token = IdentifyClient.from_token(token).step_up(assert_had_no_scopes=True)
        bifrost = BifrostClient.raw_auth(obc, token, bifrost.sandbox_id)
        bifrost.run()

    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert len(body) == 2
    assert all(i["review_status"] == "pending_human_review" for i in body)

    # Then, make a manual review decision. This should mark all documents as reviewed by a human
    action = dict(
        status="pass",
        annotation=dict(note="lgtm", is_pinned=False),
        kind="manual_decision",
    )
    data = dict(actions=[action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)

    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert all(i["review_status"] == "reviewed_by_human" for i in body)


@pytest.mark.parametrize("doc_type", ["proof_of_address", "ssn_card"])
def test_ssn_card_poa(sandbox_tenant, doc_type):
    """
    Test that we can upload a proof of address and a ssn card and that they are both uploaded
    """
    body = post("users", None, sandbox_tenant.sk.key)
    fp_id = body["id"]
    file = open_multipart_file("example_pdf.pdf", "application/pdf")()
    post(
        f"users/{fp_id}/vault/document.{doc_type}.image/upload",
        None,
        *sandbox_tenant.db_auths,
        files=file,
    )

    body = get(f"entities/{fp_id}/documents", None, *sandbox_tenant.db_auths)

    # Test voter ID with curp
    poa = next(i for i in body if i["kind"] == doc_type)
    assert poa["status"] is None
    assert len(poa["uploads"]) == 1
    assert poa["uploads"][0]["side"] == "front"
