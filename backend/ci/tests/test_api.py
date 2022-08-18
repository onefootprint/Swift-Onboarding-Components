from tests.utils import url
from tests.utils import post, build_user_data
import requests
from requests.auth import HTTPBasicAuth


class TestNonPortableVaultApi:
    def test_vault_create_write_decrypt(self, workos_sandbox_tenant):

        # create the vault
        body = post("users/", None, workos_sandbox_tenant.sk.key)
        user = body["data"]
        fp_id = user["footprint_user_id"]
        assert fp_id

        # post data to it
        data = build_user_data()
        post(f"users/{fp_id}/data/identity", data, workos_sandbox_tenant.sk.key)

        data = dict(reason="test", attributes=["first_name", "zip", "city"])
        body = post(f"users/{fp_id}/decrypt", data, workos_sandbox_tenant.sk.key)
        data = body["data"]
        print(data)
        assert data["first_name"] == "SANDBOX"
        assert data["zip"] == "10009"
        assert data["city"] == "Enclave".upper()


class TestApiFormats:
    def test_basic_auth(self, workos_sandbox_tenant):
        response = requests.get(
            url("org/api_keys/check"),
            auth=HTTPBasicAuth(workos_sandbox_tenant.sk.key.token, ""),
        )
        assert response.status_code == 200
