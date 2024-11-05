from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import get, post, create_ob_config
from tests.headers import FpAuth


def bifrost_client_for(user, sandbox_tenant, obc, **kwargs):
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    token = FpAuth(body["token"])
    token = IdentifyClient.from_token(token).login()
    return BifrostClient.raw_auth(obc, token, user.client.sandbox_id, **kwargs)


def test_onboardings(sandbox_tenant, must_collect_data):
    # Onboard onto a playbook as a fail
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="fail"
    )
    user = bifrost.run()

    # Start reonboarding the user onto the same playbook
    bifrost = bifrost_client_for(user, sandbox_tenant, sandbox_tenant.default_ob_config)

    # Fetch the onboardings. Should contain an incomplete onboarding first
    body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 2
    assert body["data"][0]["status"] == "incomplete"
    assert body["data"][0]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][0]["seqno"] is None
    assert body["data"][1]["status"] == "fail"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][1]["seqno"] is not None

    # Finish onboarding onto the playbook. Both onboardings should have failed
    user = bifrost.run()
    body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 2
    assert body["data"][0]["status"] == "pass"
    assert body["data"][0]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][0]["seqno"] is not None
    assert body["data"][1]["status"] == "fail"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][1]["seqno"] is not None

    # Onboard onto a completely different playbook
    obc = create_ob_config(sandbox_tenant, "Second playbook", must_collect_data)
    bifrost = bifrost_client_for(
        user, sandbox_tenant, obc, fixture_result="use_rules_outcome"
    )
    user = bifrost.run()

    # Should now have another onboarding, and rule set results will not be present in sandbox
    user = bifrost.run()
    body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 3
    assert body["data"][0]["status"] == "pass"
    assert body["data"][0]["playbook_key"] == obc.key.value
    assert body["data"][0]["seqno"] is not None
    # assert len(body["data"][0]["rule_set_results"]) == 1
    assert body["data"][1]["status"] == "pass"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][1]["seqno"] is not None
    # assert len(body["data"][1]["rule_set_results"]) == 1
    assert body["data"][2]["status"] == "fail"
    assert body["data"][2]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][2]["seqno"] is not None
    # assert len(body["data"][2]["rule_set_results"]) == 1


def test_business_onboardings(sandbox_tenant, kyb_sandbox_ob_config):
    # First onboard the user onto a KYC playbook
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    bifrost.run()

    # And then onboard the user and make a business while onboarding onto KYB playbook
    bifrost = BifrostClient.login_user(kyb_sandbox_ob_config, bifrost.sandbox_id)
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 2
    assert body["data"][0]["playbook_key"] == kyb_sandbox_ob_config.key.value
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    body = get(f"entities/{user.fp_bid}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 1
    assert body["data"][0]["playbook_key"] == kyb_sandbox_ob_config.key.value
