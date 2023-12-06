import pytest
import time
from tests.headers import FpAuth
from tests.utils import _gen_random_sandbox_id, post
from tests.utils import (
    get,
    patch,
    try_until_success,
    _gen_random_n_digit_number,
    step_up_user,
)
from tests.bifrost_client import BifrostClient


def extract_trigger_sms(twilio, phone_number, id):
    def inner():
        messages = twilio.messages.list(to=phone_number, limit=25)
        print(f"Searching for message with id {id} sent to {phone_number}")
        message = next(
            m for m in messages if f"{id}\n\nRe-verify your identity for" in m.body
        )
        token = message.body.split("#")[1].split("\n\nSent via Footprint")[0]
        return token

    time.sleep(2)
    return try_until_success(inner, 60)


@pytest.mark.parametrize("with_document", [True, False])
def test_redo_kyc(sandbox_tenant, twilio, with_document, doc_first_obc):
    if with_document:
        obc = doc_first_obc
    else:
        obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new(obc, twilio)
    sandbox_user = bifrost.run()

    sandbox_id = bifrost.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]
    fp_id = sandbox_user.fp_id

    # 1 onboarding_decision from initial KYC
    timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_user.tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # trigger RedoKYC
    note = _gen_random_n_digit_number(10)

    body = get(f"entities/{fp_id}", None, *sandbox_user.tenant.db_auths)
    assert not body["has_outstanding_workflow_request"]

    def send_trigger():
        data = dict(trigger=dict(kind="redo_kyc"), note=note)
        post(f"entities/{fp_id}/triggers", data, *sandbox_user.tenant.db_auths)

    try_until_success(send_trigger, 15, 3)

    body = get(f"entities/{fp_id}", None, *sandbox_user.tenant.db_auths)
    assert body["has_outstanding_workflow_request"]

    body = get(f"entities/{fp_id}/timeline", None, *sandbox_user.tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    t_id = trigger_event["data"]["request"]["id"]
    assert not trigger_event["data"]["request"]["is_deactivated"]
    assert trigger_event["data"]["actor"]["kind"] == "organization"

    # re-generate a link as is done from the dashboard instead of scouring for it via SMS
    body = post(
        f"entities/{fp_id}/triggers/{t_id}/link", None, *sandbox_user.tenant.db_auths
    )
    initial_auth_token = FpAuth(body["link"].split("#")[1])
    auth_token = step_up_user(twilio, initial_auth_token, phone_number, False)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(obc, auth_token, phone_number, sandbox_id)
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

    # Edit some data and finish the onboarding
    data = {"id.ssn9": "999-99-9999"}
    patch("/hosted/user/vault", data, bifrost.auth_token)
    user = bifrost.run()
    fp_id = user.fp_id
    tenant = bifrost.ob_config.tenant

    body = get(f"entities/{fp_id}", None, *sandbox_user.tenant.db_auths)
    assert not body["has_outstanding_workflow_request"]

    # Assert that the timeline event now has is_deactivated = true
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_user.tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    assert trigger_event["data"]["request"]["is_deactivated"]

    # we should have re-run KYC and now have 2 OBDs
    obds = [i for i in body if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2

    if with_document:
        docs = [i for i in body if i["event"]["kind"] == "identity_document_uploaded"]
        assert len(docs) == 2

        users_docs = get(f"users/{fp_id}/documents", None, tenant.sk.key)
        assert len(users_docs) == 2
        assert all(map(lambda x: x["document_type"] == "drivers_license", users_docs))
        assert users_docs[1]["created_at"] > users_docs[0]["created_at"]


def test_redo_kyc_with_sms_link(sandbox_tenant, twilio, live_phone_number):
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    bifrost = BifrostClient.create(
        obc,
        twilio,
        live_phone_number,  # Have to make with the live phone number in order to receive SMSes
        sandbox_id,
    )
    sandbox_user = bifrost.run()

    sandbox_id = bifrost.sandbox_id
    fp_id = sandbox_user.fp_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # trigger RedoKYC
    note = _gen_random_n_digit_number(10)
    data = dict(trigger=dict(kind="redo_kyc"), note=note)
    post(f"entities/{fp_id}/triggers", data, *sandbox_user.tenant.db_auths)
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_user.tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    t_id = trigger_event["data"]["request"]["id"]
    assert not trigger_event["data"]["request"]["is_deactivated"]
    assert trigger_event["data"]["actor"]["kind"] == "organization"

    body = get(f"entities/{fp_id}", None, *sandbox_user.tenant.db_auths)
    assert body["has_outstanding_workflow_request"]

    # find link we sent to user via Twilio
    token = extract_trigger_sms(
        twilio, sandbox_user.client.data["id.phone_number"], note
    )
    initial_auth_token = FpAuth(token)
    auth_token = step_up_user(twilio, initial_auth_token, phone_number, False)

    # re-run Bifrost with the token
    bifrost = BifrostClient.raw_auth(obc, auth_token, phone_number, sandbox_id)
    bifrost.run()

    # Make sure the token can't be used to make another Workflow.
    # Re-log in using the same auth token
    auth_token = step_up_user(twilio, initial_auth_token, phone_number, False)
    post("hosted/onboarding", None, auth_token)
    body = get("hosted/onboarding/status", None, auth_token)
    # Shouldn't even include a met collect_data requirement because we inherited the Workflow
    # that is already completed
    assert not any(i["kind"] == "collect_data" for i in body["all_requirements"])

    # Assert that the timeline event now has is_deactivated = true
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_user.tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    assert trigger_event["data"]["request"]["is_deactivated"]

    # we should have re-run KYC and now have 2 OBDs
    obds = [i for i in body if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2
