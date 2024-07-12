from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import get, post, create_ob_config
from tests.headers import FpAuth


def bifrost_client_for(user, sandbox_tenant, obc, **kwargs):
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    token = FpAuth(body["token"])
    token = IdentifyClient.from_token(token).inherit()
    return BifrostClient.raw_auth(obc, token, user.client.sandbox_id, **kwargs)


def test_decisions(sandbox_tenant, must_collect_data):
    # Onboard onto a playbook as a fail - should show up
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result="fail"
    )
    user = bifrost.run()

    # Start reonboarding the user onto the same playbook and abandon. Shouldn't have the incomplete workflow
    bifrost = bifrost_client_for(user, sandbox_tenant, sandbox_tenant.default_ob_config)

    # Make a manual review decision - should show up
    data = dict(annotation="My manual decision", status="pass")
    body = post(f"users/{user.fp_id}/decisions", data, sandbox_tenant.s_sk)

    # Onboard onto a completely different playbook - should show up
    obc2 = create_ob_config(sandbox_tenant, "Second playbook", must_collect_data)
    bifrost = bifrost_client_for(user, sandbox_tenant, obc2)
    user = bifrost.run()

    # Complete a document workflow - should not show up
    trigger = dict(
        kind="document",
        data=dict(configs=[dict(kind="proof_of_address", data=dict())]),
    )
    action = dict(trigger=trigger, kind="trigger")
    data = dict(actions=[action])
    res = post(f"entities/{user.fp_id}/actions", data, *sandbox_tenant.db_auths)
    auth_token = FpAuth(res[0]["token"])
    auth_token = IdentifyClient.from_token(auth_token).inherit()
    bifrost = BifrostClient.raw_auth(obc2, auth_token, user.client.sandbox_id)
    bifrost.run()

    # Onboard onto a document playbook - should show up
    doc_obc = create_ob_config(
        sandbox_tenant,
        "Doc",
        [],
        documents_to_collect=[dict(kind="proof_of_ssn", data=dict())],
        kind="document",
        skip_kyc=True,
        skip_confirm=True,
    )
    bifrost = bifrost_client_for(
        user, sandbox_tenant, doc_obc, fixture_result="use_rules_outcome"
    )
    user = bifrost.run()

    #
    # Finally, check all the decisions
    #
    body = get(f"users/{user.fp_id}/decisions", None, sandbox_tenant.s_sk)
    print(body)
    decisions = body["data"]
    assert len(decisions) == 4
    # Doc playbook decision
    assert decisions[0]["kind"] == "playbook_run"
    assert decisions[0]["playbook_key"] == doc_obc.key.value
    assert decisions[0]["status"] == "none"
    # Obc 2 decision
    assert decisions[1]["kind"] == "playbook_run"
    assert decisions[1]["playbook_key"] == obc2.key.value
    assert decisions[1]["status"] == "pass"
    # Manual decision
    assert decisions[2]["kind"] == "manual"
    assert decisions[2]["playbook_key"] is None
    assert decisions[2]["status"] == "pass"
    # Original onboarding
    assert decisions[3]["kind"] == "playbook_run"
    assert decisions[3]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert decisions[3]["status"] == "fail"


def test_business_decisions(sandbox_tenant, kyb_sandbox_ob_config):
    # First onboard the user onto a KYC playbook
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    bifrost.run()

    # And then onboard the user and make a business while onboarding onto KYB playbook
    bifrost = BifrostClient.inherit_user(kyb_sandbox_ob_config, bifrost.sandbox_id)
    user = bifrost.run()

    body = get(f"users/{user.fp_id}/decisions", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 2
    assert body["data"][0]["playbook_key"] == kyb_sandbox_ob_config.key.value
    assert body["data"][0]["kind"] == "playbook_run"
    assert body["data"][1]["playbook_key"] == sandbox_tenant.default_ob_config.key.value
    assert body["data"][1]["kind"] == "playbook_run"
    body = get(f"businesses/{user.fp_bid}/decisions", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 1
    assert body["data"][0]["playbook_key"] == kyb_sandbox_ob_config.key.value
    assert body["data"][0]["kind"] == "playbook_run"
