import time
import pytest
from tests.headers import BusinessOwnerAuth, FpAuth, SandboxId
from tests.identify_client import IdentifyClient
from tests.utils import (
    get,
    post,
    create_ob_config,
    try_until_success,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    kyb_cdos = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_kyced_beneficial_owners",
    ]
    return create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config",
        must_collect_data + kyb_cdos,
        can_access_data + kyb_cdos,
        kind="kyb",
    )


@pytest.mark.flaky
def test_onboard_secondary_bo(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient.new(kyb_sandbox_ob_config)
    # We could get rate limited sending the SMS to the secondary BO in POST /hosted/onboarding/process
    primary_bo = try_until_success(lambda: bifrost.run(), 60, retry_interval_s=15)
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"
    assert primary_bo.fp_id
    assert primary_bo.fp_bid

    # Extract the link sent to the secondary BO's phone number and verify it contains references to
    # the business and the BO that invited them
    bos = primary_bo.client.data["business.kyced_beneficial_owners"]
    business_name = primary_bo.client.data["business.name"]
    (sms_body, token) = extract_bo_session_sms(
        twilio, bos[1]["phone_number"], business_name
    )
    assert bos[0]["first_name"] in sms_body
    assert bos[0]["last_name"] in sms_body
    assert primary_bo.client.data["business.name"] in sms_body
    secondary_bo_token = BusinessOwnerAuth(token)

    # Check the business information for the hosted bifrost flow associated with the secondary BO's
    # token
    body = get("hosted/business", None, secondary_bo_token)
    assert body["name"] == business_name
    assert body["inviter"]["first_name"] == primary_bo.client.data["id.first_name"]
    assert body["inviter"]["last_name"] == primary_bo.client.data["id.last_name"]
    assert body["invited"]["email"] == bos[1]["email"]
    assert body["invited"]["phone_number"] == bos[1]["phone_number"].replace(" ", "")

    # Send the secondary BO through KYC
    bifrost = BifrostClient.new(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "pass"

    # Shouldn't have collected business data from the secondary owner
    assert not any(
        req["kind"] == "collect_business_data"
        for req in secondary_bo.client.handled_requirements
    )

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid

    # Validate the business owners
    tenant = kyb_sandbox_ob_config.tenant
    body = get(f"businesses/{primary_bo.fp_bid}/owners", None, *tenant.db_auths)
    assert len(body) == 2
    assert body[0]["kind"] == "primary"
    assert body[0]["id"] == primary_bo.fp_id
    assert body[0]["status"] == "pass"
    assert body[0]["ownership_stake"] == 50
    assert body[1]["kind"] == "secondary"
    assert body[1]["id"] == secondary_bo.fp_id
    assert body[1]["status"] == "pass"
    assert body[1]["ownership_stake"] == 30

    # Should be able to use the BO token in identify flow for same user
    phone_number = secondary_bo.client.data["id.phone_number"]
    sandbox_id = secondary_bo.client.sandbox_id
    IdentifyClient(secondary_bo_token, sandbox_id).inherit()

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
    assert body["error"]["message"] == "This business owner has already started KYC"


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


@pytest.mark.flaky
def test_one_click_bos(ob_config2, kyb_sandbox_ob_config, twilio):
    # Create two users onboarded onto the default OB config
    bifrost = BifrostClient.new(ob_config2)
    primary_bo = bifrost.run()
    assert primary_bo.fp_id
    assert not primary_bo.fp_bid

    bifrost = BifrostClient.new(ob_config2)
    secondary_bo = bifrost.run()
    assert secondary_bo.fp_id
    assert not secondary_bo.fp_bid

    # Onboard the primary_bo onto the KYB sandbox config
    sandbox_id = primary_bo.client.sandbox_id
    bifrost = BifrostClient.inherit(kyb_sandbox_ob_config, sandbox_id)
    # Kind of hacky - sometimes, we run this test too closely after the previous and we get rate
    # limited for sending an SMS to the same number (the secondary BO). Let's retry this until it
    # succeeds
    try:
        time.sleep(5)
        primary_bo = bifrost.run()
        # Can only do this check if we passed on the first try and weren't rate limited, otherwise
        # the retry will clear out `handled_requirements`
        # Assert we only had business requirements to satisfy - identity data filled out in previous
        # onboarding
        # No Authorize since they already onboarded at this tenant
        assert [r["kind"] for r in primary_bo.client.handled_requirements] == [
            "collect_business_data",
            "process",
        ]
    except:
        # We could get rate limited sending the SMS to the secondary BO in POST /hosted/onboarding/process
        primary_bo = try_until_success(lambda: bifrost.run(), 60)
    assert primary_bo.fp_id
    assert primary_bo.fp_bid
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "incomplete"

    bos = primary_bo.client.data["business.kyced_beneficial_owners"]
    business_name = primary_bo.client.data["business.name"]
    (sms_body, token) = extract_bo_session_sms(
        twilio, bos[1]["phone_number"], business_name
    )
    assert bos[0]["first_name"] in sms_body
    assert bos[0]["last_name"] in sms_body
    assert primary_bo.client.data["business.name"] in sms_body
    secondary_bo_token = BusinessOwnerAuth(token)

    # Then, onboard the secondary_bo as a BO of primary_bo's business
    sandbox_id = secondary_bo.client.sandbox_id
    bifrost = BifrostClient.inherit(
        kyb_sandbox_ob_config,
        sandbox_id,
        override_ob_config_auth=secondary_bo_token,
    )
    secondary_bo = bifrost.run()
    assert secondary_bo.fp_id
    assert secondary_bo.fp_bid
    # Assert we had no requirements to satisfy - business filled out by primary_bo, and identity
    # filled out in previous onboarding
    assert [r["kind"] for r in secondary_bo.client.handled_requirements] == [
        "process",
    ]

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid
    assert bifrost.validate_response["user"]["status"] == "pass"
    assert bifrost.validate_response["business"]["status"] == "pass"


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
        return (message.body, token)

    time.sleep(2)
    return try_until_success(inner, 60)
