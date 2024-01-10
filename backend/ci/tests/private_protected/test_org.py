from tests.constants import PROTECTED_CUSTODIAN_AUTH
from tests.utils import _gen_random_n_digit_number, _gen_random_str, patch, get


def test_business_info(sandbox_tenant):
    for _ in range(2):
        nonce = _gen_random_str(5)
        biz_info = dict(
            company_name=f"Bob's Pancakes, Inc. {nonce}",
            address_line1=f"123 {nonce} St.",
            city=f"{nonce}ville",
            state=f"CA",
            zip=f"{_gen_random_n_digit_number(5)}",
            phone=f"{_gen_random_n_digit_number(10)}",
        )
        patch(
            f"/private/protected/org/{sandbox_tenant.id}/business_info",
            biz_info,
            *sandbox_tenant.db_auths,
        )
        body = get(
            f"/private/protected/org/{sandbox_tenant.id}/business_info",
            None,
            *sandbox_tenant.db_auths,
        )
        assert body["company_name"] == biz_info["company_name"]
        assert body["address_line1"] == biz_info["address_line1"]
        assert body["city"] == biz_info["city"]
        assert body["state"] == biz_info["state"]
        assert body["zip"] == biz_info["zip"]
        assert body["phone"] == biz_info["phone"]
