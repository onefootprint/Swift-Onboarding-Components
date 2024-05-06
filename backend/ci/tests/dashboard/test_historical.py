from tests.bifrost_client import BifrostClient
from tests.utils import get


def test_historical_data(sandbox_tenant):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    data = get(f"entities/{user.fp_id}/data", None, *sandbox_tenant.db_auths)
    dis = set(i["identifier"] for i in data)
    assert dis > {
        "id.phone_number",
        "id.email",
        "id.first_name",
        "id.last_name",
        "id.address_line1",
    }

    # Then, look at data at the earliest timeline event where phone and email were added
    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    timeline.reverse()

    # Iterate through the timeline in time asc and keep track of all seen identifiers.
    # At the seqno of a given timeline event, we should see all data added up to that point.
    all_seen_dis = set()
    for te in timeline:
        if te["event"]["kind"] != "data_collected":
            continue
        all_seen_dis.update(te["event"]["data"]["targets"])

        # At the time the email and phone are added, we should see the email and phone
        data = dict(seqno=te["seqno"])
        body = get(f"entities/{user.fp_id}/data", data, *sandbox_tenant.db_auths)
        dis_at_seqno = set(i["identifier"] for i in body)
        assert dis_at_seqno >= all_seen_dis

    # Sanity check that we went through relevant timeline events
    assert all_seen_dis >= {
        "id.phone_number",
        "id.email",
        "id.first_name",
        "id.last_name",
        "id.address_line1",
    }

    # Then, look at earliest seqno, should be missing phone and email
    data = dict(seqno=timeline[-1]["seqno"] - 100)
    body = get(f"entities/{user.fp_id}/data", data, *sandbox_tenant.db_auths)
    dis = set(i["identifier"] for i in body)
    assert not dis, "Should no longer have any data"
