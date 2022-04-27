import requests
import os
import pytest

TENANT_AUTH_HEADER = "x-tenant-public-key"
TENANT_USER_TOKEN_HEADER = "x-tenant-user-token"

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def _tenant_auth_headers(request):
    tenant_pub_key = request.config.cache.get("tenant_pub_key", None)
    assert "Expected tenant_pub_key config to be set"
    return {
        TENANT_AUTH_HEADER: tenant_pub_key,
    }

def _tenant_user_token_headers(request):
    tenant_user_token = request.config.cache.get("tenant_user_token", None)
    assert "Expected tenant_user_token config to be set"
    return {
        TENANT_USER_TOKEN_HEADER: tenant_user_token,
    }

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
    path = "user/init"
    print(url(path))
    r = requests.post(url(path), headers=_tenant_auth_headers(request))
    print(r)
    print(r.content)
    assert(r.status_code == 200)
    # save temporary user token & user id
    tenant_user_token = r.json()["tenant_user_auth_token"]
    tenant_user_id = r.json()["tenant_user_id"]
    request.config.cache.set("tenant_user_token", tenant_user_token)
    request.config.cache.set("tenant_user_id", tenant_user_id)

def test_user_patch(request): 
    path = "user"
    data = {"phone_number": "+15555555555"}
    headers = dict(
        **_tenant_auth_headers(request),
        **_tenant_user_token_headers(request),
    )
    print(url(path))
    r = requests.patch(url(path), json=data, headers=headers)
    print(r.content)
    assert(r.status_code == 200)

def test_challenge_create(request):
    tenant_user_id = request.config.cache.get("tenant_user_id", None)
    assert tenant_user_id, "Expected tenant_user_id to be set"
    path = "user/{}/challenge".format(tenant_user_id)
    print(url(path))
    data = {"kind": "phonenumber"}
    r = requests.post(url(path), json=data, headers=_tenant_auth_headers(request))
    print(r)
    assert(r.status_code == 200)  # TODO 201

# TODO find a way to test challenge verify - may need to mock out sending/receiving SMS