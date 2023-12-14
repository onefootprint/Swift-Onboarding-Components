import arrow
from tests.utils import get, create_ob_config
from tests.bifrost_client import BifrostClient


def test_metrics(sandbox_tenant):
    filters = dict(timestamp_gte=arrow.now().shift(days=-30).isoformat())
    recently = get("/org/metrics", filters, *sandbox_tenant.db_auths)
    all_time = get("/org/metrics", None, *sandbox_tenant.db_auths)
    assert all_time["new_user_vaults"] >= all_time["total_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["successful_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["failed_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["incomplete_user_onboardings"]

    for k in [
        "new_user_vaults",
        "total_user_onboardings",
        "successful_user_onboardings",
        "failed_user_onboardings",
        "incomplete_user_onboardings",
    ]:
        assert recently[k] <= all_time[k]


def test_metrics_for_playbook(sandbox_user, sandbox_tenant, must_collect_data, twilio):
    sandbox_user  # Not used, just need this fixture to be used

    # Metrics exist when not filtering by anything
    body = get("/org/metrics", None, *sandbox_tenant.db_auths)
    assert body["total_user_onboardings"] > 0

    # No metrics for brand new playbook
    pb = create_ob_config(
        sandbox_tenant,
        "Test playbook for metrics",
        must_collect_data,
        must_collect_data,
    )
    body = get("/org/metrics", dict(playbook_id=pb.id), *sandbox_tenant.db_auths)
    assert body["total_user_onboardings"] == 0

    # Onboard a user onto the playbook and show that the metrics increment
    bifrost = BifrostClient.new(pb, twilio)
    bifrost.run()
    body = get("/org/metrics", dict(playbook_id=pb.id), *sandbox_tenant.db_auths)
    assert body["total_user_onboardings"] == 1
