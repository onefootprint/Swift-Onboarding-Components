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


def test_mr_action(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "pass"

    trigger_action = dict(
        kind="manual_decision",
        status="fail",
        annotation=dict(note="Flerp", is_pinned=False),
    )
    data = dict(actions=[trigger_action])
    post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    body = get(f"entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert body["status"] == "fail"
