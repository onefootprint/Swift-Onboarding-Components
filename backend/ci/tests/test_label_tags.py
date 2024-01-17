"""
Test creating and deactivating labels, test creating and deactivating tags
"""
from tests.utils import get, post, delete


def test_create_label(sandbox_user, sandbox_tenant):
    data = {"kind": "active"}
    post(f"/users/{sandbox_user.fp_id}/label", data, sandbox_tenant.sk.key)
    body = get(f"/users/{sandbox_user.fp_id}/label", None, sandbox_tenant.sk.key)
    assert body["kind"] == "active"

    data = {"kind": "offboard_fraud"}
    post(f"/users/{sandbox_user.fp_id}/label", data, sandbox_tenant.sk.key)
    body = get(f"/users/{sandbox_user.fp_id}/label", None, sandbox_tenant.sk.key)
    assert body["kind"] == "offboard_fraud"

    body = get(f"/entities/{sandbox_user.fp_id}", data, *sandbox_tenant.db_auths)
    assert body["label"] == "offboard_fraud"


def test_create_tag(sandbox_user, sandbox_tenant):
    data = {"tag": "delinquent"}
    tag = post(f"/users/{sandbox_user.fp_id}/tags", data, sandbox_tenant.sk.key)

    body = get(f"/users/{sandbox_user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert body[0]["tag"] == "delinquent"

    data = {"tag": "flerp_derp_blerp"}
    tag2 = post(f"/users/{sandbox_user.fp_id}/tags", data, sandbox_tenant.sk.key)
    body = get(f"/users/{sandbox_user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert body[0]["tag"] == "delinquent"
    assert body[1]["tag"] == "flerp_derp_blerp"

    tag_id = tag["id"]
    delete(f"/users/{sandbox_user.fp_id}/tags/{tag_id}", None, sandbox_tenant.sk.key)
    body = get(f"/users/{sandbox_user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert len(body) == 1
    assert body[0]["tag"] == "flerp_derp_blerp"
