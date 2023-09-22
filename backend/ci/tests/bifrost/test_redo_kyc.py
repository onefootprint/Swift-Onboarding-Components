import pytest
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


@pytest.mark.parametrize("with_document", [True, False])
def test_redo_kyc(sandbox_tenant, twilio, with_document, doc_first_obc):
    if with_document:
        obc = doc_first_obc
    else:
        obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    bifrost = BifrostClient.create(
        obc,
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

    def send_trigger():
        post(
            f"entities/{sandbox_user.fp_id}/trigger",
            dict(trigger=trigger, note=note),
            *sandbox_user.tenant.db_auths,
        )

    try_until_success(send_trigger, 15, 3)
    # find link we sent to user via Twilio
    token = extract_trigger_sms(
        twilio, sandbox_user.client.data["id.phone_number"], note
    )
    auth_token = FpAuth(token)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        obc,
        auth_token,
        sandbox_user.client.data["id.phone_number"],
        sandbox_user.client.sandbox_id,
    )

    # Check that requirements are what we expect
    requirements = bifrost.get_status()["all_requirements"]
    if with_document:
        assert requirements[0]["kind"] == "collect_document"
        assert not requirements[0]["is_met"]
        assert requirements[1]["kind"] == "collect_data"
        assert requirements[1]["is_met"]
    else:
        assert requirements[0]["kind"] == "collect_data"
        assert requirements[0]["is_met"]

    # Edit some data
    data = {"id.ssn9": "999-99-9999"}
    patch("/hosted/user/vault", data, bifrost.auth_token)
    user = bifrost.run()
    fp_id = user.fp_id
    tenant = bifrost.ob_config.tenant

    # we should have re-run KYC and now have 2 OBDs
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        *sandbox_user.tenant.db_auths,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2

    if with_document:
        docs = [
            i for i in timeline if i["event"]["kind"] == "identity_document_uploaded"
        ]
        assert len(docs) == 2

        users_docs = get(f"users/{fp_id}/documents", None, *tenant.db_auths)
        assert len(users_docs) == 2
        assert all(map(lambda x: x["document_type"] == "drivers_license", users_docs))
        assert users_docs[1]["created_at"] >  users_docs[0]["created_at"]