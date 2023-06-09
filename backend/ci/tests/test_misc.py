import requests
from requests.auth import HTTPBasicAuth
from tests.utils import post, url
from tests.constants import CUSTODIAN_AUTH


def test_tenant_create():
    """
    We should not be able to create a test tenant with a primary key that doesn't start with
    _private_it_org_
    """
    org_data = {
        "id": "org_asdf",
        "name": "Should never be created",
        "is_live": False,
    }
    body = post("private/test_tenant", org_data, CUSTODIAN_AUTH, status_code=400)
    assert (
        body["error"]["message"]
        == "Cannot inherit credentials for a non-integration test tenant"
    )


def test_basic_auth(sandbox_tenant):
    response = requests.get(
        url("entities"),
        auth=HTTPBasicAuth(sandbox_tenant.sk.key.value, ""),
    )
    assert response.status_code == 200
