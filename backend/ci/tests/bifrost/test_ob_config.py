from tests.utils import get


def test_get_org_config(tenant, must_collect_data):
    ob_config = get("hosted/onboarding/config", None, tenant.default_ob_config.key)
    assert ob_config["name"] == "Acme Bank Card"
    assert ob_config["org_name"] == tenant.name

    has_biz = (
        len(list(filter(lambda x: x.startswith("business."), must_collect_data))) > 0
    )
    assert ob_config["is_kyb"] == has_biz

    has_doc = (
        len(list(filter(lambda x: x.startswith("document."), must_collect_data))) > 0
    )
    assert ob_config["requires_id_doc"] == has_doc
