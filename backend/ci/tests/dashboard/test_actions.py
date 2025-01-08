import pytest
from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import post, get, try_until_success
from tests.headers import FpAuth
from tests.dashboard.utils import (
    assert_has_audit_event_with_details,
)


# TODO also test business
def test_trigger_action(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    trigger = dict(
        kind="onboard", data=dict(playbook_id=sandbox_tenant.default_ob_config.id)
    )
    trigger_action = dict(kind="trigger", trigger=trigger, note="Flerp")
    data = dict(actions=[trigger_action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    trigger_response = next(i for i in body if i["kind"] == "trigger")
    auth_token = FpAuth(trigger_response["token"])

    auth_token = IdentifyClient.from_token(auth_token).login()
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, bifrost.sandbox_id
    )
    bifrost.run()


def test_cannot_trigger_action_business(sandbox_tenant, kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    trigger = dict(kind="onboard", data=dict(playbook_id=kyb_sandbox_ob_config.id))
    trigger_action = dict(kind="trigger", trigger=trigger, note="Flerp")
    data = dict(actions=[trigger_action])
    fp_bid = user.fp_bid
    body = post(
        f"entities/{fp_bid}/actions", data, *sandbox_tenant.db_auths, status_code=400
    )
    assert body["message"] == "Must be a person vault"


def test_manual_decision_action(sandbox_tenant, kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "pass"
    assert user.client.validate_response["business"]["status"] == "pass"

    # Test manual review for user
    md_action = dict(
        kind="manual_decision",
        status="fail",
        annotation=dict(note="User manual review", is_pinned=False),
    )
    data = dict(actions=[md_action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert body["status"] == "fail"

    assert_has_audit_event_with_details(
        sandbox_tenant,
        "manually_review_entity",
        fp_id=user.fp_id,
        kind="person",
        decision_status="fail",
    )

    # Test manual review for business
    md_action = dict(
        kind="manual_decision",
        status="fail",
        annotation=dict(note="Business manual review", is_pinned=False),
    )
    data = dict(actions=[md_action])
    post(f"entities/{user.fp_bid}/actions", data, *sandbox_tenant.db_auths)
    body = get(f"entities/{user.fp_bid}", data, *sandbox_tenant.db_auths)
    assert body["status"] == "fail"

    assert_has_audit_event_with_details(
        sandbox_tenant,
        "manually_review_entity",
        fp_id=user.fp_bid,
        kind="business",
        decision_status="fail",
    )


def test_clear_review(sandbox_tenant, kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(
        kyb_sandbox_ob_config, fixture_result="manual_review"
    )
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "fail"
    assert user.client.validate_response["user"]["requires_manual_review"]
    assert user.client.validate_response["business"]["status"] == "fail"
    assert user.client.validate_response["business"]["requires_manual_review"]

    for fp_id in [user.fp_id, user.fp_bid]:
        body = get(f"users/{fp_id}/onboardings", None, sandbox_tenant.s_sk)
        assert body["data"][0]["status"] == "fail"

        clear_review_action = dict(kind="clear_review")
        data = dict(actions=[clear_review_action])
        post(f"entities/{fp_id}/actions", data, *sandbox_tenant.db_auths)
        body = get(f"entities/{fp_id}", data, *sandbox_tenant.db_auths)
        assert not body["requires_manual_review"]

        # Make sure the onboarding status hasn't changed
        body = get(f"users/{fp_id}/onboardings", None, sandbox_tenant.s_sk)
        assert body["data"][0]["status"] == "fail"


def test_trigger_and_clear_review(sandbox_tenant):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="manual_review"
    )
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "fail"
    assert user.client.validate_response["user"]["requires_manual_review"]

    trigger = dict(
        kind="onboard", data=dict(playbook_id=sandbox_tenant.default_ob_config.id)
    )
    trigger_action = dict(kind="trigger", trigger=trigger, note="Flerp")
    clear_review_action = dict(kind="clear_review")
    data = dict(actions=[trigger_action, clear_review_action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)

    # Make sure we got a token from the trigger
    trigger_response = next(i for i in body if i["kind"] == "trigger")
    assert trigger_response["token"]

    # Make sure manual review is cleared
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert not body["requires_manual_review"]


@pytest.mark.flaky
def test_adhoc_vendor_call(sandbox_tenant):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="pass"
    )
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 1
    bifrost_ob = body["data"][0]
    assert bifrost_ob["status"] == "pass"
    bifrost_ob_timestamp = bifrost_ob["timestamp"]

    # Make an adhoc vendor call action req
    action = dict(verification_checks=[dict(kind="sentilink", data=dict())])
    adhoc_vendor_call_action = dict(kind="adhoc_vendor_call", config=action)
    data = dict(actions=[adhoc_vendor_call_action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)

    assert len(body) == 0

    # Check OBs
    def check_adhoc_vendor_call_results(user, sandbox_tenant, bifrost_ob_timestamp):
        body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
        assert len(body["data"]) == 2
        adhoc_ob = body["data"][0]
        assert adhoc_ob["status"] == "none"
        assert adhoc_ob["kind"] == "adhoc_vendor_call"
        assert len(adhoc_ob["rule_set_results"]) == 0
        
        # Check we wrote risk signals
        risk_signals = get(
            f"entities/{user.fp_id}/onboardings/{adhoc_ob['id']}/risk_signals",
            None,
            *sandbox_tenant.db_auths,
        )
        assert all(["sentilink" in rs["reason_code"] for rs in risk_signals])

        # Also assert that the onboarding isn't visible from the tenant facing API
        body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
        assert len(body["data"]) == 1
        assert body["data"][0]["timestamp"] == bifrost_ob_timestamp

    try_until_success(lambda: check_adhoc_vendor_call_results(user, sandbox_tenant, bifrost_ob_timestamp), 60, retry_interval_s=0.1)



