import pytest
from tests.utils import post, get, put, build_user_data
from tests.constants import EMAIL, PHONE_NUMBER


class TestNonPortableVaultApi:
    @pytest.mark.parametrize(
        "key, value, expected_error",
        [
            ("id.ssn9", "12345678", "Invalid length"),
            ("id.ssn4", "123456789", "Invalid length"),
            ("id.ssn4", "123", "Invalid length"),
            ("id.ssn4", "123a", "Invalid character: can only provide ascii digits"),
            ("id.first_name", "Hi", "Cannot vault without other Name data"),
            ("id.last_name", "Bye", "Cannot vault without other Name data"),
            (
                "id.dob",
                "2023-13-25",
                "Invalid date: must provide a valid date in ISO 8601 format, YYYY-MM-DD",
            ),
            ("id.zip", "12345", "Cannot vault without other Address data"),
            (
                "id.address_line1",
                "1 Footprint Way",
                "Cannot vault without other Address data",
            ),
            (
                "business.ein",
                "Flerp",
                "Cannot add to this type of vault",
            ),
        ],
    )
    def test_identity_validation(self, tenant, key, value, expected_error):
        # Can't create the user inline with invalid data
        data = {key: value}
        post("users/", data, tenant.sk.key, status_code=400)

        body = post("users/", None, tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        body = put(f"users/{fp_id}/vault", data, tenant.sk.key, status_code=400)
        # Should have a JSON error message with the invalid field identifier as the key
        assert body["error"]["message"][key] == expected_error
        # Validate endpoint should also fail
        post(f"users/{fp_id}/vault/validate", data, tenant.sk.key, status_code=400)

    def test_vault_create_write_decrypt(self, tenant):
        # create the vault with data
        data = {
            "id.phone_number": PHONE_NUMBER,
            "id.email": EMAIL,
            "custom.hi": "bye",
            **build_user_data(),
        }
        body = post("users/", data, tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # check that the data is there now
        response = get(f"users/{fp_id}/vault", None, tenant.sk.key)
        assert response["id.first_name"]
        assert response["id.last_name"]
        assert response["id.zip"]
        assert response["id.ssn9"]
        assert response["id.city"]
        assert response["id.phone_number"]
        assert response["id.email"]
        assert response["custom.hi"]

        # decrypt the data
        data = dict(
            reason="test",
            fields=[
                "id.first_name",
                "id.zip",
                "id.city",
                "id.phone_number",
                "id.email",
                "custom.hi",
            ],
        )
        body = post(f"users/{fp_id}/vault/decrypt", data, tenant.sk.key)
        data = body
        assert data["id.first_name"] == "Sandbox"
        assert data["id.zip"] == "10009"
        assert data["id.city"] == "Enclave"
        assert data["id.phone_number"] == PHONE_NUMBER.replace(" ", "")
        assert data["id.email"] == EMAIL
        assert data["custom.hi"] == "bye"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "decrypt"
        assert set(access_events[0]["targets"]) == {
            "id.first_name",
            "id.zip",
            "id.city",
            "id.phone_number",
            "id.email",
            "custom.hi",
        }

    def test_custom_data(self, tenant):
        # create the vault
        body = post("users/", None, tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {"custom.ach_account_number": "123467890", "custom.cc4": "4242"}
        put(f"users/{fp_id}/vault", data, tenant.sk.key)

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "update"
        assert set(access_events[0]["targets"]) == {
            "custom.ach_account_number",
            "custom.cc4",
        }

        # check status of the data
        params = {"fields": "custom.cc4,custom.ach_account_number, custom.insurance_id"}
        response = get(f"users/{fp_id}/vault", params, tenant.sk.key)
        assert response["custom.ach_account_number"] == True
        assert response["custom.cc4"] == True
        assert response["custom.insurance_id"] == False

        # decrypt the data
        # check status of the data
        data = dict(reason="test", fields=["custom.cc4", "custom.ach_account_number"])
        response = post(f"users/{fp_id}/vault/decrypt", data, tenant.sk.key)
        assert response["custom.ach_account_number"] == "123467890"
        assert response["custom.cc4"] == "4242"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            tenant.sk.key,
        )
        access_events = body["data"]
        assert access_events[0]["kind"] == "decrypt"
        assert set(access_events[0]["targets"]) == {
            "custom.ach_account_number",
            "custom.cc4",
        }


class TestUnifiedVaultApi:
    def test_unified_vault_create_write_decrypt(self, tenant):
        # create the vault
        body = post("users/", None, tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "custom.ach_account_number": "123467890",
            "custom.cc4": "4242",
            **build_user_data(),
        }
        put(f"users/{fp_id}/vault", data, tenant.sk.key)

        # check that the data is there now
        params = {
            "fields": "id.last_name, id.ssn9, custom.ach_account_number,custom.cc4, custom.insurance_id"
        }

        response = get(f"users/{fp_id}/vault", params, tenant.sk.key)
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
        body = post(f"users/{fp_id}/vault/decrypt", data, tenant.sk.key)
        data = body
        assert data["id.first_name"] == "Sandbox"
        assert data["id.zip"] == "10009"
        assert data["custom.ach_account_number"] == "123467890"
        assert data["custom.cc4"] == "4242"

        # verify access events created
        body = get(
            "org/access_events",
            dict(footprint_user_id=fp_id),
            tenant.sk.key,
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
