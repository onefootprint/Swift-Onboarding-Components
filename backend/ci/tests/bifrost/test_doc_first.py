import pytest
from tests.utils import get, patch, get_requirement_from_requirements, create_ob_config
from tests.bifrost_client import BifrostClient


@pytest.mark.parametrize(
    "documents_and_countries",
    [
        {
            "global": [],
            "country_specific": {"US": ["drivers_license"]},
        },
        {
            "global": [],
            "country_specific": {"MX": ["voter_identification"]},
        },
        {
            "global": [],
            "country_specific": {
                "US": ["drivers_license", "voter_identification", "passport"]
            },
        },
    ],
)
def test_doc_first(sandbox_tenant, documents_and_countries):
    obc = create_ob_config(
        sandbox_tenant,
        "KYC with document first",
        must_collect_data=[
            "phone_number",
            "full_address",
            "name",
            "email",
            "document",
            "ssn9",
        ],
        can_access_data=["phone_number", "full_address", "name", "email"],
        document_types_and_countries=documents_and_countries,
        is_doc_first_flow=True,
    )
    bifrost = BifrostClient.new_user(obc)
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
