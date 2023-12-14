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
    create_ob_config,
)
from tests.bifrost_client import BifrostClient


def send_trigger(fp_id, sandbox_tenant, trigger):
    data = dict(trigger=trigger)
    post(f"entities/{fp_id}/triggers", data, *sandbox_tenant.db_auths)

    # Grab the trigger ID from the timeline
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    t_id = trigger_event["data"]["request"]["id"]
    assert not trigger_event["data"]["request"]["is_deactivated"]
    assert trigger_event["data"]["actor"]["kind"] == "organization"

    # Enforce the user is marked as "info requested"
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert body["has_outstanding_workflow_request"]
    # And that we serialize that the user has info requested
    body = get(f"users/{fp_id}", None, sandbox_tenant.sk.key)
    assert body["requires_additional_info"]

    # Re-generate a link as is done from the dashboard
    body = post(
        f"entities/{fp_id}/triggers/{t_id}/link", None, *sandbox_tenant.db_auths
    )
    return FpAuth(body["link"].split("#")[1])


def complete_redo_flow(twilio, user, auth_token, pre_run=None):
    phone_number = user.client.data["id.phone_number"]
    sandbox_id = user.client.data["id.phone_number"]
    fp_id = user.fp_id
    tenant = user.client.ob_config.tenant

    # Should start out with only one OBD timeline event
    timeline = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # Re-run Bifrost with the token, optionally with any pre_run assertion checks
    auth_token = step_up_user(twilio, auth_token, phone_number, False)
    # Weird, the ob_config here isn't really used
    bifrost = BifrostClient.raw_auth(
        user.client.ob_config, auth_token, phone_number, sandbox_id
    )
    if pre_run:
        pre_run(bifrost)
    bifrost.run()

    # User shouldn't be marked as "info requested" anymore
    body = get(f"entities/{fp_id}", None, *tenant.db_auths)
    assert not body["has_outstanding_workflow_request"]

    # Verify the timeline events are updated
    body = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body if i["event"]["kind"] == "workflow_triggered"
    )
    assert trigger_event["data"]["request"]["is_deactivated"]
    obds = [i for i in body if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2


@pytest.mark.parametrize("with_document", [True, False])
def test_redo_kyc(sandbox_tenant, twilio, with_document, doc_first_obc):
    if with_document:
        obc = doc_first_obc
    else:
        obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new(obc, twilio)
    sandbox_user = bifrost.run()
    fp_id = sandbox_user.fp_id

    # Trigger redo
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, dict(kind="redo_kyc"))

    # Re-run bifrost with the token
    def pre_run(bifrost):
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

    bifrost = complete_redo_flow(twilio, sandbox_user, initial_auth_token, pre_run)

    if with_document:
        body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
        docs = [i for i in body if i["event"]["kind"] == "identity_document_uploaded"]
        assert len(docs) == 2

        users_docs = get(f"users/{fp_id}/documents", None, sandbox_tenant.sk.key)
        assert len(users_docs) == 2
        assert all(map(lambda x: x["document_type"] == "drivers_license", users_docs))
        assert users_docs[1]["created_at"] > users_docs[0]["created_at"]


@pytest.mark.parametrize(
    "trigger",
    [
        dict(kind="id_document", data=dict(collect_selfie=False)),
        dict(kind="proof_of_ssn"),
    ],
)
def test_recollect_document(trigger, sandbox_tenant, twilio):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    sandbox_user = bifrost.run()

    fp_id = sandbox_user.fp_id

    # Trigger recollect document
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger)

    # re-run Bifrost with the token from the link we sent to user
    def pre_run(bifrost):
        # Check that requirements are what we expect
        requirements = bifrost.get_status()["all_requirements"]
        assert requirements[0]["kind"] == "collect_document"
        assert not requirements[0]["is_met"]

    complete_redo_flow(twilio, sandbox_user, initial_auth_token, pre_run)

    users_docs = get(f"users/{fp_id}/documents", None, sandbox_tenant.sk.key)
    # currently we request iddoc + proof of ssn doc for proof_of_ssn triggers
    expected_len = 2 if trigger['kind'] == "proof_of_ssn" else 1
    assert len(users_docs) == expected_len


