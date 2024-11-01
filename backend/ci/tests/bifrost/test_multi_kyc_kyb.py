import time
import pytest
from tests.constants import (
    BUSINESS_SECONDARY_BOS,
    FIXTURE_PHONE_NUMBER2,
    FIXTURE_EMAIL2,
)
from tests.headers import BusinessOwnerAuth, FpAuth, SandboxId
from tests.dashboard.utils import update_rules
from tests.identify_client import IdentifyClient
from tests.utils import (
    get,
    post,
    create_ob_config,
    try_until_success,
)
from tests.bifrost_client import BifrostClient, User

BO_DIS = ["id.first_name", "id.last_name", "id.email", "id.phone_number"]


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data, kyb_cdos):
    cdos = must_collect_data + kyb_cdos
    return create_ob_config(
        sandbox_tenant, "Multi-KYC KYB config", cdos, kind="kyb", allow_reonboard=True
    )


@pytest.mark.flaky
def test_onboard_secondary_bo_live_phone(
    kyb_sandbox_ob_config, twilio, live_phone_number
):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    secondary_bos = [
        {
            "id.first_name": "Franklin",
            "id.last_name": "Frog",
            "id.email": "sandbox@onefootprint.com",
            "id.phone_number": live_phone_number,
            "ownership_stake": 30,
        },
    ]
    bifrost.data["business.secondary_beneficial_owners"] = secondary_bos
    # We could get rate limited sending the SMS to the secondary BO in POST /hosted/onboarding/process
    primary_bo = try_until_success(lambda: bifrost.run(), 60, retry_interval_s=15)
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"
    assert primary_bo.fp_id
    assert primary_bo.fp_bid
    assert any(
        r["kind"] == "collect_business_data"
        for r in primary_bo.client.handled_requirements
    )

    # Extract the link sent to the secondary BO's phone number and verify it contains references to
    # the business and the BO that invited them
    business_name = primary_bo.client.data["business.name"]
    (sms_body, secondary_bo_token) = extract_bo_session_sms(
        twilio, secondary_bos[0]["id.phone_number"], business_name
    )
    assert bifrost.data["id.first_name"] in sms_body
    assert bifrost.data["id.last_name"] in sms_body
    assert primary_bo.client.data["business.name"] in sms_body

    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "pass"


