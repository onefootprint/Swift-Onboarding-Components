from tests.utils import post, patch, get


def test_timeline_data_added(sandbox_tenant):
    """
    Test the timeline events created when making a new vault and updating its data.
    """
    data = {"id.first_name": "Hayes", "id.ssn9": "111-11-1111"}
    body = post("users", data, sandbox_tenant.sk.key)

    fp_id = body["id"]
    data = {"id.email": "hayes@valley.com"}
    patch(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    vault_created_event = next(
        i["event"] for i in body["data"] if i["event"]["kind"] == "vault_created"
    )
    assert vault_created_event["data"]["actor"]["id"] == sandbox_tenant.sk.id
    data_collected_events = [
        i["event"] for i in body["data"] if i["event"]["kind"] == "data_collected"
    ]
    assert len(data_collected_events) == 2
    assert set(data_collected_events[1]["data"]["attributes"]) == {"ssn9", "us_tax_id"}
    assert set(data_collected_events[1]["data"]["targets"]) == {
        "id.first_name",
        "id.ssn9",
        "id.ssn4",
        "id.us_tax_id",
    }
    assert data_collected_events[0]["data"]["attributes"] == ["email"]
    assert data_collected_events[0]["data"]["targets"] == ["id.email"]
    assert all(
        e["data"]["actor"]["id"] == sandbox_tenant.sk.id for e in data_collected_events
    )
