from uuid import uuid4
import pytest
from tests.bifrost.test_multi_kyc_kyb import extract_bo_token
from tests.bifrost_client import BifrostClient
from tests.constants import (
    BUSINESS_SECONDARY_BOS,
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
    ID_DATA,
)
from tests.headers import FpAuth
from tests.identify_client import IdentifyClient
from tests.utils import _gen_random_ssn, post
from tests.utils import get, patch


def send_trigger(fp_id, sandbox_tenant, trigger, **kwargs):
    action = dict(trigger=trigger, kind="trigger", **kwargs)
    data = dict(actions=[action])
    post(f"entities/{fp_id}/actions", data, *sandbox_tenant.db_auths)

    # Grab the trigger ID from the timeline
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body["data"] if i["event"]["kind"] == "workflow_triggered"
    )
    assert trigger_event["data"]["request_is_active"]
    assert trigger_event["data"]["actor"]["kind"] == "organization"

    # Enforce the user is marked as "info requested"
    body = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert body["has_outstanding_workflow_request"]
    # And that we serialize that the user has info requested
    body = get(f"users/{fp_id}", None, sandbox_tenant.sk.key)
    assert body["requires_additional_info"]

    if kwargs.get("fp_bid", None):
        fp_bid = kwargs["fp_bid"]
        body = get(f"entities/{fp_bid}", None, *sandbox_tenant.db_auths)
        assert body["has_outstanding_workflow_request"]

    # Re-generate a link as is done from the dashboard
    data = dict(kind="inherit")
    body = post(f"entities/{fp_id}/token", data, *sandbox_tenant.db_auths)
    assert body["link"]
    auth_token = FpAuth(body["token"])

    return auth_token


def complete_redo_flow_user(user, auth_token, pre_run=None):
    fp_id = user.fp_id
    obc = user.client.ob_config
    sandbox_id = user.client.sandbox_id
    return complete_redo_flow(auth_token, fp_id, obc, sandbox_id, pre_run)


def complete_redo_flow(auth_token, fp_id, obc, sandbox_id, pre_run=None):
    tenant = obc.tenant
    timeline = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    obds = [i for i in timeline["data"] if i["event"]["kind"] == "onboarding_decision"]
    initial_num_obds = len(obds)

    # Re-run Bifrost with the token, optionally with any pre_run assertion checks
    stepped_up_auth_token = IdentifyClient.from_token(auth_token).login()
    bifrost = BifrostClient.raw_auth(obc, stepped_up_auth_token, sandbox_id)
    if pre_run:
        pre_run(bifrost)
    user = bifrost.run()

    # Shouldn't be able to re-use the link
    body = get("hosted/onboarding/config", None, auth_token, status_code=400)
    assert body["message"] == "This link has already been used."
    assert body["code"] == "E125"

    # User shouldn't be marked as "info requested" anymore
    body = get(f"entities/{fp_id}", None, *tenant.db_auths)
    assert not body["has_outstanding_workflow_request"]

    # Verify the timeline events are updated
    body = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body["data"] if i["event"]["kind"] == "workflow_triggered"
    )
    assert not trigger_event["data"]["request_is_active"]
    obds = [i for i in body["data"] if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == initial_num_obds + 1
    return user


def test_onboard_non_portable_document(sandbox_tenant, doc_first_obc):
    obc = doc_first_obc
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    # Trigger redo
    trigger = dict(kind="onboard", data=dict(playbook_id=obc.id))
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger)

    # Make sure the proper ob config is associated with the token
    body = get("hosted/onboarding/config", None, initial_auth_token)
    assert body["name"] == obc.name
    assert body["key"] == obc.key.value

    # Re-run bifrost with the token
    def pre_run(bifrost):
        # Check that requirements are what we expect
        requirements = bifrost.get_status()["all_requirements"]
        assert requirements[0]["kind"] == "liveness"
        assert not requirements[0]["is_met"]
        assert requirements[1]["kind"] == "collect_document"
        assert not requirements[1]["is_met"]
        assert requirements[2]["kind"] == "collect_data"
        assert requirements[2]["is_met"]

        # Edit some data and finish the onboarding
        data = {"id.ssn9": "888-88-8888"}
        patch("/hosted/user/vault", data, bifrost.auth_token)

    complete_redo_flow(initial_auth_token, fp_id, obc, sandbox_id, pre_run)

    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    docs = [i for i in body["data"] if i["event"]["kind"] == "document_uploaded"]
    assert len(docs) == 1

    users_docs = get(f"users/{fp_id}/documents", None, sandbox_tenant.sk.key)
    assert len(users_docs) == 1
    assert all(map(lambda x: x["document_type"] == "drivers_license", users_docs))


