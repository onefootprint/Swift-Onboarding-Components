from tests.utils import _gen_random_str, post
from tests.utils import get


def create_user(sk, email, name):
    data = {"id.email": email, "id.first_name": name}
    res = post("users/", data, sk)
    return res["id"]


def test_dupes(tenant):
    email = f"boberttech_{_gen_random_str(5)}@boberto.com"
    fp_id1 = create_user(tenant.l_sk, email, "Bob1")
    fp_id2 = create_user(tenant.l_sk, email, "Bob2")
    prod_fp_id = create_user(
        tenant.s_sk, email, "Bob3"
    )  # a sandbox vault shouldn't appear as a dupe for a live vault
    create_user(tenant.l_sk, f"bobertotech_{_gen_random_str(5)}@boberto.com", "Bob4")

    dupes = get(f"entities/{fp_id1}/dupes", None, tenant.l_sk)
    assert len(dupes["same_tenant"]) == 1
    assert dupes["same_tenant"][0]["fp_id"] == fp_id2
    assert dupes["same_tenant"][0]["dupe_kinds"] == ["email"]
    assert "status" in dupes["same_tenant"][0]
    assert "start_timestamp" in dupes["same_tenant"][0]
    assert (
        next(
            d
            for d in dupes["same_tenant"][0]["data"]
            if d["identifier"] == "id.first_name"
        )["value"]
        == "Bob2"
    )
    assert not any(
        d["identifier"] == "id.email" for d in dupes["same_tenant"][0]["data"]
    )
    assert dupes["other_tenant"] == {"num_matches": 0, "num_tenants": 0}

    # the singular live vault is shown as having no dupes
    live_dupes = get(f"entities/{prod_fp_id}/dupes", None, tenant.s_sk)
    assert live_dupes["same_tenant"] == []
    assert live_dupes["other_tenant"] is None
