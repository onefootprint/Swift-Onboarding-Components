import time
import pytest
from tests.constants import (
    BUSINESS_SECONDARY_BOS,
    FIXTURE_PHONE_NUMBER2,
    FIXTURE_EMAIL2,
)
from tests.headers import BusinessOwnerAuth, FpAuth, SandboxId
from tests.identify_client import IdentifyClient
from tests.utils import (
    get,
    post,
    create_ob_config,
    try_until_success,
)
from tests.bifrost_client import BifrostClient

MULTI_KYC_KYB_CDOS = [
    "business_name",
    "business_tin",
    "business_address",
    "business_phone_number",
    "business_website",
    "business_kyced_beneficial_owners",
]


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data):
    cdos = must_collect_data + MULTI_KYC_KYB_CDOS
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

    secondary_bo_token = extract_bo_token(bifrost)

    # Check the business information for the hosted bifrost flow associated with the secondary BO's
    # token
    body = get("hosted/business", None, secondary_bo_token)
    secondary_bos = primary_bo.client.data["business.secondary_beneficial_owners"]
    business_name = primary_bo.client.data["business.name"]
    assert body["name"] == business_name
    assert body["inviter"]["first_name"] == primary_bo.client.data["id.first_name"]
    assert body["inviter"]["last_name"] == primary_bo.client.data["id.last_name"]
    assert body["invited"]["email"] == secondary_bos[0]["id.email"]
    assert body["invited"]["phone_number"] == secondary_bos[0][
        "id.phone_number"
    ].replace(" ", "")

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

    # Should be able to use the BO token in identify flow for same user
    phone_number = secondary_bo.client.data["id.phone_number"]
    sandbox_id = secondary_bo.client.sandbox_id
    IdentifyClient(
        kyb_sandbox_ob_config, sandbox_id, override_playbook_auth=secondary_bo_token
    ).inherit()

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
    assert body["message"] == "This business owner has already started KYC"


def test_secondary_bo_doesnt_collect_doc(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config with docs",
        must_collect_data + MULTI_KYC_KYB_CDOS,
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
    bifrost.run()
    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)

    secondary_bo_token = extract_bo_token(bifrost)

    bifrost = BifrostClient.new_user(obc, override_ob_config_auth=secondary_bo_token)
    bifrost.run()
    # Only the first BO to fill out the KYB form should have to upload the business documents
    assert not any(
        req["kind"] == "collect_document" for req in bifrost.handled_requirements
    )


def test_kyb_with_sentilink_on_bos(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config with sentilink",
        must_collect_data + MULTI_KYC_KYB_CDOS,
        kind="kyb",
        verification_checks=[
            dict(kind="kyb", data=dict(ein_only=False)),
            dict(kind="sentilink", data=dict()),
        ],
    )

    bifrost = BifrostClient.new_user(obc)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    bifrost.run()

    secondary_bo_token = extract_bo_token(bifrost)

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
    bifrost = BifrostClient.inherit_user(kyb_sandbox_ob_config, sandbox_id)
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = bifrost.run()
    assert [r["kind"] for r in primary_bo.client.handled_requirements] == [
        "collect_business_data",
        "process",
    ]
    assert primary_bo.fp_id == primary_bo_kyc.fp_id
    assert primary_bo.fp_bid
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"

    secondary_bo_token = extract_bo_token(bifrost)

    # Then, onboard the secondary_bo_kyc as a BO of primary_bo's business
    sandbox_id = secondary_bo_kyc.client.sandbox_id
    bifrost = BifrostClient.inherit_user(
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

    secondary_bo_token = extract_bo_token(bifrost)

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
    secondary_bo_token = extract_bo_token(bifrost)

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
    assert primary_bo.client.validate_response["user"]["status"] == "fail"
    assert primary_bo.client.validate_response["business"]["status"] == "incomplete"

    # Extract the secondary BO token, but don't use it yet
    secondary_bo_token = extract_bo_token(bifrost)

    # Then, onboard the same user onto the same playbook and pass them this time. This creates a new business.
    bifrost = BifrostClient.inherit_user(
        kyb_sandbox_ob_config, sandbox_id=bifrost.sandbox_id, fixture_result="pass"
    )
    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo2 = bifrost.run()
    assert primary_bo2.client.validate_response["user"]["status"] == "pass"
    assert primary_bo2.fp_bid != primary_bo.fp_bid

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

    secondary_bo_token = extract_bo_token(bifrost)
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


def extract_bo_token(bifrost: BifrostClient):
    body = post("hosted/user/private/bo_links", None, bifrost.auth_token)
    assert len(body) == 1
    return BusinessOwnerAuth(body[0]["token"])