def test_retrigger_onboard(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()
    fp_id = user.fp_id

    # Trigger onboarding
    data = dict(kind="onboard", data=dict(playbook_id=obc.id))
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, data, note="Pls fix")

    # Make sure the proper ob config is associated with the token and WFR is serialized
    body = get("hosted/onboarding/config", None, initial_auth_token)
    assert body["name"] == obc.name
    assert body["key"] == obc.key.value
    wfr = body["workflow_request"]
    assert wfr["note"] == "Pls fix"
    assert wfr["config"]["kind"] == "onboard"
    assert wfr["config"]["data"]["playbook_id"] == obc.id

    # Re-run Bifrost with the token, optionally with any pre_run assertion checks
    auth_token = IdentifyClient.from_token(initial_auth_token).login()
    bifrost = BifrostClient.raw_auth(obc, auth_token, bifrost.sandbox_id)
    requirements = bifrost.get_status()["all_requirements"]
    assert requirements[0]["kind"] == "collect_data"
    assert requirements[0]["is_met"]
    bifrost.run()

    # Verify we made a new timeline event
    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    trigger_event = next(
        i["event"] for i in body["data"] if i["event"]["kind"] == "workflow_triggered"
    )
    assert not trigger_event["data"]["request_is_active"]
    assert trigger_event["data"]["config"]["data"]["playbook_id"] == obc.id
    obds = [i for i in body["data"] if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2
    obd = obds[0]
    assert obd["event"]["data"]["decision"]["ob_configuration"]["id"] == obc.id


def test_retrigger_kyb(sandbox_tenant, kyb_sandbox_ob_config):
    obc = kyb_sandbox_ob_config
    bifrost = BifrostClient.new_user(obc)
    first_user = bifrost.run()

    # Trigger onboarding
    data = dict(kind="onboard", data=dict(playbook_id=obc.id))
    initial_auth_token = send_trigger(first_user.fp_id, sandbox_tenant, data)

    # Make sure the proper ob config is associated with the token
    body = get("hosted/onboarding/config", None, initial_auth_token)
    assert body["name"] == obc.name
    assert body["key"] == obc.key.value

    # Re-run Bifrost with the token, optionally with any pre_run assertion checks
    auth_token = IdentifyClient.from_token(initial_auth_token).login()
    bifrost = BifrostClient.raw_auth(obc, auth_token, bifrost.sandbox_id)
    requirements = bifrost.get_status()["all_requirements"]
    assert requirements[0]["kind"] == "collect_business_data"
    assert not requirements[0]["is_met"]
    assert requirements[1]["kind"] == "collect_data"
    assert requirements[1]["is_met"]
    second_user = bifrost.run()

    # For now, we don't allow reonboarding a business, so we should make a second business
    assert first_user.fp_bid != second_user.fp_bid


@pytest.mark.parametrize(
    "document_configs,expected_docs",
    [
        (
            [dict(kind="identity", data=dict(collect_selfie=False))],
            ["drivers_license"],
        ),
        (
            [
                dict(kind="identity", data=dict(collect_selfie=False)),
                dict(kind="proof_of_ssn", data=dict()),
            ],
            ["drivers_license", "ssn_card"],
        ),
        (
            [dict(kind="proof_of_address", data=dict())],
            ["proof_of_address"],
        ),
        (
            [
                dict(
                    kind="custom",
                    data=dict(
                        name="My special doc",
                        identifier="document.custom.my_special_doc",
                    ),
                )
            ],
            ["custom"],
        ),
    ],
)
def test_collect_document(document_configs, sandbox_tenant, expected_docs):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()

    status = bifrost.validate_response["user"]["status"]
    fp_id = sandbox_user.fp_id

    # Trigger recollect document
    trigger = dict(
        kind="document",
        data=dict(configs=document_configs),
    )
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger)

    # re-run Bifrost with the token from the link we sent to user
    def pre_run(bifrost):
        # Check that requirements are what we expect
        requirements = bifrost.get_status()["all_requirements"]
        assert any(i["kind"] == "collect_document" for i in requirements)
        assert set(
            i["config"]["kind"] for i in requirements if i["kind"] == "collect_document"
        ) == set(i["kind"] for i in document_configs)
        assert all(
            not i["is_met"] for i in requirements if i["kind"] == "collect_document"
        )

    complete_redo_flow_user(sandbox_user, initial_auth_token, pre_run)

    # Test tenant-facing API
    body = get(f"users/{fp_id}/documents", None, sandbox_tenant.sk.key)
    assert set(i["document_type"] for i in body) == set(expected_docs)

    # And dashboard-facing API
    body = get(f"entities/{fp_id}/documents", None, *sandbox_tenant.db_auths)
    assert set(i["kind"] for i in body) == set(expected_docs)
    assert all(i["review_status"] == "pending_human_review" for i in body)

    body = get(f"entities/{sandbox_user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == status, "Status shouldn't have changed from doc"
    # All adhoc document triggers should put the user into manual review since there are no rules to execute
    assert body["requires_manual_review"]
    assert body["manual_review_kinds"] == ["document_needs_review"]


@pytest.mark.flaky
def test_collect_document_no_onboardings(sandbox_tenant):
    """
    Cover our horrid codepath that attaches a random playbook to WFRs for an ad-hoc document for users
    who have never onboarded onto a playbook.
    This test is inherently flaky because we choose a random playbook from the tenant - another test could
    be deactivating that playbook
    """
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    # Trigger recollect document
    document_configs = [dict(kind="identity", data=dict(collect_selfie=False))]
    trigger = dict(
        kind="document",
        data=dict(configs=document_configs),
    )
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger)

    # re-run Bifrost with the token from the link we sent to user
    auth_token = IdentifyClient.from_token(initial_auth_token).login()
    # OBC here isn't actually correct
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )

    # Check that requirements are what we expect
    requirements = bifrost.get_status()["all_requirements"]
    assert any(i["kind"] == "collect_document" for i in requirements)
    assert set(
        i["config"]["kind"] for i in requirements if i["kind"] == "collect_document"
    ) == set(i["kind"] for i in document_configs)
    assert all(not i["is_met"] for i in requirements if i["kind"] == "collect_document")

    bifrost.handle_all_requirements()
    bifrost.validate()