def test_trigger_incomplete(sandbox_tenant, twilio):
    """
    Ensure we can initiate a trigger for a user that has only an incomplete workflow.
    """
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    sandbox_id = bifrost.sandbox_id
    phone_number = bifrost.data["id.phone_number"]

    # Don't finish onboarding. Grab fp_id from dashboard
    body = post("entities/search", None, *sandbox_tenant.db_auths)
    user = next(u for u in body["data"] if u["sandbox_id"] == sandbox_id)
    fp_id = user["id"]

    # Trigger redo KYC
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, dict(kind="redo_kyc"))
    auth_token = step_up_user(twilio, initial_auth_token, phone_number, False)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, phone_number, sandbox_id
    )
    bifrost.run()


def test_cant_make_multiple_wfs(sandbox_tenant, twilio):
    """
    Ensure we cannot reonboard multiple times using the link sent to the user
    """
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    sandbox_user = bifrost.run()

    # Trigger redo KYC
    initial_auth_token = send_trigger(
        sandbox_user.fp_id, sandbox_tenant, dict(kind="redo_kyc")
    )

    # And then re-run bifrost using the redo KYC link
    complete_redo_flow(twilio, sandbox_user, initial_auth_token)

    # Make sure the token can't be used to make another Workflow by re-logging in with the same token.
    # Shouldn't include a met collect_data requirement because we inherited the completed Workflow.
    phone_number = bifrost.data["id.phone_number"]
    auth_token = step_up_user(twilio, initial_auth_token, phone_number, False)
    post("hosted/onboarding", None, auth_token)
    body = get("hosted/onboarding/status", None, auth_token)
    assert not any(i["kind"] == "collect_data" for i in body["all_requirements"])


def test_redo_kyc_with_sms_link(sandbox_tenant, twilio, live_phone_number):
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config,
        twilio,
        live_phone_number,  # Have to make with the live phone number in order to receive SMSes
        _gen_random_sandbox_id(),
    )
    sandbox_user = bifrost.run()
    fp_id = sandbox_user.fp_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # trigger RedoKYC
    note = _gen_random_n_digit_number(10)

    def send_trigger():
        data = dict(trigger=dict(kind="redo_kyc"), note=note)
        post(f"entities/{fp_id}/triggers", data, *sandbox_tenant.db_auths)

    try_until_success(send_trigger, 15, 3)

    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert body["has_outstanding_workflow_request"]

    # find link we sent to user via Twilio
    def inner():
        messages = twilio.messages.list(to=phone_number, limit=25)
        print(f"Searching for message with id {note} sent to {phone_number}")
        message = next(
            m for m in messages if f"{note}\n\nRe-verify your identity for" in m.body
        )
        token = message.body.split("#")[1].split("\n\nSent via Footprint")[0]
        return token

    time.sleep(2)
    token = try_until_success(inner, 60)
    initial_auth_token = FpAuth(token)

    # And complete redo flow using this auth token
    complete_redo_flow(twilio, sandbox_user, initial_auth_token)


def test_complete_trigger_w_user_specific_token(sandbox_tenant, twilio):
    """
    Use a user-specific token to finish the redo flow. This should inherit the outstanding
    WorkflowRequest
    """
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    sandbox_user = bifrost.run()

    # Trigger redo KYC
    send_trigger(sandbox_user.fp_id, sandbox_tenant, dict(kind="redo_kyc"))

    # Generate an auth token for this user without a playbook key and complete redo flow using this
    # auth token. This auth token should automatically inherit the outstanding workflow request
    # because there was no obc provided
    data = dict(kind="inherit")
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])
    complete_redo_flow(twilio, sandbox_user, auth_token)
