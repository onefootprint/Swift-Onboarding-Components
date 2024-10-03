from tests.utils import get, patch
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient


def test_doc_first(sandbox_tenant, doc_first_obc):
    bifrost = BifrostClient.new_user(doc_first_obc)
    user = bifrost.run()

    # These should be ordered
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "liveness",
        "collect_document",
        "collect_data",
        "process",
    ]
    # When we handled the collect_data requirement, make sure some attributes were autofilled from
    # OCR data
    collect_data_req = get_requirement_from_requirements(
        "collect_data", bifrost.handled_requirements
    )
    assert set(collect_data_req["populated_attributes"]) > {"full_address", "name"}
    assert set(collect_data_req["missing_attributes"]) == {"ssn9"}

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    reason_codes = set(r["reason_code"] for r in risk_signals)
    assert "document_ocr_first_name_matches" in reason_codes
    assert "document_ocr_last_name_matches" in reason_codes
    assert "document_ocr_name_matches" in reason_codes
    assert "document_ocr_dob_matches" in reason_codes


def test_doc_first_edit_data(sandbox_tenant, doc_first_obc):
    bifrost = BifrostClient.new_user(doc_first_obc)
    bifrost.handle_one_requirement("collect_document")
    # Update the information after populating it from OCR data

    data = {"id.first_name": "Hayes", "id.last_name": "Valley"}
    patch("/hosted/user/vault", data, bifrost.auth_token)

    # Finish onboarding
    user = bifrost.run()

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    reason_codes = set(r["reason_code"] for r in risk_signals)
    assert "document_ocr_first_name_does_not_match" in reason_codes
    assert "document_ocr_last_name_does_not_match" in reason_codes
    assert "document_ocr_name_does_not_match" in reason_codes
    assert "document_ocr_dob_matches" in reason_codes