def test_collect_document_does_not_require_business(
    sandbox_tenant, kyb_sandbox_ob_config
):
    """
    Verify that document workflows that don't collect business docs _don't_ require business selection.
    """
    # Onboard the user onto a KYB playbook.
    document_configs = [dict(kind="proof_of_address", data=dict())]
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    assert user.fp_bid

    # Trigger recollect document. The document workflow here will be linked to a KYB playbook
    trigger = dict(kind="document", data=dict(configs=document_configs))
    initial_auth_token = send_trigger(user.fp_id, sandbox_tenant, trigger)

    # Should not require business selection
    user = complete_redo_flow_user(user, initial_auth_token)
    assert not any(
        i["kind"] == "create_business_onboarding"
        for i in user.client.handled_requirements
    )


def test_collect_business_document(sandbox_tenant, kyb_sandbox_ob_config):
    document_configs = [
        dict(
            kind="custom",
            data=dict(
                name="My special business doc",
                identifier="document.custom.my_special_business_doc",
            ),
        )
    ]

    expected_docs = ["custom"]
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    sandbox_user = bifrost.run()

    status = bifrost.validate_response["user"]["status"]
    fp_id = sandbox_user.fp_id
    fp_bid = sandbox_user.fp_bid

    # Trigger recollect document
    trigger = dict(
        kind="document",
        data=dict(
            configs=[],
            business_configs=document_configs,
        ),
    )
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger, fp_bid=fp_bid)

    # re-run Bifrost with the token from the link we sent to user
    def pre_run(bifrost):
        # Check that requirements are what we expect
        requirements = bifrost.get_status()["all_requirements"]
        assert any(i["kind"] == "collect_document" for i in requirements)
        assert set(
            i["config"]["kind"] for i in requirements if i["kind"] == "collect_document"
        ) == set(i["kind"] for i in document_configs)
        assert all(
            not i["is_met"] for i in requirements if i["kind"] == "collect_document"
        )

    complete_redo_flow_user(sandbox_user, initial_auth_token, pre_run)

    # Test tenant-facing API
    body = get(f"users/{fp_bid}/documents", None, sandbox_tenant.sk.key)
    assert set(i["document_type"] for i in body) == set(expected_docs)

    # And dashboard-facing API
    body = get(f"entities/{fp_bid}/documents", None, *sandbox_tenant.db_auths)
    assert set(i["kind"] for i in body) == set(expected_docs)
    assert all(i["review_status"] == "pending_human_review" for i in body)

    body = get(f"entities/{fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == status, "Status shouldn't have changed from doc"

    # All adhoc document triggers should put the business into manual review since there are no rules to execute
    assert body["requires_manual_review"]
    assert body["manual_review_kinds"] == ["document_needs_review"]


def test_collect_business_documents_no_onboarding(sandbox_tenant):
    document_configs = [
        dict(
            kind="custom",
            data=dict(
                name="My special business doc",
                identifier="document.custom.my_special_business_doc",
            ),
        )
    ]

    expected_docs = ["custom"]

    # create a business via API
    data = {
        "business.name": "Footprint",
        "business.dba": "Printfoot",
        "business.tin": "123121234",
        "business.zip": "12345",
    }
    fp_bid = post("businesses/", None, sandbox_tenant.sk.key)["id"]
    patch(f"businesses/{fp_bid}/vault", data, sandbox_tenant.sk.key)
    # link BO via API
    data = {
        "id.first_name": "Piip",
        "id.last_name": "Businessowner",
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    body = post("users", data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]
    data = dict(fp_id=fp_id, ownership_stake=100)
    post(f"businesses/{fp_bid}/owners", data, sandbox_tenant.sk.key)

    # Trigger recollect document
    trigger = dict(
        kind="document",
        data=dict(
            configs=[],
            business_configs=document_configs,
        ),
    )
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger, fp_bid=fp_bid)

    # re-run Bifrost with the token from the link we sent to user
    auth_token = IdentifyClient.from_token(initial_auth_token).login()
    # OBC here isn't actually correct
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )

    # Check that requirements are what we expect
    requirements = bifrost.get_status()["all_requirements"]
    assert any(i["kind"] == "collect_document" for i in requirements)
    assert set(
        i["config"]["kind"] for i in requirements if i["kind"] == "collect_document"
    ) == set(i["kind"] for i in document_configs)
    assert all(not i["is_met"] for i in requirements if i["kind"] == "collect_document")

    bifrost.handle_all_requirements()
    bifrost.validate()

    # Test tenant-facing API
    body = get(f"users/{fp_bid}/documents", None, sandbox_tenant.sk.key)
    assert set(i["document_type"] for i in body) == set(expected_docs)

    # And dashboard-facing API
    body = get(f"entities/{fp_bid}/documents", None, *sandbox_tenant.db_auths)
    assert set(i["kind"] for i in body) == set(expected_docs)
    assert all(i["review_status"] == "pending_human_review" for i in body)

    body = get(f"entities/{fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "none", "Status shouldn't have changed from doc"

    # All adhoc document triggers should put the business into manual review since there are no rules to execute
    assert body["requires_manual_review"]
    assert body["manual_review_kinds"] == ["document_needs_review"]


@pytest.mark.parametrize(
    "trigger",
    [
        dict(
            kind="document",
            data=dict(configs=[dict(kind="identity", data=dict(collect_selfie=False))]),
        ),
        dict(
            kind="document",
            data=dict(configs=[dict(kind="proof_of_ssn", data=dict())]),
        ),
        dict(
            kind="document",
            data=dict(configs=[dict(kind="proof_of_address", data=dict())]),
        ),
    ],
)
def test_trigger_incomplete(sandbox_tenant, trigger):
    """
    Ensure we can initiate a trigger for a user that has only an incomplete workflow.
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_id = bifrost.sandbox_id

    # Don't finish onboarding, but get the fp_id
    fp_id = get("hosted/user/private/token", None, bifrost.auth_token)["fp_id"]

    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger)
    auth_token = IdentifyClient.from_token(initial_auth_token).login()

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )
    bifrost.run()


def test_cant_make_multiple_wfs(sandbox_tenant):
    """
    Ensure we cannot reonboard multiple times using the link sent to the user
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()

    # Trigger redo KYC
    trigger = dict(
        kind="onboard", data=dict(playbook_id=sandbox_tenant.default_ob_config.id)
    )
    initial_auth_token = send_trigger(sandbox_user.fp_id, sandbox_tenant, trigger)

    # And then re-run bifrost using the redo KYC link
    complete_redo_flow_user(sandbox_user, initial_auth_token)

    # Make sure the token can't be used to make another Workflow by re-logging in with the same token.
    # Shouldn't include a met collect_data requirement because we inherited the completed Workflow.
    auth_token = IdentifyClient.from_token(initial_auth_token).login()
    post("hosted/onboarding", None, auth_token)
    body = get("hosted/onboarding/status", None, auth_token)
    assert not any(i["kind"] == "collect_data" for i in body["all_requirements"])


def test_complete_trigger_w_user_specific_token(sandbox_tenant):
    """
    Use a user-specific token to finish the redo flow. This should inherit the outstanding
    WorkflowRequest
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()

    # Trigger redo KYC
    trigger = dict(
        kind="onboard", data=dict(playbook_id=sandbox_tenant.default_ob_config.id)
    )
    send_trigger(sandbox_user.fp_id, sandbox_tenant, trigger)

    # Generate an auth token for this user without a playbook key and complete redo flow using this
    # auth token. This auth token should automatically inherit the outstanding workflow request
    # because there was no obc provided
    data = dict(kind="inherit")
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])
    complete_redo_flow_user(sandbox_user, auth_token)


def test_reonboard_kyb(sandbox_tenant, kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    sandbox_user = bifrost.run()

    # Trigger onboarding onto KYB playbook, recollecting BOs
    recollect_attributes = ["business_kyced_beneficial_owners"]
    trigger = dict(
        kind="onboard",
        data=dict(
            recollect_attributes=recollect_attributes,
            playbook_id=kyb_sandbox_ob_config.id,
            reuse_existing_bo_kyc=True,
        ),
    )
    fp_id = sandbox_user.fp_id
    fp_bid = sandbox_user.fp_bid
    initial_auth_token = send_trigger(fp_id, sandbox_tenant, trigger, fp_bid=fp_bid)

    def pre_run(bifrost):
        # Check that recollect_attributes are propagated through
        collect_biz_data = bifrost.get_requirement("collect_business_data", is_met=True)
        assert collect_biz_data["recollect_attributes"] == recollect_attributes
        collect_data = bifrost.get_requirement("collect_data", is_met=True)
        assert not collect_data["recollect_attributes"]

    complete_redo_flow_user(sandbox_user, initial_auth_token, pre_run)

    body = get(f"entities/{fp_bid}", None, *sandbox_tenant.db_auths)
    assert not body["has_outstanding_workflow_request"]


def test_reonboard_kyb_multi_kyc(kyb_sandbox_ob_config, sandbox_tenant):
    """
    When asking a business with multiple BOs to redo KYB, the secondary BO should also have to redo KYB.
    """
    primary_bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    primary_bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = primary_bifrost.run()

    secondary_bo_token = extract_bo_token(primary_bo)
    secondary_bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = secondary_bifrost.run()

    return
    # Issue and complete the trigger for the primary BO
    trigger = dict(
        kind="onboard",
        data=dict(playbook_id=primary_bifrost.ob_config.id),
    )
    initial_auth_token = send_trigger(
        primary_bo.fp_id, sandbox_tenant, trigger, fp_bid=primary_bo.fp_bid
    )

    user = complete_redo_flow_user(primary_bo, initial_auth_token)
    assert bifrost.validate_response["business"]["status"] == "incomplete"
    assert any(r["kind"] == "collect_data" for r in bifrost.already_met_requirements)

    # TODO: eventually we should do all of this too, but there's a bug where we inherit the secondary BO's
    # last KYC workflow instead of making a new one in `POST /hosted/onboarding`.
    # We will need to pass force_create through the BO token, but don't want to force create biz wf?
    # Complete the secondary BO form sent out
    secondary_bo_token = extract_bo_token(user)
    secondary_bifrost2 = BifrostClient.login_user(
        kyb_sandbox_ob_config,
        sandbox_id=secondary_bifrost.sandbox_id,
        override_ob_config_auth=secondary_bo_token,
    )
    secondary_bo2 = secondary_bifrost2.run()
    assert any(
        r["kind"] == "collect_data" for r in secondary_bifrost2.already_met_requirements
    )
    assert secondary_bo2.fp_id == secondary_bo.fp_id
    assert secondary_bo2.fp_bid == secondary_bo.fp_bid
    assert secondary_bifrost2.validate_response["business"]["status"] == "pass"

    # Everyone should have two workflows
    body = get(f"users/{primary_bo.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 2
    body = get(f"businesses/{primary_bo.fp_bid}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 2
    body = get(f"users/{secondary_bo.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 2


def test_reonboard_kyb_multi_kyc_reuse_kyc(kyb_sandbox_ob_config, sandbox_tenant):
    """
    Test when we make a trigger to reonbard a business that we can reuse the existing BOs' KYC results from
    a previous workflow
    """
    primary_bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    primary_bifrost.data.update(BUSINESS_SECONDARY_BOS)
    primary_bo = primary_bifrost.run()

    secondary_bo_token = extract_bo_token(primary_bo)
    secondary_bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    secondary_bo = secondary_bifrost.run()

    trigger = dict(
        kind="onboard",
        data=dict(playbook_id=primary_bifrost.ob_config.id, reuse_existing_bo_kyc=True),
    )
    initial_auth_token = send_trigger(
        primary_bo.fp_id, sandbox_tenant, trigger, fp_bid=primary_bo.fp_bid
    )

    user = complete_redo_flow_user(primary_bo, initial_auth_token)
    assert any(
        r["kind"] == "collect_data" for r in user.client.already_met_requirements
    )

    # Business should be terminal, even though the second BO didn't redo KYC
    assert user.client.validate_response["business"]["status"] == "pass"

    tests = [
        # Primary BO and business should have two workflows
        (primary_bo.fp_id, 2),
        (primary_bo.fp_bid, 2),
        # But secondary BO shouldn't have had to reonboard
        (secondary_bo.fp_id, 1),
    ]
    for fp_id, expected_num_onboardings in tests:
        body = get(f"users/{fp_id}/onboardings", None, sandbox_tenant.s_sk)
        assert len(body["data"]) == expected_num_onboardings


def test_request_additional_bos(kyb_sandbox_ob_config, sandbox_tenant):
    # Make a user with two businesses
    bifrost1 = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost1.data.update(BUSINESS_SECONDARY_BOS)
    bo1 = bifrost1.run()

    secondary_bo_token = extract_bo_token(bo1)
    bifrost2 = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=secondary_bo_token
    )
    bo2 = bifrost2.run()

    # Then request the business to add additional BOs
    trigger = dict(
        kind="onboard",
        data=dict(
            playbook_id=bifrost1.ob_config.id,
            reuse_existing_bo_kyc=True,
            recollect_attributes=["business_kyced_beneficial_owners"],
        ),
    )
    initial_auth_token = send_trigger(
        bo1.fp_id, sandbox_tenant, trigger, fp_bid=bo1.fp_bid
    )

    def pre_run(bifrost):
        # Add a third BO
        data = {**BUSINESS_SECONDARY_BOS["business.secondary_beneficial_owners"][0]}
        data.pop("ownership_stake")
        op = dict(op="create", uuid=str(uuid4()), ownership_stake=10, data=data)
        patch("/hosted/business/owners", [op], bifrost.auth_token)

    user = complete_redo_flow_user(bo1, initial_auth_token, pre_run)
    # Business should be incomplete while we wait for the new BO to complete KYC
    assert user.client.validate_response["business"]["status"] == "incomplete"

    # Complete the third BO's KYC
    bo_token = extract_bo_token(user)
    bifrost3 = BifrostClient.new_user(
        kyb_sandbox_ob_config, override_ob_config_auth=bo_token
    )
    bo3 = bifrost3.run()
    assert bifrost3.validate_response["business"]["status"] == "pass"
    assert bifrost3.validate_response["user"]["status"] == "pass"
    assert bo3.fp_bid == bo1.fp_bid

    tests = [
        # Primary BO and business should have two workflows
        (bo1.fp_id, 2),
        (bo1.fp_bid, 2),
        # But secondary BO shouldn't have had to reonboard
        (bo2.fp_id, 1),
        # Third BO should have one onboarding
        (bo3.fp_id, 1),
    ]
    for fp_id, expected_num_onboardings in tests:
        body = get(f"users/{fp_id}/onboardings", None, sandbox_tenant.s_sk)
        assert len(body["data"]) == expected_num_onboardings


def test_kyb_validation(kyb_sandbox_ob_config, sandbox_tenant):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()

    # Issue and complete the trigger for the primary BO
    tests = [
        (
            dict(
                playbook_id=sandbox_tenant.default_ob_config.id,
                reuse_existing_bo_kyc=True,
            ),
            None,
            "reuse_existing_bo_kyc can only be used with KYB playbooks",
        ),
        (
            dict(playbook_id=sandbox_tenant.default_ob_config.id),
            user.fp_bid,
            "Must provide a KYB playbook when providing fp_bid",
        ),
        # Just temporary until we support this flow
        # https://github.com/onefootprint/monorepo/pull/13002/files/340a0937c3972bee4ff6a1b5df688ea7e6f70c53#r1811050884
        (
            dict(playbook_id=kyb_sandbox_ob_config.id, reuse_existing_bo_kyc=False),
            user.fp_bid,
            "Must provide reuse_existing_bo_kyc for KYB flows",
        ),
    ]
    for trigger_data, fp_bid, err in tests:
        trigger = dict(kind="onboard", data=trigger_data)
        action = dict(trigger=trigger, kind="trigger", fp_bid=fp_bid)
        data = dict(actions=[action])
        body = post(
            f"entities/{user.fp_id}/actions",
            data,
            *sandbox_tenant.db_auths,
            status_code=400,
        )
        assert body["message"] == err
