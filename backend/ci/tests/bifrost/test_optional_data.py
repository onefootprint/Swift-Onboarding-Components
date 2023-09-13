import pytest
from tests.utils import get
from tests.utils import patch, post
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


@pytest.mark.parametrize(
    "submit_ssn,step_up_to_doc",
    [
        (True, False), 
        (False, False),
        (False, True),
        (True, True)
    ],
)
def test_requirements(sandbox_tenant, twilio, submit_ssn, step_up_to_doc):
    must_collect_data = ["full_address", "name", "email", "phone_number"]
    optional_data = ["ssn9"]
    can_access_data = must_collect_data + optional_data
    obc = create_ob_config(
        sandbox_tenant,
        "KYC with optional ssn",
        must_collect_data,
        can_access_data,
        optional_data=optional_data,
        doc_scan_for_optional_ssn= "document.passport,drivers_license,visa.none.none" if step_up_to_doc else None
    )
    bifrost = BifrostClient.new(obc, twilio, override_ob_config_auth=None)

    collect_data_req = get_requirement_from_requirements(
        "collect_data", bifrost.get_status()["requirements"]
    )
    assert set(collect_data_req["missing_attributes"]) == set(["full_address", "name"])
    assert collect_data_req["optional_attributes"] == ["ssn9"]

    if not submit_ssn:
        # remove ssn9 from bifrost.data so we simulate skipping submitting ssn
        bifrost.data = {k: v for k, v in bifrost.data.items() if k != "id.ssn9"}

    dis_to_submit = [
        "id.first_name",
        "id.last_name",
        "id.address_line1",
        "id.address_line2",
        "id.city",
        "id.state",
        "id.zip",
        "id.country",
    ]
    if submit_ssn:
        dis_to_submit.append("id.ssn9")
    data = {k: v for k, v in bifrost.data.items() if k in dis_to_submit}
    post("/hosted/user/vault/validate", data, bifrost.auth_token)
    patch("/hosted/user/vault", data, bifrost.auth_token)

    collect_data_req = get_requirement_from_requirements(
        "collect_data", bifrost.get_status()["requirements"]
    )
    collect_doc_req = get_requirement_from_requirements(
        "collect_document", bifrost.get_status()["requirements"]
    )
    # requirements should be empty
    assert collect_data_req is None
    
    if step_up_to_doc and not submit_ssn:
        assert set(collect_doc_req['supported_country_and_doc_types']['US']) == set(["passport", "drivers_license", "visa"])
    else:
        assert collect_doc_req is None
    

    # get met_requirements and assert ssn in populated_attributes
    met_requirements = get_requirement_from_requirements(
        "collect_data", bifrost.get_status()["met_requirements"]
    )
    expected_populated_attributes = ["full_address", "name", "email", "phone_number"]
    if submit_ssn:
        expected_populated_attributes.append("ssn9")
    assert set(met_requirements["populated_attributes"]) == set(
        expected_populated_attributes
    )

    authorize_requirement = get_requirement_from_requirements(
        "authorize", bifrost.get_status()["requirements"]
    )
   
    assert set(authorize_requirement["fields_to_authorize"]["collected_data"]) == set(
        expected_populated_attributes
    )

    user = bifrost.run()

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    reason_codes = [r["reason_code"] for r in risk_signals]

    if submit_ssn or step_up_to_doc:
        assert "ssn_not_provided" not in reason_codes
    else:
        assert "ssn_not_provided" in reason_codes
