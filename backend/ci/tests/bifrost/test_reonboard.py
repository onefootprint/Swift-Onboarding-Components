from tests.utils import get, patch
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def test_reonboard(sandbox_tenant, sandbox_user):
    # User one-clicks onto same ob config
    phone_number = sandbox_user.client.data["id.phone_number"]
    sandbox_id = sandbox_user.client.sandbox_id
    bifrost = BifrostClient.inherit_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()
    body = patch("hosted/user/vault", dict(), bifrost.auth_token, status_code=401)
    assert body["message"] == "Workflow state does not allow add_data"
    assert len(bifrost.handled_requirements) == 0

    # no new KYC checks should be run, we should still only 1 OBD
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        *sandbox_user.tenant.db_auths,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1


def test_abort_then_reonboard(sandbox_tenant, must_collect_data):
    obc1 = create_ob_config(
        sandbox_tenant,
        "Reonboard OBC 1",
        must_collect_data,
        must_collect_data,
    )
    obc2 = create_ob_config(
        sandbox_tenant,
        "Reonboard OBC 2",
        must_collect_data,
        must_collect_data,
    )

    # Start onboarding onto obc1, then deactivate it by onboarding onto obc2
    bifrost1 = BifrostClient.new_user(obc1)
    phone_number = bifrost1.data["id.phone_number"]
    sandbox_id = bifrost1.sandbox_id
    bifrost2 = BifrostClient.inherit_user(obc2, sandbox_id)

    # Shouldn't be able to do anything with bifrost1's workflow/auth token
    body = patch("hosted/user/vault", dict(), bifrost1.auth_token, status_code=401)
    assert body["message"] == "Workflow is deactivated. Cannot perform add_data"

    # But should be able to use bifrost2's auth token
    patch("hosted/user/vault", dict(), bifrost2.auth_token)

    # And, can re-start onboarding onto obc1 and run to completion
    bifrost1 = BifrostClient.inherit_user(obc1, sandbox_id)
    bifrost1.run()
