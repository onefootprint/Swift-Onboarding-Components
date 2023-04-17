import json
import pytest
from tests.auth import BusinessOwnerAuth
from tests.utils import (
    get,
    create_ob_config,
    inherit_user,
    challenge_user,
    identify_verify,
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
    )


@pytest.fixture(scope="session")
def primary_bo(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient(kyb_sandbox_ob_config, twilio)
    user = bifrost.run()
    assert user.fp_id
    assert user.fp_bid
    return user


def test_onboard_secondary_bo(primary_bo, kyb_sandbox_ob_config, twilio):
    # Extract the link sent to the secondary BO's phone number and verify it contains references to
    # the business and the BO that invited them
    bos = json.loads(primary_bo.client.data["business.kyced_beneficial_owners"])
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
    assert body["invited"]["phone_number"] == bos[1]["phone_number"]

    # Send the secondary BO through KYC
    bifrost = BifrostClient(
        kyb_sandbox_ob_config, twilio, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = bifrost.run()

    # Shouldn't have collected business data from the secondary owner
    assert not any(
        req["kind"] == "collect_business_data"
        for req in secondary_bo.client.handled_requirements
    )

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid

    # Validate the business owners
    tenant_sk = kyb_sandbox_ob_config.tenant.sk.key
    body = get(f"businesses/{primary_bo.fp_bid}/owners", None, tenant_sk)
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
    inherit_user(
        twilio, secondary_bo.client.data["id.phone_number"], secondary_bo_token
    )

    # But not for a different user
    phone_number = primary_bo.client.data["id.phone_number"]
    challenge_token = challenge_user(phone_number)
    identify_verify(
        twilio,
        phone_number,
        challenge_token,
        ob_config_auth=secondary_bo_token,
        expected_error="This business owner has already started KYC",
    )


def test_one_click_bos(sandbox_tenant, kyb_sandbox_ob_config, twilio):
    # Create two users onboarded onto the default OB config
    bifrost = BifrostClient(sandbox_tenant.default_ob_config, twilio)
    primary_bo = bifrost.run()
    assert primary_bo.fp_id
    assert not primary_bo.fp_bid

    bifrost = BifrostClient(sandbox_tenant.default_ob_config, twilio)
    secondary_bo = bifrost.run()
    assert secondary_bo.fp_id
    assert not secondary_bo.fp_bid

    # Onboard the primary_bo onto the KYB sandbox config
    bifrost = BifrostClient(
        kyb_sandbox_ob_config,
        twilio,
        override_inherit_phone=primary_bo.client.data["id.phone_number"],
    )
    primary_bo = bifrost.run()
    assert primary_bo.fp_id
    assert primary_bo.fp_bid
    # Assert we only had business requirements to satisfy - identity data filled out in previous
    # onboarding
    assert len(primary_bo.client.handled_requirements) == 1
    assert primary_bo.client.handled_requirements[0]["kind"] == "collect_business_data"

    bos = json.loads(primary_bo.client.data["business.kyced_beneficial_owners"])
    business_name = primary_bo.client.data["business.name"]
    (sms_body, token) = extract_bo_session_sms(
        twilio, bos[1]["phone_number"], business_name
    )
    assert bos[0]["first_name"] in sms_body
    assert bos[0]["last_name"] in sms_body
    assert primary_bo.client.data["business.name"] in sms_body
    secondary_bo_token = BusinessOwnerAuth(token)

    # Then, onboard the secondary_bo as a BO of primary_bo's business
    bifrost = BifrostClient(
        kyb_sandbox_ob_config,
        twilio,
        override_ob_config_auth=secondary_bo_token,
        override_inherit_phone=secondary_bo.client.data["id.phone_number"],
    )
    secondary_bo = bifrost.run()
    assert secondary_bo.fp_id
    assert secondary_bo.fp_bid
    # Assert we had no requirements to satisfy - business filled out by primary_bo, and identity
    # filled out in previous onboarding
    assert not secondary_bo.client.handled_requirements

    # fp_bid should be the same for each business owner
    assert primary_bo.fp_bid == secondary_bo.fp_bid


def extract_bo_session_sms(twilio, phone_number, business_name):
    def inner():
        real_phone_number = phone_number.split("#")[0]
        messages = twilio.messages.list(to=real_phone_number, limit=10)
        message = next(
            m
            for m in messages
            if f"invited you to verify your identify as a beneficial owner of {business_name}"
            in m.body
        )
        # TODO update this to extract the token from the real URL once we have a URL
        token = message.body.split("Continue here: ")[1].split(
            "\n\nSent via Footprint"
        )[0]
        return (message.body, token)

    return try_until_success(inner, 5)
