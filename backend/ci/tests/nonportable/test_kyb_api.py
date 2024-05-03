import pytest
from tests.utils import create_ob_config, post, get
from tests.constants import BUSINESS_DATA, CDO_TO_DIS


@pytest.mark.parametrize(
    "sandbox_outcome,missing_data",
    [
        ("pass", True),
        ("pass", False),
        ("manual_review", False),
        ("fail", False),
    ],
)
def test_no_bos(sandbox_tenant, sandbox_outcome, missing_data):
    must_collect_data = [
        "business_name",
        "business_tin",
        "business_address",
    ]
    obc = create_ob_config(
        sandbox_tenant,
        "Business-only config",
        must_collect_data,
        must_collect_data,
        kind="kyb",
    )

    # make API-created Business vault with no BO data present
    vault_data = {}
    for cdo in must_collect_data:
        for di in CDO_TO_DIS[cdo]:
            vault_data[di] = BUSINESS_DATA[di]

    expected_error = None
    if missing_data:
        vault_data.pop("business.name")
        expected_error = "Unmet onboarding requirements: CollectBusinessData"  # TODO: these are not great user facing errors

    vault = post("businesses/", vault_data, sandbox_tenant.sk.key)
    fp_id = vault["id"]

    # run KYB
    kyb = post(
        f"businesses/{fp_id}/kyb",
        dict(
            onboarding_config_key=obc.key.value,
            fixture_result=sandbox_outcome,
        ),
        sandbox_tenant.sk.key,
        status_code=200 if expected_error is None else 400,
    )
    if expected_error:
        assert expected_error in kyb["error"]["message"]
        return

    if sandbox_outcome == "manual_review":
        assert kyb["requires_manual_review"] == True
        assert kyb["status"] == "fail"
    else:
        assert kyb["requires_manual_review"] == False
        assert kyb["status"] == sandbox_outcome

    # confirm OBD timeline event created
    timeline = get(
        f"entities/{fp_id}/timeline",
        None,
        *sandbox_tenant.db_auths,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1
