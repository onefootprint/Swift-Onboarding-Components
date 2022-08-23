from tests.utils import url
from tests.utils import post, get, put, build_user_data
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
        put(f"users/{fp_id}/data/identity", data, workos_sandbox_tenant.sk.key)

        # check that the data is there now
        params = {"fields": "first_name, last_name, zip, ssn9, city"}
        response = get(
            f"users/{fp_id}/data/identity", params, workos_sandbox_tenant.sk.key
        )
        assert response["data"]["first_name"] == True
        assert response["data"]["last_name"] == True
        assert response["data"]["zip"] == True
        assert response["data"]["ssn9"] == True
        assert response["data"]["city"] == True

        # decrypt the data
        data = dict(reason="test", fields=["first_name", "zip", "city"])
        body = post(
            f"users/{fp_id}/identity/decrypt", data, workos_sandbox_tenant.sk.key
        )
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


class TestCustomDataApi:
    def test_custom_data_basic_non_portable(self, workos_sandbox_tenant):
        # create the vault
        body = post("users/", None, workos_sandbox_tenant.sk.key)
        user = body["data"]
        fp_id = user["footprint_user_id"]
        assert fp_id

        # post data to it
        data = {"ach_account_number": "123467890", "cc4": "4242"}
        put(f"users/{fp_id}/data/custom", data, workos_sandbox_tenant.sk.key)

        # check status of the data
        params = {"fields": "cc4,ach_account_number, insurance_id"}
        response = get(
            f"users/{fp_id}/data/custom", params, workos_sandbox_tenant.sk.key
        )
        assert response["data"]["ach_account_number"] == True
        assert response["data"]["cc4"] == True
        assert response["data"]["insurance_id"] == False

        # decrypt the data
        # check status of the data
        data = dict(reason="test", fields=["cc4", "ach_account_number"])
        response = post(
            f"users/{fp_id}/custom/decrypt", data, workos_sandbox_tenant.sk.key
        )
        assert response["data"]["ach_account_number"] == "123467890"
        assert response["data"]["cc4"] == "4242"
