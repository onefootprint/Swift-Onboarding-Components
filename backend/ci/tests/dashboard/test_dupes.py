from tests.utils import _gen_random_str, post
from tests.utils import get


def create_user(tenant, email):
    data = {"id.email": email}
    res = post("users/", data, tenant.sk.key)
    return res["id"]


def test_dupes(sandbox_tenant):
    email = f"boberttech_{_gen_random_str(5)}@boberto.com"
    fp_id1 = create_user(sandbox_tenant, email)
    fp_id2 = create_user(sandbox_tenant, email)
    create_user(sandbox_tenant, f"boberttech_{_gen_random_str(5)}@boberto.com")

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.sk.key)

    assert len(dupes["same_tenant"]) == 1
    assert dupes["same_tenant"][0]["fp_id"] == fp_id2
    assert dupes["same_tenant"][0]["dupe_kinds"] == ["email"]
    assert dupes["other_tenant"] == {"num_matches": 0, "num_tenants": 0}
