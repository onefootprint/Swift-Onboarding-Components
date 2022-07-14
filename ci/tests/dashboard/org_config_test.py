import requests
from tests.utils import url, _client_pub_key_headers, _assert_response
from tests.constants import REQUIRED_DATA_KINDS

def test_get_org_config(request, workos_tenant):
    path = "org/config"
    r = requests.get(
        url(path),
        headers=_client_pub_key_headers(workos_tenant["pk"]),
    )
    body = _assert_response(r)
    tenant = body['data']
    assert tenant['name'] == 'Acme Bank'
    assert tenant['settings'] == 'Empty'
    assert set(tenant['required_user_data']) == set(REQUIRED_DATA_KINDS)
    assert set(tenant['must_collect_data_kinds']) == set(REQUIRED_DATA_KINDS)
    assert set(tenant['can_access_data_kinds']) == set(REQUIRED_DATA_KINDS)
