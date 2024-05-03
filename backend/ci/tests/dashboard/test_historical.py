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
    te = next(
        t
        for t in timeline
        if t["event"]["kind"] == "data_collected"
        and set(t["event"]["data"]["attributes"]) == {"phone_number", "email"}
    )

    # At the time the email and phone are added, we should see the email and phone
    data = dict(seqno=te["seqno"])
    body = get(f"entities/{user.fp_id}/data", data, *sandbox_tenant.db_auths)
    dis = set(i["identifier"] for i in body)
    assert dis == {
        "id.phone_number",
        "id.email",
    }, "Should no longer have address, name, etc DIs"

    # Then, look at an earlier seqno, should be missing phone and email
    data = dict(seqno=te["seqno"] - 100)
    body = get(f"entities/{user.fp_id}/data", data, *sandbox_tenant.db_auths)
    dis = set(i["identifier"] for i in body)
    assert not dis, "Should no longer have any data"
