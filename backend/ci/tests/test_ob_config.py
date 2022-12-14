from tests.utils import get


def test_get_org_config(tenant, must_collect_data, can_access_data):
    ob_config = get("org/onboarding_config", None, tenant.default_ob_config.key)
    assert ob_config["name"] == "Acme Bank Card"
    assert ob_config["org_name"] == tenant.name
    assert set(ob_config["must_collect_data"]) == set(must_collect_data)
    assert set(ob_config["can_access_data"]) == set(can_access_data)
