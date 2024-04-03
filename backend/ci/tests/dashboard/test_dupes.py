from tests.utils import _gen_random_str, post
from tests.utils import get


def create_user(sk, email):
    data = {"id.email": email}
    res = post("users/", data, sk)
    return res["id"]


def test_dupes(tenant):
    email = f"boberttech_{_gen_random_str(5)}@boberto.com"
    fp_id1 = create_user(tenant.s_sk, email)
    fp_id2 = create_user(tenant.s_sk, email)
    prod_fp_id = create_user(
        tenant.l_sk, email
    )  # a live vault shouldn't appear as a dupe for a sandbox vault
    create_user(tenant.s_sk, f"bobertotech_{_gen_random_str(5)}@boberto.com")

    dupes = get(f"entities/{fp_id1}/dupes", None, tenant.s_sk)

    assert len(dupes["same_tenant"]) == 1
    assert dupes["same_tenant"][0]["fp_id"] == fp_id2
    assert dupes["same_tenant"][0]["dupe_kinds"] == ["email"]
    assert dupes["other_tenant"] == {"num_matches": 0, "num_tenants": 0}

    # the singular live vault is shown as having no dupes
    len(get(f"entities/{prod_fp_id}/dupes", None, tenant.l_sk)["same_tenant"]) == 0
