from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import get, post, create_ob_config
from tests.headers import FpAuth


def bifrost_client_for(user, sandbox_tenant, obc):
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    token = FpAuth(body["token"])
    token = IdentifyClient.from_token(token).inherit()
    return BifrostClient.raw_auth(obc, token, user.client.sandbox_id)


def test_onboardings(sandbox_tenant, must_collect_data):
    # Onboard onto a playbook as a fail
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="fail"
    )
    user = bifrost.run()

    # Start reonboarding the user onto the same playbook
    bifrost = bifrost_client_for(user, sandbox_tenant, sandbox_tenant.default_ob_config)

    # Fetch the onboardings. Shouldn't have the incomplete onboarding
    body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 1
    assert body["data"][0]["status"] == "fail"
    assert body["data"][0]["playbook_key"] == sandbox_tenant.default_ob_config.key.value

    # Finish onboarding onto the playbook. The onboarding should now show up
    user = bifrost.run()
    body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 2
    assert body["data"][0]["status"] == "pass"
    assert body["data"][0]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][1]["status"] == "fail"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value

    # Onboard onto a completely different playbook
    obc = create_ob_config(sandbox_tenant, "Second playbook", must_collect_data)
    bifrost = bifrost_client_for(user, sandbox_tenant, obc)
    user = bifrost.run()

    # Should now have another onboarding
    user = bifrost.run()
    body = get(f"users/{user.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 3
    assert body["data"][0]["status"] == "pass"
    assert body["data"][0]["playbook_key"] == obc.key.value
    assert body["data"][1]["status"] == "pass"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][2]["status"] == "fail"
    assert body["data"][2]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
