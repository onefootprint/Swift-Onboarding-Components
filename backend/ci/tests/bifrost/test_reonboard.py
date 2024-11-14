from tests.identify_client import IdentifyClient
from tests.headers import FpAuth, PlaybookKey
from tests.types import ObConfiguration
from tests.utils import get, patch, post, put
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def num_onboarding_decisions(fp_id, tenant):
    timeline = get(f"entities/{fp_id}/timeline", None, *tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
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


def test_allow_reonboard(sandbox_tenant, must_collect_data):
    allow_reonboard_obc = create_ob_config(
        sandbox_tenant, "Allow reonboard", must_collect_data, allow_reonboard=True
    )
    bifrost1 = BifrostClient.new_user(allow_reonboard_obc)
    bifrost1.run()

    # Second onboarding should not be a no-op, we should reonboard
    bifrost2 = BifrostClient.login_user(allow_reonboard_obc, bifrost1.sandbox_id)
    user = bifrost2.run()
    assert [r["kind"] for r in bifrost2.handled_requirements] == ["process"]

    # Should have two onboarding decisions
    assert num_onboarding_decisions(user.fp_id, sandbox_tenant) == 2


def test_allow_reonboard_kyb(sandbox_tenant, must_collect_data):
    cdos = must_collect_data + [
        "business_name",
        "business_tin",
        "business_address",
        "business_kyced_beneficial_owners",
    ]
    allow_reonboard_obc = create_ob_config(
        sandbox_tenant,
        "Allow reonboard",
        cdos,
        allow_reonboard=True,
        kind="kyb",
    )
    bifrost1 = BifrostClient.new_user(allow_reonboard_obc)
    user1 = bifrost1.run()

    bifrost2 = BifrostClient.login_user(allow_reonboard_obc, bifrost1.sandbox_id)
    user2 = bifrost2.run()
    assert [r["kind"] for r in bifrost2.handled_requirements] == [
        "create_business_onboarding",
        "collect_business_data",
        "process",
    ]
    assert user1.fp_id == user2.fp_id
    assert user1.fp_bid != user2.fp_bid, "Should make a new fp_bid when reonboarding"

    assert num_onboarding_decisions(user1.fp_id, sandbox_tenant) == 2


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


def test_allow_reonboard_checks_all_playbook_versions(sandbox_tenant):
    obc_req = {
        "name": "Test Playbook v1",
        "must_collect_data": [
            "name",
            "ssn9",
            "full_address",
            "email",
            "phone_number",
            "nationality",
            "dob",
        ],
        "kind": "kyc",
        "skip_kyc": False,
        "allow_reonboard": False,
    }
    obc_v1 = post(
        "org/onboarding_configs",
        obc_req,
        *sandbox_tenant.db_auths,
    )
    obc_v1 = ObConfiguration.from_response(obc_v1, sandbox_tenant)

    # First onboard.
    bifrost_v1 = BifrostClient.new_user(obc_v1)
    bifrost_v1.run()

    # Edit the playbook.
    obc_req["name"] = "Test Playbook v2"
    obc_v2 = put(
        f"org/playbooks/{obc_v1.playbook_id}",
        {
            "expected_latest_obc_id": obc_v1.id,
            "new_onboarding_config": obc_req,
        },
        *sandbox_tenant.db_auths,
    )
    obc_v2 = ObConfiguration.from_response(obc_v2, sandbox_tenant)

    # Second onboard should be a no-op and should not generate a new onboarding
    # decision.
    bifrost_v2 = BifrostClient.login_user(obc_v2, bifrost_v1.sandbox_id)
    user = bifrost_v2.run()
    assert bifrost_v2.handled_requirements == []
    assert num_onboarding_decisions(user.fp_id, sandbox_tenant) == 1

    # Edit the playbook again to allow reonboards.
    obc_req["name"] = "Test Playbook v3"
    obc_req["allow_reonboard"] = True
    obc_v3 = put(
        f"org/playbooks/{obc_v2.playbook_id}",
        {
            "expected_latest_obc_id": obc_v2.id,
            "new_onboarding_config": obc_req,
        },
        *sandbox_tenant.db_auths,
    )
    obc_v3 = ObConfiguration.from_response(obc_v3, sandbox_tenant)

    # Reonboarding should now generate a new onboarding decision.
    bifrost_v3 = BifrostClient.login_user(obc_v3, bifrost_v1.sandbox_id)
    user = bifrost_v3.run()
    assert [r["kind"] for r in bifrost_v3.handled_requirements] == ["process"]
    assert num_onboarding_decisions(user.fp_id, sandbox_tenant) == 2
