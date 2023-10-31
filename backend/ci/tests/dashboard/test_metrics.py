import arrow
from tests.utils import get


def test_metrics(sandbox_tenant):
    all_time = get("/org/metrics", None, *sandbox_tenant.db_auths)
    assert all_time["new_user_vaults"] >= all_time["total_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["successful_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["failed_user_onboardings"]
    assert all_time["total_user_onboardings"] >= all_time["incomplete_user_onboardings"]

    filters = dict(timestamp_gte=arrow.now().shift(days=-30).isoformat())
    recently = get("/org/metrics", filters, *sandbox_tenant.db_auths)
    for k in [
        "new_user_vaults",
        "total_user_onboardings",
        "successful_user_onboardings",
        "failed_user_onboardings",
        "incomplete_user_onboardings",
    ]:
        assert recently[k] <= all_time[k]
