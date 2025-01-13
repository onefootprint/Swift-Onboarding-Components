from tests.identify_client import IdentifyClient
from tests.headers import FpAuth, PlaybookKey
from tests.types import ObConfiguration
from tests.utils import get, patch, post, put
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config, try_until_success, create_tenant, _gen_random_sandbox_id
from tests.constants import ID_DATA, FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.headers import SandboxId


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


def test_reonboard_behavior_with_adhoc_vendor_call(sandbox_tenant): 
    """ This test ensures that running an adhoc vendor call on a user will not
        make a bifrost initiated workflow on that same playbook no-op
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = ID_DATA
    data.update({"id.phone_number": FIXTURE_PHONE_NUMBER, "id.email": FIXTURE_EMAIL, "id.ssn9": "123456789"})
    body = post("users", data, sandbox_tenant.s_sk, sandbox_id_h)
    fp_id = body["id"]

    # run an adhoc action on them
    action = dict(verification_checks=[dict(kind="sentilink", data=dict())])
    adhoc_vendor_call_action = dict(kind="adhoc_vendor_call", config=action)
    data = dict(actions=[adhoc_vendor_call_action])
    post(f"entities/{fp_id}/actions", data, *sandbox_tenant.db_auths)

    def check_adhoc_vendor_call_results():
        assert num_onboarding_decisions(fp_id, sandbox_tenant) == 1
        # Get the OBC
        body = get(f"entities/{fp_id}/onboardings", None, *sandbox_tenant.db_auths)
        assert len(body["data"]) == 1
        return body["data"][0]["playbook_key"]
    pb_from_adhoc_vendor_call = try_until_success(check_adhoc_vendor_call_results, 60, retry_interval_s=0.1)

    # Register auth methods for the user
    auth_playbook = create_ob_config(
        sandbox_tenant,
        "Auth playbook",
        ["phone_number", "email"],
        required_auth_methods=["phone"],
        kind="auth",
    )
    IdentifyClient(auth_playbook, sandbox_id).login(kind="sms", scope="auth")

    # Find the playbook used by the adhoc vendor call
    body = get("org/playbooks?page_size=100", None, *sandbox_tenant.db_auths)
    configs = body["data"]
    resp = next(i for i in configs if i["key"] == pb_from_adhoc_vendor_call)
    ob = ObConfiguration.from_response(resp, sandbox_tenant)
    
    # Now run bifrost, and we should not no-op and get a new decision
    bifrost = BifrostClient.login_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()
    assert len(bifrost.handled_requirements) > 0
    assert num_onboarding_decisions(fp_id, sandbox_tenant) == 2
    body = get(f"entities/{fp_id}/onboardings", None, *sandbox_tenant.db_auths)
    assert len(body["data"]) == 2
    assert body["data"][0]["status"] == "pass"
    assert body["data"][1]["status"] == "none"
    

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

        auth_token = IdentifyClient.from_token(auth_token).login()
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
    ).login()
    bifrost3 = BifrostClient.raw_auth(
        obc,
        auth_token,
        bifrost1.sandbox_id,
        # NOTE: provide_playbook_auth isn't technically what happens in bifrost - we would normally pass the ob session token
        provide_playbook_auth=True,
    )
    bifrost3.run()
    assert [r["kind"] for r in bifrost3.handled_requirements] == ["process"]
