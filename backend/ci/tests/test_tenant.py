from tests.utils import get, post


class TestTenantAPIs:
    def test_addresses(self, user):
        body = get(f"users/{user.fp_user_id}/addresses", None, user.tenant.sk.key)
        address = body["data"][0]
        assert address["line1"] is True
        assert address["line2"] is True
        assert address["city"] is True
        assert address["state"] is True
        assert address["zip"] is True
        assert address["country"] is True

    def test_addresses_decrypt(self, user):
        reason = "Decrypting the address"
        data = dict(reason=reason)
        body = post(
            f"users/{user.fp_user_id}/addresses/decrypt", data, user.tenant.sk.key
        )
        address = body["data"][0]
        assert address["line1"].upper() == "1 FOOTPRINT WAY"
        assert address["line2"].upper() == "PO BOX WALLABY WAY"
        assert address["city"].upper() == "ENCLAVE"
        assert address["state"].upper() == "NY"
        assert address["zip"].upper() == "10009"
        assert address["country"].upper() == "US"

        params = dict(footprint_user_id=user.fp_user_id)
        body = get(f"users/access_events", params, user.tenant.sk.key)
        assert body["data"][0]["reason"] == reason

        # Can't decrypt without reason
        post(
            f"users/{user.fp_user_id}/addresses/decrypt",
            None,
            user.tenant.sk.key,
            status_code=400,
        )
