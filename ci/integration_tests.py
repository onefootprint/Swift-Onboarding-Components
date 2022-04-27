import requests
import os
import pytest

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def test_create_tenant(request):
    test_tenant_name = "integration_test_tenant"
    path = "{}/{}".format("tenant/init", test_tenant_name)
    r = requests.post(url(path))
    assert(r.status_code == 200)
    # save tenant id
    tenant_id = r.json()["tenant_id"]
    request.config.cache.set("tenant_id", tenant_id)

def test_create_tenant_api_keys(request):
    test_api_key_name = "integration_test_api_key"
    path = "tenant/{}/api-key/init/{}".format(request.config.cache.get("tenant_id", None), test_api_key_name)
    r = requests.post(url(path))
    assert(r.status_code == 200)
    # save public api key
    tenant_pub_key = r.json()["tenant_pub_key"]
    request.config.cache.set("tenant_pub_key", tenant_pub_key)

def test_init_user(request):
    print(request.config.cache.get("tenant_pub_key", None))
    path = "tenant/authz/{}/user/init".format(request.config.cache.get("tenant_pub_key", None))
    print(url(path))
    r = requests.post(url(path))
    print(r)
    assert(r.status_code == 200)
    # save temporary user token & user id
    tenant_temp_token = r.json()["tenant_user_auth_token"]
    tenant_user_id = r.json()["tenant_user_id"]
    request.config.cache.set("tenant_temp_token", tenant_temp_token)
    request.config.cache.set("tenant_user_id", tenant_user_id)

def test_user_patch(request): 
    path = "tenant/authz/{}/user/{}/update".format(
        request.config.cache.get("tenant_temp_token", None),
        request.config.cache.get("tenant_user_id", None)
    )
    data = {"phone_number": "555-5555"}
    headers = {'Content-type': 'application/json'}
    print(url(path))
    r = requests.patch(url(path), json=data, headers=headers)
    assert(r.status_code == 200)




