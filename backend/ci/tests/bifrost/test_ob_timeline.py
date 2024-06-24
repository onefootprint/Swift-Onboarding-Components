from tests.bifrost_client import BifrostClient
from tests.utils import post, get
from tests.headers import SessionId
from uuid import uuid4


def test_onboarding_timeline(sandbox_tenant):
    """
    Test adding timeline events from bifrost
    """
    session_id = str(uuid4())

    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    data = dict(event="collect-kyc-data.basic-info")
    session_id_h = SessionId(session_id)
    post("hosted/onboarding/timeline", data, bifrost.auth_token, session_id_h)
    user = bifrost.run()

    # Check timeline event in dashboard API
    body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    event = next(
        i["event"] for i in body if i["event"]["kind"] == "onboarding_timeline"
    )
    assert event["data"]["event"] == "collect-kyc-data.basic-info"
    assert event["data"]["session_id"] == session_id
