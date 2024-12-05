import pytest
import re
from tests.bifrost.test_triggers import send_trigger
from tests.identify_client import IdentifyClient
from tests.bifrost.test_multi_kyc_kyb import extract_bo_token
from tests.dashboard.utils import latest_audit_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post, patch
from tests.constants import (
    BUSINESS_DATA,
    BUSINESS_SECONDARY_BOS,
    CDO_TO_DIS,
)

BUSINESS_VAULT_DERIVED_DATA = {
    "business.formation_state": "CA",
    "business.formation_date": "2024-02-02",
    "business.beneficial_owners.bo_link_primary.ownership_stake": "50",
}


@pytest.fixture(scope="session")
def populated_business_data(kyb_cdos):
    """
    The set of fields we expect to be populated on a business vault that onboarded onto an ob config
    with kyb_cdos
    """
    return (
        set(di for cdo in kyb_cdos for di in CDO_TO_DIS[cdo]) & set(BUSINESS_DATA)
    ).union(set(BUSINESS_VAULT_DERIVED_DATA))


@pytest.fixture(scope="session")
def primary_bo(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "create_business_onboarding",
        "collect_business_data",
        "collect_data",
        "liveness",
        "process",
    ]
    return user


def test_get_entities(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert set(i["identifier"] for i in body["data"]) == populated_business_data
    biz_name = next(i for i in body["data"] if i["identifier"] == "business.name")
    assert biz_name["value"] == primary_bo.client.data["business.name"]


def test_get_business_owners(sandbox_tenant, kyb_sandbox_ob_config):
    """Test the business -> users (owners) lookup"""
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    fp_bid = primary_bo.fp_bid

    # Before secondary BO completes, we see awaiting_kyc
    body = get(
        f"entities/{primary_bo.fp_bid}/business_owners", None, *sandbox_tenant.db_auths
    )
    assert len(body) == 2
    assert body[0]["fp_id"] == primary_bo.fp_id
    assert body[0]["ownership_stake"] == 50
    assert body[0]["bo_status"] == "pass"
    assert body[0]["kind"] == "primary"
    assert not body[1]["fp_id"]
    assert body[1]["bo_status"] == "awaiting_kyc"
    assert body[1]["kind"] == "secondary"

    # After the secondary BO starts onboarding, we see incomplete
    secondary_bo_token = extract_bo_token(primary_bo)
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="fail",
    )

    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[1]["fp_id"]
    assert body[1]["bo_status"] == "incomplete"

    # After they finish onobarding, their status is failed
    secondary_bo = bifrost.run()
    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[1]["fp_id"] == secondary_bo.fp_id
    assert body[1]["bo_status"] == "fail"

    # Should be able to manually review BO and see status propagate.
    action = dict(
        kind="manual_decision", status="pass", annotation=dict(note="", is_pinned=False)
    )
    data = dict(actions=[action])
    post(f"entities/{secondary_bo.fp_id}/actions", data, *sandbox_tenant.db_auths)

    secondary_bo = bifrost.run()
    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[1]["bo_status"] == "pass"

    # But BO onboarding onto other KYC playbooks should not affect the status on the business detail page
    kyc_obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.login_user(
        kyc_obc, bifrost.sandbox_id, fixture_result="fail"
    )
    bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "fail"

    secondary_bo = bifrost.run()
    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[1]["bo_status"] == "pass"  # Status should be unchanged by KYC workflow

    # Request a document from the business. The users' statuses should not change
    document_config = dict(
        kind="custom", data=dict(name="biz doc", identifier="document.custom.biz_doc")
    )
    trigger = dict(
        kind="document",
        data=dict(configs=[], business_configs=[document_config]),
    )
    initial_auth_token = send_trigger(
        primary_bo.fp_id, sandbox_tenant, trigger, fp_bid=fp_bid
    )
    stepped_up_auth_token = IdentifyClient.from_token(initial_auth_token).step_up(
        assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(
        kyb_sandbox_ob_config, stepped_up_auth_token, primary_bo.client.sandbox_id
    )
    bifrost.run()

    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[0]["bo_status"] == "pass"
    assert body[1]["bo_status"] == "pass"


def test_bo_timeline_events(sandbox_tenant, kyb_sandbox_ob_config):
    # First, fail the user when onboarding onto this playbook
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result="fail",
        kyb_fixture_result="use_rules_outcome",
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    fp_bid = primary_bo.fp_bid

    secondary_bo_token = extract_bo_token(primary_bo)

    # Should have made an event on the business's timeline for the primary BO's onboarding
    body = get(f"entities/{fp_bid}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"]
        for i in body["data"]
        if i["event"]["kind"] == "business_owner_completed_kyc"
    )
    assert event["data"]["fp_id"] == primary_bo.fp_id
    assert event["data"]["decision"]["status"] == "fail"
    assert event["data"]["decision"]["source"]["kind"] == "footprint"

    # Make sure we can't see this event on the user timeline
    body = get(f"entities/{primary_bo.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    assert not any(
        i["event"]["kind"] == "business_owner_completed_kyc" for i in body["data"]
    )

    # Onboard the secondary BO
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="pass",
    )
    secondary_bo = bifrost.run()
    assert secondary_bo.client.validate_response["user"]["status"] == "pass"
    assert secondary_bo.client.validate_response["business"]["status"] == "fail"

    # This should make another event
    body = get(f"entities/{fp_bid}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"]
        for i in body["data"]
        if i["event"]["kind"] == "business_owner_completed_kyc"
    )
    assert event["data"]["fp_id"] == secondary_bo.fp_id
    assert event["data"]["decision"]["status"] == "pass"

    # Manually review the primary BO
    action = dict(
        kind="manual_decision", status="pass", annotation=dict(note="", is_pinned=False)
    )
    data = dict(actions=[action])
    post(f"entities/{primary_bo.fp_id}/actions", data, *sandbox_tenant.db_auths)

    # This should make another event
    body = get(f"entities/{fp_bid}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"]
        for i in body["data"]
        if i["event"]["kind"] == "business_owner_completed_kyc"
    )
    assert event["data"]["fp_id"] == primary_bo.fp_id
    assert event["data"]["decision"]["status"] == "pass"
    assert event["data"]["decision"]["source"]["kind"] == "organization"


