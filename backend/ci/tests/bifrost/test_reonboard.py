from tests.identify_client import IdentifyClient
from tests.headers import FpAuth, PlaybookKey
from tests.types import ObConfiguration
from tests.utils import get, patch, post, put
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def num_onboarding_decisions(fp_id, tenant):
    timeline = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    obds = [i for i in timeline["data"] if i["event"]["kind"] == "onboarding_decision"]
    return len(obds)


def test_reonboard(sandbox_tenant, sandbox_user):
    # User one-clicks onto same ob config
    sandbox_id = sandbox_user.client.sandbox_id
    bifrost = BifrostClient.login_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()
    body = patch("hosted/user/vault", dict(), bifrost.auth_token, status_code=403)
    assert body["message"] == "Workflow state does not allow add_data"
    assert len(bifrost.handled_requirements) == 0

    # no new KYC checks should be run, we should still only 1 OBD
    assert num_onboarding_decisions(sandbox_user.fp_id, sandbox_tenant) == 1


def test_abort_then_reonboard(sandbox_tenant, must_collect_data):
    obc1 = create_ob_config(sandbox_tenant, "Abort OBC 1", must_collect_data)
    obc2 = create_ob_config(sandbox_tenant, "Abort OBC 2", must_collect_data)

    # Start onboarding onto obc1, then deactivate it by onboarding onto obc2
    bifrost1 = BifrostClient.new_user(obc1)
    bifrost2 = BifrostClient.login_user(obc2, bifrost1.sandbox_id)

    # Shouldn't be able to do anything with bifrost1's workflow/auth token
    body = patch("hosted/user/vault", dict(), bifrost1.auth_token, status_code=401)
    assert body["message"] == "Workflow is deactivated. Cannot perform add_data"

    # But should be able to use bifrost2's auth token
    patch("hosted/user/vault", dict(), bifrost2.auth_token)

    # And, can re-start onboarding onto obc1 and run to completion
    bifrost1 = BifrostClient.login_user(obc1, bifrost1.sandbox_id)
    bifrost1.run()


def test_allow_reonboard_user_token(sandbox_tenant, must_collect_data):
    obc = create_ob_config(sandbox_tenant, "obc", must_collect_data)
    bifrost1 = BifrostClient.new_user(obc)
    user = bifrost1.run()

    def reonboard(allow_reonboard: bool):
        data = dict(kind="onboard", key=obc.key.value, allow_reonboard=allow_reonboard)
        body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
        auth_token = FpAuth(body["token"])

        auth_token = IdentifyClient.from_token(auth_token).step_up()
        bifrost2 = BifrostClient.raw_auth(obc, auth_token, bifrost1.sandbox_id)
        bifrost2.run()
        return bifrost2

    # Create a token with allow_reonboard = False. Should not allow reonboarding
    bifrost2 = reonboard(False)
    assert [r["kind"] for r in bifrost2.handled_requirements] == []
    assert num_onboarding_decisions(user.fp_id, sandbox_tenant) == 1

    # Create a token with allow_reonboard = False. Should allow reonboarding, even though the playbook doesn't
    # have the option set
    bifrost3 = reonboard(True)
    assert [r["kind"] for r in bifrost3.handled_requirements] == ["process"]
    assert num_onboarding_decisions(user.fp_id, sandbox_tenant) == 2


def test_allow_reonboard_ob_session_token(sandbox_tenant, must_collect_data):
    obc = create_ob_config(sandbox_tenant, "obc", must_collect_data)
    bifrost1 = BifrostClient.new_user(obc)
    user = bifrost1.run()

    data = dict(key=obc.key.value, allow_reonboard=True)
    body = post("/onboarding/session", data, sandbox_tenant.s_sk)
    ob_token = PlaybookKey(body["token"])

    # Re-onboard onto the playbook, identified by PII
    auth_token = IdentifyClient.from_user(user, override_playbook_auth=ob_token).login()
    bifrost2 = BifrostClient.raw_auth(obc, auth_token, bifrost1.sandbox_id)
    bifrost2.run()
    assert [r["kind"] for r in bifrost2.handled_requirements] == ["process"]

    # Re-onboard onto the playbook, identified by an auth token. The auth token initially has
    # `allow_reonboard` disabled and then is overriden by the ob session token's setting
    data = dict(kind="user", allow_reonboard=False)
    body = post(f"/users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    auth_token = FpAuth(body["token"])
    auth_token = IdentifyClient.from_token(
        auth_token, override_playbook_auth=ob_token
    ).step_up()
    bifrost3 = BifrostClient.raw_auth(
        obc,
        auth_token,
        bifrost1.sandbox_id,
        # NOTE: provide_playbook_auth isn't technically what happens in bifrost - we would normally pass the ob session token
        provide_playbook_auth=True,
    )
    bifrost3.run()
    assert [r["kind"] for r in bifrost3.handled_requirements] == ["process"]
