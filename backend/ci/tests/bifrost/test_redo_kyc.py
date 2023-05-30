import pytest
from tests.auth import FpAuth
from tests.conftest import generate_real_phone_number
from tests.utils import _gen_random_n_digit_number, post
from tests.utils import (
    get,
    try_until_success,
)
from tests.bifrost_client import BifrostClient

def extract_trigger_sms(twilio, phone_number, first_name):
    def inner():
        real_phone_number = phone_number.split("#")[0]
        messages = twilio.messages.list(to=real_phone_number, limit=10)
        message = next(
            m
            for m in messages
            if f"{first_name}, re-verify your identity for"
            in m.body
        )
        token = message.body.split("#")[1].split("\n\nSent via Footprint")[0]
        return token

    return try_until_success(inner, 5)



def test_redo_kyc(sandbox_tenant, twilio):
    phone_number = generate_real_phone_number()
    bifrost = BifrostClient(
        sandbox_tenant.default_ob_config, twilio, override_create_phone=phone_number, data = {"id.first_name": f"Boberto-{_gen_random_n_digit_number(10)}"}
    )
    sandbox_user =  bifrost.run()
    
    # 1 onboarding_decision from initial KYC
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        sandbox_user.tenant.sk.key,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # trigger RedoKYC
    post(f"entities/{sandbox_user.fp_id}/trigger", dict(kind="redo_kyc"),  sandbox_tenant.sk.key)
    # find link we sent to user via Twilio
    token = extract_trigger_sms(
        twilio, sandbox_user.client.data["id.phone_number"], sandbox_user.client.data["id.first_name"]
    )
    auth_token = FpAuth(token)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient(
        sandbox_tenant.default_ob_config,
        twilio,
        override_inherit_phone=sandbox_user.client.data["id.phone_number"],
        override_auth=auth_token
    )
    bifrost.run()
    bifrost.handle_authorize() # have to manually hit /authorize for now, since this isn't currently going to be recognized as an outstanding requirement
    assert len(bifrost.handled_requirements) == 0

    # we should have re-run KYC and now have 2 OBDs
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        sandbox_user.tenant.sk.key,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2