def test_get_businesses(sandbox_tenant, primary_bo):
    """Test the user -> owned businesses lookup"""
    body = get(
        f"entities/{primary_bo.fp_id}/businesses", None, *sandbox_tenant.db_auths
    )
    assert len(body) == 1
    assert body[0]["id"] == primary_bo.fp_bid
    assert body[0]["status"] == "pass"


def test_get_vault(sandbox_tenant, primary_bo, populated_business_data):
    body = get(
        f"entities/{primary_bo.fp_bid}/vault",
        None,
        *sandbox_tenant.db_auths,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys == populated_business_data


@pytest.mark.parametrize(
    "fields_to_decrypt",
    [
        [
            "business.name",
            "business.dba",
            "business.tin",
            "business.address_line1",
            "business.address_line2",
        ],
        ["business.city", "business.zip", "business.state", "business.country"],
        ["business.website", "business.phone_number"],
    ],
)
def test_decrypt(sandbox_tenant, primary_bo, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )

    body = post(
        f"entities/{primary_bo.fp_bid}/vault/decrypt",
        data,
        *sandbox_tenant.db_auths,
    )
    for field in fields_to_decrypt:
        assert body[field] == primary_bo.client.decrypted_data.get(field)

    # Check the audit event - but never expect business.name since it's stored in plaintext, or
    # other attributes that don't exist
    audit_event = latest_audit_event_for(primary_bo.fp_bid, sandbox_tenant)
    assert audit_event["name"] == "decrypt_user_data"
    populated_keys = set(primary_bo.client.data)
    expected_audit_event_fields = (
        set(fields_to_decrypt) - {"business.name"}
    ) & populated_keys
    assert (
        set(audit_event["detail"]["data"]["decrypted_fields"])
        == expected_audit_event_fields
    )


def test_update_ownership_stake(sandbox_tenant, kyb_sandbox_ob_config):
    primary_bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    primary_bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = primary_bifrost.run()
    fp_bid = primary_bo.fp_bid

    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert len(body) == 2
    assert body[0]["ownership_stake"] == 50
    assert body[1]["ownership_stake"] == 30

    primary_stake_di = body[0]["ownership_stake_di"]
    secondary_stake_di = body[1]["ownership_stake_di"]

    fields = get(f"entities/{fp_bid}/vault", None, *sandbox_tenant.db_auths)
    stake_pattern = re.compile(
        r"^business\.beneficial_owners\.[^\.]+\.ownership_stake$"
    )
    stake_dis = set(di for di in fields if stake_pattern.match(di))
    assert stake_dis == {primary_stake_di, secondary_stake_di}

    result = post(
        f"businesses/{fp_bid}/vault/decrypt",
        {
            "fields": list(stake_dis),
            "reason": "Test",
        },
        sandbox_tenant.sk.key,
    )
    assert result == {primary_stake_di: "50", secondary_stake_di: "30"}

    patch(
        f"entities/{fp_bid}/vault",
        {
            # TODO: validate total BO stake is <= 100
            primary_stake_di: 80,
            secondary_stake_di: 40,
        },
        *sandbox_tenant.db_auths,
    )

    body = patch(
        f"entities/{fp_bid}/vault",
        {primary_stake_di: 120},
        *sandbox_tenant.db_auths,
        status_code=400,
    )
    assert (
        body["context"][primary_stake_di]
        == "The beneficial owners' ownership stakes must not sum to more than 100%"
    )

    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert len(body) == 2
    assert body[0]["ownership_stake"] == 80
    assert body[1]["ownership_stake"] == 40
