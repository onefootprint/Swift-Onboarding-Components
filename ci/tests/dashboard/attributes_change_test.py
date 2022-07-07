import requests
from tests.constants import DEFAULT_ATTRIBUTES
from tests.utils import _client_priv_key_headers, _assert_response, url


def test_default_attributes(request, workos_tenant):
    config_key = workos_tenant["pk"]
    path = "org/required_data/{}".format(config_key)
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    body = _assert_response(r)
    attributes = set(body["data"])
    assert attributes == DEFAULT_ATTRIBUTES

def test_change_attributes(request, workos_tenant):
    config_key = workos_tenant["pk"]
    path = "org/required_data"
    attributes = ["first_name", "last_name", "phone_number", "email"]
    data = {
        "attributes": attributes,
        "configuration_key": config_key
    }
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json=data,
    )
    body = _assert_response(r)
    # make sure we changed
    get_path = path + "/" + config_key
    r = requests.get(
        url(get_path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
    )
    body = _assert_response(r)
    assert set(body["data"]) == set(attributes)
    # change back
    r = requests.post(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]), 
        json= {
            "configuration_key": config_key,
            "attributes": list(DEFAULT_ATTRIBUTES)
        }
    )
    _assert_response(r)