from tests.bifrost_client import BifrostClient
from tests.utils import post, get


def test_onboarding_timeline(sandbox_tenant):
    """
    Test adding timeline events from bifrost
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    data = dict(event="collect-kyc-data.basic-info")
    post("hosted/onboarding/timeline", data, bifrost.auth_token)
    user = bifrost.run()

    # Check timeline event in dashboard API
    body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"] for i in body if i["event"]["kind"] == "onboarding_timeline"
    )
    assert event["data"]["event"] == "collect-kyc-data.basic-info"
