import pytest
import re
from tests.headers import FpAuth
from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.constants import BUSINESS_DATA, CDO_TO_DIS, FIXTURE_PHONE_NUMBER
from tests.utils import create_ob_config, post, get, patch

MUST_COLLECT_DATA = ["business_name", "business_tin", "business_address"]


@pytest.fixture
def obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "Business-only config",
        MUST_COLLECT_DATA,
        kind="kyb",
        skip_kyc=True,
    )


@pytest.mark.parametrize(
    "sandbox_outcome",
    ["pass", "manual_review", "fail"],
)
def test_no_bos(obc, sandbox_tenant, sandbox_outcome):
    # make API-created Business vault with no BO data present
    vault_data = {
        di: BUSINESS_DATA[di] for cdo in MUST_COLLECT_DATA for di in CDO_TO_DIS[cdo]
    }
    vault = post("businesses/", vault_data, sandbox_tenant.sk.key)
    fp_bid = vault["id"]

    # run KYB
    data = dict(key=obc.key.value, fixture_result=sandbox_outcome)
    kyb = post(f"businesses/{fp_bid}/kyb", data, sandbox_tenant.sk.key)

    if sandbox_outcome == "manual_review":
        assert kyb["requires_manual_review"] == True
        assert kyb["status"] == "fail"
    else:
        assert kyb["requires_manual_review"] == False
        assert kyb["status"] == sandbox_outcome

    # confirm OBD timeline event created
    timeline = get(f"entities/{fp_bid}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline["data"] if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # Confirm status
    body = get(f"businesses/{fp_bid}", None, sandbox_tenant.s_sk)
    status = sandbox_outcome
    requires_manual_review = False
    if sandbox_outcome == "manual_review":
        status = "fail"
        requires_manual_review = True
    assert body["status"] == status
    assert body["requires_manual_review"] == requires_manual_review


def test_kyb_missing_req(obc, sandbox_tenant):
    vault_data = {
        di: BUSINESS_DATA[di] for cdo in MUST_COLLECT_DATA for di in CDO_TO_DIS[cdo]
    }
    vault_data.pop("business.name")
    vault = post("businesses/", vault_data, sandbox_tenant.sk.key)
    fp_id = vault["id"]

    data = dict(key=obc.key.value, fixture_result="pass")
    kyb = post(f"businesses/{fp_id}/kyb", data, sandbox_tenant.sk.key, status_code=400)
    assert kyb["code"] == "T121"
    assert (
        kyb["message"]
        == "Cannot run kyb playbook due to unmet requirements. Missing business_name. At a minimum, the following vault data must be provided: business.name"
    )


def test_kyb_non_us_country_code(obc, sandbox_tenant):
    vault_data = {
        di: BUSINESS_DATA[di] for cdo in MUST_COLLECT_DATA for di in CDO_TO_DIS[cdo]
    }
    vault_data["business.country"] = "CA"
    vault = post("businesses/", vault_data, sandbox_tenant.sk.key)
    fp_id = vault["id"]

    data = dict(key=obc.key.value, fixture_result="pass")
    kyb = post(f"businesses/{fp_id}/kyb", data, sandbox_tenant.sk.key, status_code=400)
    assert (
        kyb["message"]
        == "Validation error: Cannot trigger KYB for businesses with non-US addresses"
    )


def test_kyb_with_bos_linked_via_api(sandbox_tenant):
    """
    Even on a playbook that requires business_kyced_beneficial_owners, the requirement should be met by the presence
    of BOs linked via API
    """
    business_cdos = ["business_name", "business_tin", "business_address"]
    obc = create_ob_config(
        sandbox_tenant, "Business-only config", business_cdos, kind="kyb", skip_kyc=True
    )
    vault_data = {
        di: BUSINESS_DATA[di] for cdo in business_cdos for di in CDO_TO_DIS[cdo]
    }
    body = post("businesses", vault_data, sandbox_tenant.sk.key)
    fp_bid = body["id"]

    # Link the BO
    data = {
        "id.first_name": "Piip",
        "id.last_name": "Businessowner",
    }
    body = post("users", data, sandbox_tenant.sk.key)
    data = dict(fp_id=body["id"], ownership_stake=50)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)

    # Run KYB
    data = dict(key=obc.key.value, fixture_result="pass")
    body = post(f"businesses/{fp_bid}/kyb", data, sandbox_tenant.sk.key)
    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"


def test_kyb_with_no_bo_collection_but_bos_linked(sandbox_tenant):
    """
    For a playbook that does NOT require collection of business owners via `business_kyced_beneficial_owners`, tenants can still link BOs via API
    """
    business_cdos = ["business_name", "business_tin", "business_address"]
    must_collect_data = business_cdos
    obc = create_ob_config(
        sandbox_tenant,
        "Business-only config",
        must_collect_data,
        kind="kyb",
        skip_kyc=True,
    )
    vault_data = {
        di: BUSINESS_DATA[di] for cdo in business_cdos for di in CDO_TO_DIS[cdo]
    }
    body = post("businesses", vault_data, sandbox_tenant.sk.key)
    fp_bid = body["id"]

    # Link the BO, then should be able to KYB, we just ignore the BO data
    data = {"id.first_name": "Piip", "id.ssn9": "123456789"}
    body = post("users", data, sandbox_tenant.sk.key)
    api_linked_bo_fp_id = body["id"]
    data = dict(fp_id=body["id"], ownership_stake=50)
    body = post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)

    # Run KYB
    data = dict(key=obc.key.value, fixture_result="pass")
    body = post(f"businesses/{fp_bid}/kyb", data, sandbox_tenant.sk.key)
    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"
    fp_bid = body["fp_id"]

    # Can retrieve BO
    body = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert len(body["data"]) == 1
    assert body["data"][0]["fp_id"] == api_linked_bo_fp_id


