import pytest
from tests.utils import url
from tests.utils import post, get, put, build_user_data
import requests
from requests.auth import HTTPBasicAuth


class TestNonPortableVaultApi:
    @pytest.mark.parametrize(
        "data",
        [
            {"ssn9": "12345678"},
            {"ssn4": "123456789"},
            {"ssn4": "123"},
            {"name": {"first_name": "Hi"}},  # Also need last name
            {"name": {"last_name": "Bye"}},  # Also need first name
            {"dob": {"day": 1, "month": 1}},  # Also need year
            {"address": {"zip": "12345"}},
            {"address": {"line1": "1 Footprint Way"}},
        ],
    )
    def test_identity_validation(self, sandbox_tenant, data):
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        put(
            f"users/{fp_id}/vault/identity",
            data,
            sandbox_tenant.sk.key,
            status_code=400,
        )

    def test_vault_create_write_decrypt(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = build_user_data()
        put(f"users/{fp_id}/vault/identity", data, sandbox_tenant.sk.key)
        # check that the data is there now
        params = {"fields": "id.first_name, id.last_name, id.zip, id.ssn9, id.city"}
        response = get(f"users/{fp_id}/vault", params, sandbox_tenant.sk.key)
        assert response["id.first_name"] == True
        assert response["id.last_name"] == True
        assert response["id.zip"] == True
        assert response["id.ssn9"] == True
        assert response["id.city"] == True

        # decrypt the data
        data = dict(
            reason="test",
            fields=["id.first_name", "id.zip", "id.city"],
        )
        body = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        data = body
        assert data["id.first_name"] == "Sandbox"
        assert data["id.zip"] == "10009"
        assert data["id.city"] == "Enclave"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            sandbox_tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "decrypt"
        assert set(access_events[0]["targets"]) == {
            "id.first_name",
            "id.zip",
            "id.city",
        }

    def test_custom_data(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {"ach_account_number": "123467890", "cc4": "4242"}
        put(f"users/{fp_id}/vault/custom", data, sandbox_tenant.sk.key)

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            sandbox_tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "update"
        assert set(access_events[0]["targets"]) == {
            "custom.ach_account_number",
            "custom.cc4",
        }

        # check status of the data
        params = {"fields": "custom.cc4,custom.ach_account_number, custom.insurance_id"}
        response = get(f"users/{fp_id}/vault", params, sandbox_tenant.sk.key)
        assert response["custom.ach_account_number"] == True
        assert response["custom.cc4"] == True
        assert response["custom.insurance_id"] == False

        # decrypt the data
        # check status of the data
        data = dict(reason="test", fields=["custom.cc4", "custom.ach_account_number"])
        response = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["custom.ach_account_number"] == "123467890"
        assert response["custom.cc4"] == "4242"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            sandbox_tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "decrypt"
        assert set(access_events[0]["targets"]) == {
            "custom.ach_account_number",
            "custom.cc4",
        }


class TestUnifiedVaultApi:
    def test_unified_vault_create_write_decrypt(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "identity": build_user_data(),
            "custom": {"ach_account_number": "123467890", "cc4": "4242"},
        }
        put(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # check that the data is there now
        params = {
            "fields": "id.last_name, id.ssn9, custom.ach_account_number,custom.cc4, custom.insurance_id"
        }

        response = get(f"users/{fp_id}/vault", params, sandbox_tenant.sk.key)
        # TODO update these to serialized DataIdentifiers
        assert response["id.last_name"] == True
        assert response["id.ssn9"] == True
        assert response["custom.ach_account_number"] == True
        assert response["custom.cc4"] == True
        assert response["custom.insurance_id"] == False

        # decrypt the data
        data = dict(
            reason="test",
            fields=[
                "id.first_name",
                "id.zip",
                "custom.ach_account_number",
                "custom.cc4",
            ],
        )
        body = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        data = body
        assert data["id.first_name"] == "Sandbox"
        assert data["id.zip"] == "10009"
        assert data["custom.ach_account_number"] == "123467890"
        assert data["custom.cc4"] == "4242"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            sandbox_tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "decrypt"

        events = set(access_events[0]["targets"])
        assert events == {
            "id.first_name",
            "id.zip",
            "custom.ach_account_number",
            "custom.cc4",
        }


class TestApiFormats:
    def test_basic_auth(self, sandbox_tenant):
        response = requests.get(
            url("org/api_keys/check"),
            auth=HTTPBasicAuth(sandbox_tenant.sk.key.value, ""),
        )
        assert response.status_code == 200
