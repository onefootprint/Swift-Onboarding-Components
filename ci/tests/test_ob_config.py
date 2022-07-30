from tests.utils import get

def test_get_org_config(workos_tenant, must_collect_data_kinds, can_access_data_kinds):
    body = get("org/config", None, workos_tenant.pk)
    tenant = body['data']
    assert tenant['name'] == 'Acme Bank Card'
    assert tenant['org_name'] == 'Acme Bank'
    assert set(tenant['must_collect_data_kinds']) == set(must_collect_data_kinds)
    assert set(tenant['can_access_data_kinds']) == set(can_access_data_kinds)
