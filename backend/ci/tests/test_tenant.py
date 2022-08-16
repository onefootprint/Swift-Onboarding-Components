from tests.utils import get


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