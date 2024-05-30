from tests.bifrost_client import BifrostClient
from tests.utils import get, create_ob_config, post
from tests.utils import open_multipart_file


def test_historical_data(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
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


def test_historical_documents(sandbox_tenant, must_collect_data):
    # First, make a user with lots of documents
    data = [*must_collect_data, "document.drivers_license.us_only.require_selfie"]
    obc = create_ob_config(
        sandbox_tenant,
        "Lots of documents",
        data,
        data,
        documents_to_collect=[
            dict(
                kind="custom",
                data=dict(
                    name="Utility bill",
                    identifier="document.custom.utility_bill",
                    description="Please upload a utility bill that shows your full name and address.",
                ),
            )
        ],
    )
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()
    post(
        f"users/{user.fp_id}/vault/document.id_card.front.image/upload",
        None,
        sandbox_tenant.sk.key,
        files=open_multipart_file("drivers_license.front.png", "image/png")(),
    )

    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)

    dl_uploaded_event = next(
        te
        for te in timeline
        if te["event"]["kind"] == "document_uploaded"
        and te["event"]["data"]["document_type"] == "drivers_license"
    )
    utility_bill_event = next(
        te
        for te in timeline
        if te["event"]["kind"] == "document_uploaded"
        and te["event"]["data"]["document_type"] == "custom"
    )
    api_id_card_event = next(
        te
        for te in timeline
        if te["event"]["kind"] == "data_collected"
        and "document.id_card.front.image" in te["event"]["data"]["targets"]
    )
    assert dl_uploaded_event["seqno"] < utility_bill_event["seqno"]
    assert utility_bill_event["seqno"] < api_id_card_event["seqno"]

    # At each of these timeline events, we should see all documents that have been uploaded so far
    tests = [
        (dl_uploaded_event, {"drivers_license"}),
        (utility_bill_event, {"drivers_license", "custom"}),
        (api_id_card_event, {"drivers_license", "custom", "id_card"}),
    ]
    for te, expected_docs in tests:
        data = dict(seqno=te["seqno"])
        body = get(f"entities/{user.fp_id}/documents", data, *sandbox_tenant.db_auths)
        visible_docs = {i["kind"] for i in body}
        assert visible_docs == expected_docs

    # If we look at a seqno from the middle of uploading DL, we should only see the sides that were
    # uploaded at that time
    body = get(f"entities/{user.fp_id}/documents", None, *sandbox_tenant.db_auths)
    dl_doc = next(d for d in body if d["kind"] == "drivers_license")
    ordered_uploads = sorted(dl_doc["uploads"], key=lambda x: x["version"])
    uploaded_sides = set()
    for upload in ordered_uploads:
        uploaded_sides.add(upload["side"])
        data = dict(seqno=upload["version"])
        body = get(f"entities/{user.fp_id}/documents", data, *sandbox_tenant.db_auths)
        assert {i["kind"] for i in body} == {"drivers_license"}
        visible_sides = {i["side"] for i in body[0]["uploads"]}
        assert visible_sides == uploaded_sides

    # If we look at the earliest seqno, we should see no documents
    data = dict(seqno=timeline[-1]["seqno"] - 100)
    body = get(f"entities/{user.fp_id}/documents", data, *sandbox_tenant.db_auths)
    assert not body


def test_historical_risk_signals(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}/risk_signals", None, *sandbox_tenant.db_auths)
    assert body, "Should have risk signals"

    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)

    # First even should have no risk signals
    first_event = timeline[-1]
    data = dict(seqno=first_event["seqno"])
    body = get(f"entities/{user.fp_id}/risk_signals", data, *sandbox_tenant.db_auths)
    assert not body, "Should not have risk signals at first timeline event"

    # Event with decision should have risk signals
    decision_event = next(
        te for te in timeline if te["event"]["kind"] == "onboarding_decision"
    )
    data = dict(seqno=decision_event["seqno"])
    body = get(f"entities/{user.fp_id}/risk_signals", data, *sandbox_tenant.db_auths)
    assert body, "Should have risk signals at decision event"
