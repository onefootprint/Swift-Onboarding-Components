import arrow
from tests.utils import get, create_ob_config
from tests.bifrost_client import BifrostClient


def test_metrics(sandbox_tenant):
    filters = dict(timestamp_gte=arrow.now().shift(days=-30).isoformat())
    recently = get("/org/metrics", filters, *sandbox_tenant.db_auths)
    all_time = get("/org/metrics", None, *sandbox_tenant.db_auths)
    for m in [recently, all_time]:
        assert m["user"]["new_vaults"] >= m["user"]["total_onboardings"]
        assert m["user"]["total_onboardings"] >= m["user"]["pass_onboardings"]
        assert m["user"]["total_onboardings"] >= m["user"]["fail_onboardings"]
        assert m["user"]["total_onboardings"] >= m["user"]["incomplete_onboardings"]


def test_metrics_for_playbook(sandbox_user, sandbox_tenant, must_collect_data):
    sandbox_user  # Not used, just need this fixture to be used

    # Metrics exist when not filtering by anything
    body = get("/org/metrics", None, *sandbox_tenant.db_auths)
    assert body["user"]["total_onboardings"] > 0

    # No metrics for brand new playbook
    pb = create_ob_config(
        sandbox_tenant, "Test playbook for metrics", must_collect_data
    )
    body = get("/org/metrics", dict(playbook_id=pb.id), *sandbox_tenant.db_auths)
    assert body["user"]["total_onboardings"] == 0

    # Onboard a user onto the playbook and show that the metrics increment
    bifrost = BifrostClient.new_user(pb)
    bifrost.run()
    body = get("/org/metrics", dict(playbook_id=pb.id), *sandbox_tenant.db_auths)
    assert body["user"]["total_onboardings"] == 1
