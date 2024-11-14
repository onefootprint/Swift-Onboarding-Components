import pytest
from tests.utils import get
from tests.utils import patch, post
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


@pytest.mark.parametrize(
    "submit_ssn",
    [True, False],
)
def test_requirements(sandbox_tenant, submit_ssn):
    must_collect_data = ["full_address", "name", "email", "phone_number"]
    optional_data = ["ssn9"]
    obc = create_ob_config(
        sandbox_tenant,
        "KYC with optional ssn",
        must_collect_data,
        optional_data=optional_data,
    )
    bifrost = BifrostClient.new_user(obc, override_ob_config_auth=None)

    collect_data_req = get_requirement_from_requirements(
        "collect_data", bifrost.get_status()["all_requirements"], is_met=False
    )
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

    status = bifrost.get_status()
    collect_data_req = get_requirement_from_requirements(
        "collect_data", status["all_requirements"], is_met=False
    )
    collect_doc_req = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    # requirements should be empty
    assert collect_data_req is None
    assert collect_doc_req is None

    # get met_requirement and assert ssn in populated_attributes
    status = bifrost.get_status()
    met_requirement = get_requirement_from_requirements(
        "collect_data", status["all_requirements"], is_met=True
    )
    if submit_ssn:
        assert set(met_requirement["populated_attributes"]) == set(
            ["full_address", "name", "email", "phone_number", "ssn9"]
        )
        assert met_requirement["optional_attributes"] == []
    else:
        assert set(met_requirement["populated_attributes"]) == set(
            ["full_address", "name", "email", "phone_number"]
        )
        assert met_requirement["optional_attributes"] == ["ssn9"]

    authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )
    assert set(authorize["fields_to_authorize"]["collected_data"]) == set(
        met_requirement["populated_attributes"]
    )

    user = bifrost.run()

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    reason_codes = [r["reason_code"] for r in risk_signals]

    if submit_ssn:
        assert "ssn_not_provided" not in reason_codes
    else:
        assert "ssn_not_provided" in reason_codes


@pytest.mark.parametrize("middle_name", [None, "Billy"])
def test_middle_name(sandbox_tenant, middle_name):
    base_data = ["full_address", "email", "phone_number"]
    obc = create_ob_config(
        sandbox_tenant,
        "Doc request config",
        base_data + ["name"],
    )

    di = "id.middle_name"
    bifrost = BifrostClient.new_user(obc)

    if middle_name:
        bifrost.data[di] = middle_name
    else:
        bifrost.data.pop(di, None)

    user = bifrost.run()

    # test decrypt permissions
    res = post(
        f"/users/{user.fp_id}/vault/decrypt",
        dict(reason="a", fields=[di]),
        sandbox_tenant.sk.key,
    )

    assert res[di] == middle_name

    # assert that /users/ includes id.middle_name cause why not
    res = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    has_middle_name = any(i["identifier"] == di for i in res["data"])
    is_middle_name_decryptable = any(
        i["identifier"] == di for i in res["data"] if i["is_decryptable"]
    )
    assert has_middle_name == bool(middle_name)
    assert is_middle_name_decryptable == bool(middle_name)