def test_onboard_secondary_bo(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"
    assert primary_bo.fp_id
    assert primary_bo.fp_bid
    assert any(
        r["kind"] == "collect_business_data" for r in bifrost.handled_requirements
    )

    secondary_bo_token = extract_bo_token(primary_bo)

    # Check the business information for the hosted bifrost flow associated with the secondary BO's
    # token
    body = get("hosted/business", None, secondary_bo_token)
    secondary_bos = primary_bo.client.data["business.secondary_beneficial_owners"]
    business_name = primary_bo.client.data["business.name"]
    assert body["name"] == business_name
    assert body["inviter"]["first_name"] == primary_bo.client.data["id.first_name"]
    assert body["inviter"]["last_name"] == primary_bo.client.data["id.last_name"]
    for di in BO_DIS:
        assert body["invited_data"][di] == secondary_bos[0][di]

    # Send the secondary BO through KYC
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "pass"

    # Shouldn't show confirm screen for secondary BO
    assert not any(
        r["kind"] == "collect_business_data"
        for r in secondary_bo.client.already_met_requirements
        + secondary_bo.client.handled_requirements
    )

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid

    # Validate the business owners
    tenant = kyb_sandbox_ob_config.tenant
    body = get(f"entities/{primary_bo.fp_bid}/business_owners", None, *tenant.db_auths)
    assert len(body) == 2
    assert body[0]["kind"] == "primary"
    assert body[0]["fp_id"] == primary_bo.fp_id
    assert body[0]["status"] == "pass"
    assert body[0]["ownership_stake"] == 50
    assert body[0]["source"] == "hosted"
    assert body[1]["kind"] == "secondary"
    assert body[1]["fp_id"] == secondary_bo.fp_id
    assert body[1]["status"] == "pass"
    assert body[1]["ownership_stake"] == 30
    assert body[0]["source"] == "hosted"

    # Should display error if you try to reuse the link
    body = get("hosted/business", None, secondary_bo_token, status_code=400)
    assert (
        body["message"]
        == "This link has already been used to collect a beneficial owner's information."
    )
    assert body["code"] == "E125"

    # Should be able to use the BO token in identify flow for same user
    phone_number = secondary_bo.client.data["id.phone_number"]
    sandbox_id = secondary_bo.client.sandbox_id
    IdentifyClient(
        kyb_sandbox_ob_config, sandbox_id, override_playbook_auth=secondary_bo_token
    ).login()

    # But not for a different user
    phone_number = primary_bo.client.data["id.phone_number"]
    sandbox_id_h = SandboxId(primary_bo.client.sandbox_id)

    data = dict(phone_number=phone_number, scope="onboarding")
    body = post("hosted/identify", data, secondary_bo_token, sandbox_id_h)
    assert body["user"]
    token = FpAuth(body["user"]["token"])

    data = dict(preferred_challenge_kind="sms", scope="onboarding")
    body = post("hosted/identify/login_challenge", data, token)
    challenge_data = body["challenge_data"]

    data = {
        "challenge_response": "000000",
        "challenge_token": challenge_data["challenge_token"],
        "scope": "onboarding",
    }
    token = FpAuth(challenge_data["token"])
    body = post(
        "hosted/identify/verify",
        data,
        token,
        status_code=400,
    )
    assert (
        body["message"]
        == "This link has already been used by a different beneficial owner. Please log into the account that last used this link or request a new link."
    )


def test_secondary_bo_doesnt_collect_doc(sandbox_tenant, must_collect_data, kyb_cdos):
    obc = create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config with docs",
        must_collect_data + kyb_cdos,
        kind="kyb",
        business_documents_to_collect=[
            dict(
                kind="custom",
                data=dict(
                    name="Business document",
                    identifier="document.custom.biz_doc",
                    requires_human_review=False,
                ),
            ),
        ],
    )

    bifrost = BifrostClient.new_user(obc)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    user = bifrost.run()
    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)

    secondary_bo_token = extract_bo_token(user)

    bifrost = BifrostClient.new_user(obc, override_ob_config_auth=secondary_bo_token)
    bifrost.run()
    # Only the first BO to fill out the KYB form should have to upload the business documents
    assert not any(
        req["kind"] == "collect_document" for req in bifrost.handled_requirements
    )


def test_kyb_with_sentilink_on_bos(sandbox_tenant, must_collect_data, kyb_cdos):
    obc = create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config with sentilink",
        must_collect_data + kyb_cdos,
        kind="kyb",
        verification_checks=[
            dict(kind="kyb", data=dict(ein_only=False)),
            dict(kind="sentilink", data=dict()),
        ],
    )

    bifrost = BifrostClient.new_user(obc)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    user = bifrost.run()

    secondary_bo_token = extract_bo_token(user)

    bifrost = BifrostClient.new_user(obc, override_ob_config_auth=secondary_bo_token)
    bo = bifrost.run()

    risk_signals = get(f"entities/{bo.fp_id}/risk_signals", None, sandbox_tenant.sk.key)
    assert any(r["reason_code"].startswith("sentilink") for r in risk_signals)


