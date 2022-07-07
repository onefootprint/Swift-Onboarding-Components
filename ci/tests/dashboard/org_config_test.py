import requests
from tests.utils import url, _client_pub_key_headers, _assert_response

def test_get_org_config(request, workos_tenant):
    path = "org/config"
    r = requests.get(
        url(path),
        headers=_client_pub_key_headers(workos_tenant["pk"]),
    )
    body = _assert_response(r)
    assert body == {'data': {'name': 'Acme Bank', 'required_user_data': ['first_name', 'last_name', 'dob', 'ssn', 'street_address', 'street_address2', 'city', 'state', 'zip', 'country', 'email', 'phone_number'], 'settings': 'Empty'}}
