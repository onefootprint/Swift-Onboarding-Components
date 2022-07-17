from tests.utils import get
from tests.constants import MUST_COLLECT_DATA_KINDS, CAN_ACCESS_DATA_KINDS

def test_get_org_config(workos_tenant):
    body = get("org/config", None, workos_tenant.pk)
    tenant = body['data']
    assert tenant['name'] == 'Acme Bank'
    assert tenant['settings'] == 'Empty'
    assert set(tenant['must_collect_data_kinds']) == set(MUST_COLLECT_DATA_KINDS)
    assert set(tenant['can_access_data_kinds']) == set(CAN_ACCESS_DATA_KINDS)