@pytest.fixture(scope="session")
def ob_config2(sandbox_tenant, must_collect_data):
    # Need a new ob config that has access to decrypt everything - otherwise, one-click workflows
    # won't be auto-authorized
    ob_conf_data = {
        "name": "Acme Bank Card 2",
        "must_collect_data": must_collect_data,
        "can_access_data": must_collect_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_one_click_bos(ob_config2, kyb_sandbox_ob_config):
    # Create two users onboarded onto the default OB config
    bifrost = BifrostClient.new_user(ob_config2)
    primary_bo_kyc = bifrost.run()
    assert primary_bo_kyc.fp_id
    assert not primary_bo_kyc.fp_bid

    bifrost = BifrostClient.new_user(ob_config2)
    secondary_bo_kyc = bifrost.run()
    assert secondary_bo_kyc.fp_id
    assert not secondary_bo_kyc.fp_bid

    # Onboard the primary_bo onto the KYB sandbox config
    sandbox_id = primary_bo_kyc.client.sandbox_id
    bifrost = BifrostClient.login_user(kyb_sandbox_ob_config, sandbox_id)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    assert [r["kind"] for r in primary_bo.client.handled_requirements] == [
        "create_business_onboarding",
        "collect_business_data",
        "process",
    ]
    assert primary_bo.fp_id == primary_bo_kyc.fp_id
    assert primary_bo.fp_bid
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"

    secondary_bo_token = extract_bo_token(primary_bo)

    # Then, onboard the secondary_bo_kyc as a BO of primary_bo's business
    sandbox_id = secondary_bo_kyc.client.sandbox_id
    bifrost = BifrostClient.login_user(
        kyb_sandbox_ob_config,
        sandbox_id,
        override_ob_config_auth=secondary_bo_token,
    )
    secondary_bo = bifrost.run()
    assert secondary_bo.fp_id == secondary_bo_kyc.fp_id
    assert secondary_bo.fp_bid
    # Assert we had no requirements to satisfy - business filled out by primary_bo, and identity
    # filled out in previous onboarding
    assert [r["kind"] for r in secondary_bo.client.handled_requirements] == ["process"]

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "pass"


@pytest.mark.parametrize(
    "primary_bo_result,secondary_bo_result", [("pass", "fail"), ("fail", "pass")]
)
def test_kyb_fail_kyc(
    kyb_sandbox_ob_config, sandbox_tenant, primary_bo_result, secondary_bo_result
):
    """
    Test that the business's status is `fail` if either of the beneficial owners fails KYC.
    """
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result=primary_bo_result,
        kyb_fixture_result="use_rules_outcome",
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    assert primary_bo.client.validate_response["user"]["status"] == primary_bo_result
    assert primary_bo.client.validate_response["business"]["status"] == "incomplete"

    secondary_bo_token = extract_bo_token(primary_bo)

    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result=secondary_bo_result,
    )
    secondary_bo = bifrost.run()
    assert (
        secondary_bo.client.validate_response["user"]["status"] == secondary_bo_result
    )
    assert secondary_bo.client.validate_response["business"]["status"] == "fail"

    # Make sure we raise a risk signal
    body = get(
        f"entities/{secondary_bo.fp_bid}/risk_signals", None, sandbox_tenant.s_sk
    )
    bo_failed_rses = [
        i for i in body if i["reason_code"] == "beneficial_owner_failed_kyc"
    ]
    assert len(bo_failed_rses) == 1

    assert "beneficial_owner_possible_missing_bo" not in [
        i["reason_code"] for i in body
    ]


def test_kyb_possible_bo_missing_reason_code(kyb_sandbox_ob_config, sandbox_tenant):
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result="pass",
        kyb_fixture_result="use_rules_outcome",
    )
    secondary_bos = {
        "business.secondary_beneficial_owners": [
            {
                "id.first_name": "Franklin",
                "id.last_name": "Frog",
                "id.email": FIXTURE_EMAIL2,
                "id.phone_number": FIXTURE_PHONE_NUMBER2,
                "ownership_stake": 10,
            }
        ],
    }
    bifrost.data.update(secondary_bos)
    primary_bo = bifrost.run()
    secondary_bo_token = extract_bo_token(primary_bo)

    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="pass",
    )
    secondary_bo = bifrost.run()

    body = get(
        f"entities/{secondary_bo.fp_bid}/risk_signals", None, sandbox_tenant.s_sk
    )

    bo_failed_rses = next(
        (i for i in body if i["reason_code"] == "beneficial_owner_possible_missing_bo"),
        None,
    )

    assert bo_failed_rses is not None
    assert bo_failed_rses["severity"] == "info"


