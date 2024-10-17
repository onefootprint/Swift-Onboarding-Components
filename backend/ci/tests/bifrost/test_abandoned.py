from tests.bifrost_client import BifrostClient


def test_abandoned(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    # Don't run any requirements on purpose. Then, simulate re-authing with a new session into the
    # partially complete bifrost session
    sandbox_id = bifrost.sandbox_id
    bifrost = BifrostClient.login_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
