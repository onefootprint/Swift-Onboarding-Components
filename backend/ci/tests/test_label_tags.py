"""
Test creating and deactivating labels, test creating and deactivating tags
"""

import pytest
from tests.utils import get, post, delete
from tests.bifrost_client import BifrostClient


@pytest.mark.parametrize("is_api", [True, False])
def test_create_label(sandbox_tenant, is_api):
    if is_api:
        auth = [sandbox_tenant.sk.key]
        api_base = "users"
    else:
        auth = sandbox_tenant.db_auths
        api_base = "entities"

    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    # no label set yet
    body = get(f"/{api_base}/{user.fp_id}/label", None, *auth)
    assert body["kind"] is None
    body = get(f"/entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["label"] is None

    # Add a label
    data = {"kind": "active"}
    post(f"/{api_base}/{user.fp_id}/label", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/label", None, *auth)
    assert body["kind"] == "active"

    # Add a label, should replce
    data = {"kind": "offboard_fraud"}
    post(f"/{api_base}/{user.fp_id}/label", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/label", None, *auth)
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

    # test deactivating
    data = {"kind": None}
    post(f"/{api_base}/{user.fp_id}/label", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/label", None, *auth)
    assert body["kind"] is None

    body = get(f"/entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["label"] is None


@pytest.mark.parametrize("is_api", [True, False])
def test_create_tag(sandbox_tenant, is_api):
    if is_api:
        auth = [sandbox_tenant.sk.key]
        api_base = "users"
    else:
        auth = sandbox_tenant.db_auths
        api_base = "entities"

    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    data = {"tag": "delinquent"}
    tag = post(f"/{api_base}/{user.fp_id}/tags", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/tags", None, *auth)

    assert len(body) == 1
    assert body[0]["tag"] == "delinquent"
    created_time = body[0]["created_at"]

    # create the same tag, no-ops
    post(f"/{api_base}/{user.fp_id}/tags", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/tags", None, *auth)
    assert len(body) == 1
    assert body[0]["tag"] == "delinquent"
    assert created_time == body[0]["created_at"]

    data = {"tag": "flerp_derp_blerp"}
    post(f"/{api_base}/{user.fp_id}/tags", data, *auth)
    body = get(f"/{api_base}/{user.fp_id}/tags", None, *auth)
    assert body[0]["tag"] == "delinquent"
    assert body[1]["tag"] == "flerp_derp_blerp"

    # Make sure the tags exist in entities API
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert set(i["tag"] for i in body["tags"]) == {"delinquent", "flerp_derp_blerp"}

    tag_id = tag["id"]
    delete(f"/{api_base}/{user.fp_id}/tags/{tag_id}", None, *auth)
    body = get(f"/{api_base}/{user.fp_id}/tags", None, *auth)
    assert len(body) == 1
    assert body[0]["tag"] == "flerp_derp_blerp"
