from tests.headers import FpAuth
from tests.utils import _gen_random_sandbox_id, post
from tests.utils import (
    get,
    patch,
    try_until_success,
    _gen_random_n_digit_number,
)
from tests.constants import LIVE_PHONE_NUMBER
from tests.bifrost_client import BifrostClient


def extract_trigger_sms(twilio, phone_number, id):
    def inner():
        real_phone_number = phone_number.split("#")[0]
        messages = twilio.messages.list(to=real_phone_number, limit=10)
        message = next(
            m for m in messages if f"{id}\n\nRe-verify your identity for" in m.body
        )
        token = message.body.split("#")[1].split("\n\nSent via Footprint")[0]
        return token

    return try_until_success(inner, 5)


def test_redo_kyc(sandbox_tenant, twilio):
    sandbox_id = _gen_random_sandbox_id()
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config,
        twilio,
        LIVE_PHONE_NUMBER,  # Have to make with the live phone number in order to receive SMSes
        sandbox_id,
    )
    sandbox_user = bifrost.run()

    # 1 onboarding_decision from initial KYC
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        *sandbox_user.tenant.db_auths,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # trigger RedoKYC
    note = _gen_random_n_digit_number(10)
    trigger = dict(kind="redo_kyc")
    post(
        f"entities/{sandbox_user.fp_id}/trigger",
        dict(trigger=trigger, note=note),
        *sandbox_user.tenant.db_auths,
    )
    # find link we sent to user via Twilio
    token = extract_trigger_sms(
        twilio, sandbox_user.client.data["id.phone_number"], note
    )
    auth_token = FpAuth(token)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config,
        auth_token,
        sandbox_user.client.data["id.phone_number"],
        sandbox_user.client.sandbox_id,
    )
    # Edit some data
    data = {"id.ssn9": "999-99-9999"}
    patch("/hosted/user/vault", data, bifrost.auth_token)
    bifrost.run()

    # we should have re-run KYC and now have 2 OBDs
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        *sandbox_user.tenant.db_auths,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2
