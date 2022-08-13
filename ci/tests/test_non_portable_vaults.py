from ast import Pass
from tests.utils import _gen_random_ssn
import pytest
from tests.utils import post, build_user_data
from tests.types import SecretApiKey


class TestNonPortableVault:
    def test_vault_create_write_decrypt(self, workos_sandbox_tenant):
        
        # create the vault
        body = post("users/", None, workos_sandbox_tenant.sk.key)
        user = body["data"]
        fp_id = user["footprint_user_id"]     
        assert fp_id

        # post data to it
        data = build_user_data()
        post(f"users/{fp_id}/data", data, workos_sandbox_tenant.sk.key)

        data = dict(reason="test", attributes=["first_name", "zip", "city"])
        body = post(f"users/{fp_id}/decrypt", data, workos_sandbox_tenant.sk.key)
        data = body["data"]
        

        assert data["first_name"] == "SANDBOX"
        assert data["zip"] == "10009"
        assert data["city"] == "Enclave".upper()

    def test_portable_failed_data_write(self, user):    
        data = dict(reason="test", attributes=["first_name", "ssn"])
        post(f"users/{user.fp_user_id}/decrypt", data, user.tenant.sk.key)
    
        data = {
            "dob": {
                "month": 1,
                "day": 1,
                "year": 1970,
            },
            "ssn": _gen_random_ssn()
        }

        # ensure we cannot change data in a portable vault
        post(f"users/{user.fp_user_id}/data", data, user.tenant.sk.key, status_code=401)
