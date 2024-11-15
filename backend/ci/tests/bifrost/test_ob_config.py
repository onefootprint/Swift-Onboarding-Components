from tests.utils import get, post
from tests.headers import FpAuth


def test_get_org_config(sandbox_tenant, sandbox_user):
    obc = sandbox_tenant.default_ob_config
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.s_sk)
    user_token = FpAuth(body["token"])

    # Should be able to get the onboarding config with either the org key or the user token
    TESTS = [[obc.key], [user_token], [obc.key, user_token]]
    for auths in TESTS:
        ob_config = get("hosted/onboarding/config", None, *auths)
        assert ob_config["name"] == "Acme Bank Card"
        assert ob_config["org_name"] == sandbox_tenant.name


def test_get_org_config_no_key(sandbox_tenant, sandbox_user):
    data = dict(kind="user")
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.s_sk)
    user_token = FpAuth(body["token"])

    body = get("hosted/onboarding/config", None, user_token, status_code=400)
    assert body["message"] == "No playbook key provided"
    assert body["code"] == "E126"

    body = get("hosted/onboarding/config", None, status_code=401)
    assert (
        body["message"]
        == "Missing header: X-Onboarding-Config-Key or X-Fp-Authorization"
    )


def test_get_org_config_mismatch_playbooks(
    sandbox_tenant, sandbox_user, doc_request_sandbox_ob_config
):
    data = dict(kind="onboard", key=doc_request_sandbox_ob_config.key.value)
    body = post(f"users/{sandbox_user.fp_id}/token", data, sandbox_tenant.s_sk)
    user_token = FpAuth(body["token"])

    auths = [sandbox_tenant.default_ob_config.key, user_token]
    body = get("hosted/onboarding/config", None, *auths, status_code=400)
    assert (
        body["message"]
        == "Playbook key provided conflicts with the playbook associated with the user token"
    )
    assert body["code"] == "E127"
