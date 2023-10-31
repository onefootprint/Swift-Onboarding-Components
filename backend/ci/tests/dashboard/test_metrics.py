from tests.utils import get


def test_metrics(sandbox_tenant):
    body = get("/org/metrics", None, *sandbox_tenant.db_auths)
    assert body["new_user_vaults"] >= body["total_user_onboardings"]
    assert body["total_user_onboardings"] >= body["successful_user_onboardings"]
    assert body["total_user_onboardings"] >= body["failed_user_onboardings"]
    assert body["total_user_onboardings"] >= body["incomplete_user_onboardings"]
