from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def test_onboarding_no_passkey(sandbox_tenant, must_collect_data):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    bifrost.run()
    assert "liveness" in [i["kind"] for i in bifrost.handled_requirements]

    # When prompt_for_passkey=False, we shouldn't ask the users for a passkey
    obc = create_ob_config(
        sandbox_tenant, "No passkey", must_collect_data, prompt_for_passkey=False
    )
    bifrost = BifrostClient.new_user(obc)
    bifrost.run()
    assert "liveness" not in [i["kind"] for i in bifrost.handled_requirements]
