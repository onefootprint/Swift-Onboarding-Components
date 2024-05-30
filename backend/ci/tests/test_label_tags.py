"""
Test creating and deactivating labels, test creating and deactivating tags
"""

from tests.utils import get, post, delete
from tests.bifrost_client import BifrostClient


def test_create_label(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    data = {"kind": "active"}
    post(f"/users/{user.fp_id}/label", data, sandbox_tenant.sk.key)
    body = get(f"/users/{user.fp_id}/label", None, sandbox_tenant.sk.key)
    assert body["kind"] == "active"

    data = {"kind": "offboard_fraud"}
    post(f"/users/{user.fp_id}/label", data, sandbox_tenant.sk.key)
    body = get(f"/users/{user.fp_id}/label", None, sandbox_tenant.sk.key)
    assert body["kind"] == "offboard_fraud"

    # Make sure the label is included in the entity serialization
    body = get(f"/entities/{user.fp_id}", data, *sandbox_tenant.db_auths)
    assert body["label"] == "offboard_fraud"

    # Test searching on label
    body = post(
        f"/entities/search", dict(labels=["offboard_fraud"]), *sandbox_tenant.db_auths
    )
    assert any(i["id"] == user.fp_id for i in body["data"])
    body = post(f"/entities/search", dict(labels=["active"]), *sandbox_tenant.db_auths)
    assert not any(i["id"] == user.fp_id for i in body["data"])

    # Make sure we have a timeline event for updating the labels
    body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    label_events = [
        i["event"]["data"]["kind"] for i in body if i["event"]["kind"] == "label_added"
    ]
    assert label_events == ["offboard_fraud", "active"]


def test_create_tag(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    data = {"tag": "delinquent"}
    tag = post(f"/users/{user.fp_id}/tags", data, sandbox_tenant.sk.key)

    body = get(f"/users/{user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert body[0]["tag"] == "delinquent"

    data = {"tag": "flerp_derp_blerp"}
    post(f"/users/{user.fp_id}/tags", data, sandbox_tenant.sk.key)
    body = get(f"/users/{user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert body[0]["tag"] == "delinquent"
    assert body[1]["tag"] == "flerp_derp_blerp"

    tag_id = tag["id"]
    delete(f"/users/{user.fp_id}/tags/{tag_id}", None, sandbox_tenant.sk.key)
    body = get(f"/users/{user.fp_id}/tags", None, sandbox_tenant.sk.key)
    assert len(body) == 1
    assert body[0]["tag"] == "flerp_derp_blerp"