def test_public_bos(sandbox_tenant, kyb_sandbox_ob_config):
    # Cannot link a BO when the business was created via bifrost
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()

    body = get(f"businesses/{user.fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert len(body["data"]) == 1
    assert body["data"][0]["fp_id"] == user.fp_id
    # Missing second BO because there's no scoped vault for them


def test_link_bos(sandbox_tenant, sandbox_user):
    body = post("businesses", None, sandbox_tenant.sk.key)
    fp_bid = body["id"]
    fp_id = sandbox_user.fp_id

    body = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert not body["data"]

    # Then, link a BO via API
    data = dict(fp_id=fp_id, ownership_stake=50)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)
    body = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)
    assert len(body["data"]) == 1
    bo = body["data"][0]
    assert bo["fp_id"] == fp_id

    # Check that BO ownership stake is vaulted
    fields = get(f"businesses/{fp_bid}/vault", None, sandbox_tenant.sk.key)
    stake_pattern = re.compile(
        r"^business\.beneficial_owners\.[^\.]+\.ownership_stake$"
    )
    stake_dis = set(di for di in fields if stake_pattern.match(di))
    primary_stake_di = "business.beneficial_owners.bo_link_primary.ownership_stake"
    assert stake_dis == {primary_stake_di}

    result = post(
        f"businesses/{fp_bid}/vault/decrypt",
        {
            "fields": list(stake_dis),
            "reason": "Test",
        },
        sandbox_tenant.sk.key,
    )
    assert result == {primary_stake_di: "50"}

    # Cannot set percentage outside of [0, 100]
    for percentage in [-1, 101]:
        data = dict(fp_id=fp_id, ownership_stake=percentage)
        body = post(
            f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
        )
        assert body["message"] == "ownership_stake must be between 0 and 100"

    # Cannot add the same user as a BO twice
    data = dict(fp_id=fp_id, ownership_stake=50)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["message"]
        == "The provided user is already an owner of the provided business"
    )

    # Can add a secondary BO
    data = {
        "id.first_name": "Piip",
        "id.last_name": "Businessowner the Second",
    }
    body = post("users", data, sandbox_tenant.sk.key)
    fp_id2 = body["id"]
    data = dict(fp_id=body["id"], ownership_stake=50)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)
    owners = get(f"businesses/{fp_bid}/owners", None, sandbox_tenant.sk.key)['data']

    # Cannot add an owner to a user vault
    data = dict(fp_id=fp_id, ownership_stake=50)
    body = post(
        f"businesses/{fp_id}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert body["message"] == "Provided fp_bid does not correspond to a business"

    # Cannot set a business as an owner
    data = dict(fp_id=fp_bid, ownership_stake=50)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert body["message"] == "Provided fp_id does not correspond to a person"


def test_error_linking_bo(kyb_sandbox_ob_config, sandbox_tenant, sandbox_user):
    # Cannot link a BO when the business was created via bifrost
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    fp_bid = user.fp_bid

    data = dict(fp_id=sandbox_user.fp_id, ownership_stake=50)
    body = post(
        f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["message"]
        == "Provided business was created by onboarding onto a playbook. Business owners are managed automatically by the playbook, so they cannot be mutated."
    )


def test_onboard_kyb_bos_linked_via_api(sandbox_tenant, kyb_sandbox_ob_config):
    """
    Verify that the onboarding requirement to provide beneficial owners is satisfied by owners linked via API.
    """
    data = {"id.phone_number": FIXTURE_PHONE_NUMBER}
    user = post("users", data, sandbox_tenant.s_sk)
    fp_id = user["id"]
    sandbox_id = user["sandbox_id"]

    data = {"business.name": "printfoot"}
    business = post("businesses", data, sandbox_tenant.s_sk)
    fp_bid = business["id"]

    data = dict(fp_id=fp_id, ownership_stake=25)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.s_sk)

    # Try to make a token using an fp_bid for a different user
    data = dict(kind="onboard", key=kyb_sandbox_ob_config.key.value, fp_bid=fp_bid)
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.s_sk)
    auth_token = FpAuth(body["token"])

    auth_token = IdentifyClient.from_token(auth_token).login()
    bifrost = BifrostClient.raw_auth(kyb_sandbox_ob_config, auth_token, sandbox_id)
    r = bifrost.get_requirement("collect_business_data")

    # Business beneficial owners should already be populated from the BO linked via API
    assert "business_kyced_beneficial_owners" in r["populated_attributes"]
    bifrost.run()
