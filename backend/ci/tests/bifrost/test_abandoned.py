from tests.bifrost_client import BifrostClient


def test_abandoned(sandbox_tenant, twilio):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    # Don't run any requirements on purpose. Then, simulate re-authing with a new session into the
    # partially complete bifrost session
    phone_number = bifrost.data["id.phone_number"]
    sandbox_id = bifrost.sandbox_id
    bifrost = BifrostClient.inherit(
        sandbox_tenant.default_ob_config, twilio, phone_number, sandbox_id
    )
    bifrost.run()
    assert bifrost.validate_response["user"]["status"] == "pass"
