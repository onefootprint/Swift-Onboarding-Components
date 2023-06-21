from tests.utils import get, patch
from tests.bifrost_client import BifrostClient


def test_reonboard(sandbox_tenant, twilio, sandbox_user):
    # User one-clicks onto same ob config
    phone_number = sandbox_user.client.data["id.phone_number"]
    bifrost = BifrostClient.inherit(
        sandbox_tenant.default_ob_config, twilio, phone_number
    )
    bifrost.run()
    body = patch("hosted/user/vault", dict(), bifrost.auth_token, status_code=400)
    assert body["error"]["message"] == "Workflow state does not allow add_data"
    assert len(bifrost.handled_requirements) == 0

    # no new KYC checks should be run, we should still only 1 OBD
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        sandbox_user.tenant.sk.key,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1
