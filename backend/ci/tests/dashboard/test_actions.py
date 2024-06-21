from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import post, get
from tests.headers import FpAuth


def test_trigger_action(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    trigger_action = dict(kind="trigger", trigger=dict(kind="redo_kyc"), note="Flerp")
    data = dict(actions=[trigger_action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    trigger_response = next(i for i in body if i["kind"] == "trigger")
    auth_token = FpAuth(trigger_response["token"])

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, bifrost.sandbox_id
    )
    bifrost.run()


def test_manual_decision_action(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "pass"

    md_action = dict(
        kind="manual_decision",
        status="fail",
        annotation=dict(note="Flerp", is_pinned=False),
    )
    data = dict(actions=[md_action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert body["status"] == "fail"


def test_clear_review(sandbox_tenant):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="manual_review"
    )
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "fail"
    assert user.client.validate_response["user"]["requires_manual_review"]

    body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert body["data"][0]["status"] == "fail"

    clear_review_action = dict(kind="clear_review")
    data = dict(actions=[clear_review_action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert not body["requires_manual_review"]

    # Make sure the onboarding status hasn't changed
    body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert body["data"][0]["status"] == "fail"


def test_trigger_and_clear_review(sandbox_tenant):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="manual_review"
    )
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "fail"
    assert user.client.validate_response["user"]["requires_manual_review"]

    trigger_action = dict(kind="trigger", trigger=dict(kind="redo_kyc"), note="Flerp")
    clear_review_action = dict(kind="clear_review")
    data = dict(actions=[trigger_action, clear_review_action])
    body = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)

    # Make sure we got a token from the trigger
    trigger_response = next(i for i in body if i["kind"] == "trigger")
    assert trigger_response["token"]

    # Make sure manual review is cleared
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert not body["requires_manual_review"]
