from tests.utils import get, patch
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def test_reonboard(sandbox_tenant, sandbox_user):
    # User one-clicks onto same ob config
    sandbox_id = sandbox_user.client.sandbox_id
    bifrost = BifrostClient.inherit_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()
    body = patch("hosted/user/vault", dict(), bifrost.auth_token, status_code=403)
    assert body["message"] == "Workflow state does not allow add_data"
    assert len(bifrost.handled_requirements) == 0

    # no new KYC checks should be run, we should still only 1 OBD
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline", None, *sandbox_user.tenant.db_auths
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1


def test_abort_then_reonboard(sandbox_tenant, must_collect_data):
    obc1 = create_ob_config(sandbox_tenant, "Abort OBC 1", must_collect_data)
    obc2 = create_ob_config(sandbox_tenant, "Abort OBC 2", must_collect_data)

    # Start onboarding onto obc1, then deactivate it by onboarding onto obc2
    bifrost1 = BifrostClient.new_user(obc1)
    bifrost2 = BifrostClient.inherit_user(obc2, bifrost1.sandbox_id)

    # Shouldn't be able to do anything with bifrost1's workflow/auth token
    body = patch("hosted/user/vault", dict(), bifrost1.auth_token, status_code=401)
    assert body["message"] == "Workflow is deactivated. Cannot perform add_data"

    # But should be able to use bifrost2's auth token
    patch("hosted/user/vault", dict(), bifrost2.auth_token)

    # And, can re-start onboarding onto obc1 and run to completion
    bifrost1 = BifrostClient.inherit_user(obc1, bifrost1.sandbox_id)
    bifrost1.run()


def test_allow_reonboard(sandbox_tenant, must_collect_data):
    allow_reonboard_obc = create_ob_config(
        sandbox_tenant, "Allow reonboard", must_collect_data, allow_reonboard=True
    )
    bifrost1 = BifrostClient.new_user(allow_reonboard_obc)
    bifrost1.run()

    # Second onboarding should not be a no-op, we should reonboard
    bifrost2 = BifrostClient.inherit_user(allow_reonboard_obc, bifrost1.sandbox_id)
    user = bifrost2.run()
    assert [r["kind"] for r in bifrost2.handled_requirements] == ["process"]

    # Should have two onboarding decisions
    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2


def test_allow_reonboard_kyb(sandbox_tenant, must_collect_data):
    cdos = must_collect_data + [
        "business_name",
        "business_tin",
        "business_address",
        "business_beneficial_owners",
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

    bifrost2 = BifrostClient.inherit_user(allow_reonboard_obc, bifrost1.sandbox_id)
    user2 = bifrost2.run()
    assert [r["kind"] for r in bifrost2.handled_requirements] == [
        "collect_business_data",
        "process",
    ]
    assert user1.fp_id == user2.fp_id
    assert user1.fp_bid != user2.fp_bid, "Should make a new fp_bid when reonboarding"

    timeline = get(f"entities/{user1.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2