def test_concurrent_onboard(kyb_sandbox_ob_config, sandbox_tenant):
    """
    Test that the KYC results used to decide whether BOs passed KYC all come from the same business workflow.
    """
    # First, fail the user when onboarding onto this playbook
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result="fail",
        kyb_fixture_result="use_rules_outcome",
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    biz_timeline = get(
        f"entities/{primary_bo.fp_bid}/timeline", None, *sandbox_tenant.db_auths
    )
    tl_events = [
        i for i in biz_timeline if i["event"]["kind"] == "business_owner_completed_kyc"
    ]
    assert len(tl_events) == 1
    tl_events[0]["event"]["data"]["fp_id"] == primary_bo.fp_id
    primary_bo_timeline = get(
        f"entities/{primary_bo.fp_id}/timeline", None, *sandbox_tenant.db_auths
    )
    tl_events = [
        i
        for i in primary_bo_timeline
        if i["event"]["kind"] == "business_owner_completed_kyc"
    ]
    assert len(tl_events) == 0

    assert primary_bo.client.validate_response["user"]["status"] == "fail"
    assert primary_bo.client.validate_response["business"]["status"] == "incomplete"

    # Extract the secondary BO token, but don't use it yet
    secondary_bo_token = extract_bo_token(primary_bo)

    # Then, onboard the same user onto the same playbook and pass them this time. This creates a new business.
    bifrost = BifrostClient.login_user(
        kyb_sandbox_ob_config, sandbox_id=bifrost.sandbox_id, fixture_result="pass"
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo2 = bifrost.run()
    assert primary_bo2.client.validate_response["user"]["status"] == "pass"
    assert primary_bo2.fp_bid != primary_bo.fp_bid
    timeline = get(
        f"entities/{primary_bo2.fp_bid}/timeline", None, *sandbox_tenant.db_auths
    )
    tl_events = [
        i for i in timeline if i["event"]["kind"] == "business_owner_completed_kyc"
    ]
    assert len(tl_events) == 1
    tl_events[0]["event"]["data"]["fp_id"] == primary_bo2.fp_id

    # Make sure the initial business is still incomplete
    body = get(f"entities/{primary_bo.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"

    # Then, onboard the secondary BO from the first business. It should fail since the primary BO failed KYC
    # when onboarding this business.
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="pass",
    )
    secondary_bo = bifrost.run()
    assert secondary_bo.client.validate_response["user"]["status"] == "pass"
    assert secondary_bo.client.validate_response["business"]["status"] == "fail"
    timeline = get(
        f"entities/{secondary_bo.fp_bid}/timeline", None, *sandbox_tenant.db_auths
    )
    tl_bo_fp_ids = [
        i["event"]["data"]["fp_id"]
        for i in timeline
        if i["event"]["kind"] == "business_owner_completed_kyc"
    ]
    assert len(tl_bo_fp_ids) == 2
    assert set(tl_bo_fp_ids) == set([secondary_bo.fp_id, primary_bo.fp_id])

    # Make sure the second business that was created is still incomplete + unaffected
    body = get(f"entities/{primary_bo2.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"

    # Ensure the failure is from the primary BO failing KYC
    body = get(
        f"entities/{secondary_bo.fp_bid}/risk_signals", None, sandbox_tenant.s_sk
    )
    assert any(i["reason_code"] == "beneficial_owner_failed_kyc" for i in body)


def test_dont_proceed_on_nonterminal(kyb_sandbox_ob_config, sandbox_tenant):
    """Make sure we don't allow finishing KYB when one BO is in step up"""
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result="fail",
        kyb_fixture_result="use_rules_outcome",
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    assert primary_bo.client.validate_response["user"]["status"] == "fail"
    assert primary_bo.client.validate_response["business"]["status"] == "incomplete"

    secondary_bo_token = extract_bo_token(primary_bo)
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="step_up",
    )
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    bifrost.handle_one_requirement("process")
    assert not bifrost.get_requirement("collect_document")["is_met"]
    # This should leave the user in step-up
    body = get("hosted/user/private/token", None, bifrost.auth_token)
    secondary_fp_id = body["fp_id"]

    # Make sure the user is still incomplete, and so the business is also still incomplete
    body = get(f"entities/{secondary_fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"

    body = get(f"entities/{primary_bo.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"


def test_ignore_confirm_on_awaiting_bo_kyc(kyb_sandbox_ob_config):
    """
    Make sure we don't serialize a requirement to show the confirm business data screen if the business
    workflow has moved into a state that doesn't support data input
    """
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    bifrost.handle_one_requirement("collect_business_data")
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    bifrost.handle_one_requirement("process")
    # Business workflow is now AwaitingBoKyc, we should not serialize even a "met" requirement for
    # collect_business_data
    all_reqs = bifrost.get_status()["all_requirements"]
    assert not any(r["kind"] == "collect_business_data" for r in all_reqs)


def test_kyb_step_up(kyb_sandbox_ob_config, sandbox_tenant):
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        fixture_result="pass",
        kyb_fixture_result="pass",
        vault_barcode_with_doc=False,
    )

    # Add a rule for BO
    bo_missing_rule = dict(
        name="Missing BO Rule",
        rule_expression=[
            {
                "field": "beneficial_owner_possible_missing_bo",
                "op": "eq",
                "value": True,
            }
        ],
        rule_action=dict(
            kind="step_up",
            config=[
                dict(
                    kind="custom",
                    data=dict(
                        name="test",
                        identifier="document.custom.operating_agreement",
                        description="Operate this agreement",
                        upload_settings="prefer_upload",
                        requires_human_review=True,
                    ),
                )
            ],
        ),
    )
    obc1 = get(
        f"org/onboarding_configs/{bifrost.ob_config.id}",
        None,
        *sandbox_tenant.db_auths,
    )
    update_rules(
        obc1["id"],
        obc1["rule_set"]["version"],
        *sandbox_tenant.db_auths,
        add=[bo_missing_rule],
    )

    # Generate a stepup risk signal for missing BO
    secondary_bos = {
        "business.secondary_beneficial_owners": [
            {
                "id.first_name": "Franklin",
                "id.last_name": "Frog",
                "id.email": FIXTURE_EMAIL2,
                "id.phone_number": FIXTURE_PHONE_NUMBER2,
                "ownership_stake": 10,
            }
        ],
    }
    bifrost.data.update(secondary_bos)
    doc_req = bifrost.get_requirement("collect_document")
    # No doc req until we proceed the biz_wf in /process at the end of the primary BO KYC
    assert doc_req is None

    # Handle a bunch of bifrost requirements
    bifrost.handle_one_requirement("collect_business_data")
    bifrost.handle_one_requirement("collect_data")
    bifrost.handle_one_requirement("liveness")
    bifrost.handle_one_requirement("process")

    # now there's a document requirement for the business
    doc_req = bifrost.get_requirement("collect_document")
    # We have a custom doc stepup
    assert doc_req["config"]["identifier"] == "document.custom.operating_agreement"

    primary_bo = bifrost.run()
    # the BO KYC is done
    body = get(f"entities/{primary_bo.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "pass"
    # but the business is still in progress
    body = get(f"entities/{primary_bo.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "in_progress"
    # and still not in review
    assert not body["requires_manual_review"]
    # Inspect the business timeline
    timeline = get(
        f"entities/{primary_bo.fp_bid}/timeline", None, *sandbox_tenant.db_auths
    )
    stepup_event = [i for i in timeline if i["event"]["kind"] == "step_up"].pop()
    rsr = get(
        f"entities/{primary_bo.fp_bid}/rule_set_result/{stepup_event['event']['data'][0]['rule_set_result_id']}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert rsr["rule_action_triggered"]["kind"] == "step_up"
    rule_results = rsr.get("rule_results", [])
    true_rules = [rule for rule in rule_results if rule.get("result")]
    assert len(true_rules) == 1
    assert (
        true_rules[0]["rule"]["rule_expression"][0]["field"]
        == "beneficial_owner_possible_missing_bo"
    )

    # We uploaded a doc
    doc_uploaded = [i for i in timeline if i["event"]["kind"] == "document_uploaded"]
    assert len(doc_uploaded) == 1

    secondary_bo_token = extract_bo_token(primary_bo)

    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config,
        override_ob_config_auth=secondary_bo_token,
        fixture_result="pass",
    )
    secondary_bo = bifrost.run()
    assert (
        get(f"entities/{secondary_bo.fp_id}", None, *sandbox_tenant.db_auths)["status"]
        == "pass"
    )

    body = get(f"entities/{secondary_bo.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "fail"
    assert body["requires_manual_review"]
    assert body["manual_review_kinds"] == ["document_needs_review"]


def extract_bo_session_sms(twilio, phone_number, business_name):
    def inner():
        messages = twilio.messages.list(to=phone_number, limit=25)
        print(
            f"Searching for message for business {business_name} sent to {phone_number}"
        )
        message = next(
            m
            for m in messages
            if f"identified you as a beneficial owner of {business_name}. To finish verifying your business"
            in m.body
        )
        token = message.body.split("#")[1].split("\n\nSent via Footprint")[0]
        return (message.body, BusinessOwnerAuth(token))

    time.sleep(2)
    return try_until_success(inner, 60)


def extract_bo_token(user: User):
    tenant = user.client.ob_config.tenant
    body = post(
        f"entities/{user.fp_bid}/business_owners/kyc_links", dict(), *tenant.db_auths
    )
    assert len(body) == 1
    return BusinessOwnerAuth(body[0]["token"])
