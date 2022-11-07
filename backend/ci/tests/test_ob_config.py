from tests.utils import get


def test_get_org_config(workos_tenant, must_collect_data, can_access_data):
    body = get("org/onboarding_config", None, workos_tenant.ob_config().key)
    tenant = body
    assert tenant["name"] == "Acme Bank Card"
    assert tenant["org_name"] == "Acme Bank"
    assert set(tenant["must_collect_data"]) == set(must_collect_data)
    assert set(tenant["can_access_data"]) == set(can_access_data)
