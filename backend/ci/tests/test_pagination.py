from tests.bifrost_client import BifrostClient
from tests.utils import get


def test_user_timeline_pagination(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    all_events = body["data"]

    next = None
    for i, event in enumerate(all_events):
        pagination = dict(page_size=1, cursor=next)
        body = get(
            f"entities/{user.fp_id}/timeline", pagination, *sandbox_tenant.db_auths
        )
        next = body["meta"]["next"]
        assert len(body["data"]) == 1
        assert body["data"][0] == event
