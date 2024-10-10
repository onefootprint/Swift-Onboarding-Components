import pytest
import arrow
from tests.bifrost_client import BifrostClient
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import get, patch, post


@pytest.fixture(scope="module")
def sandbox_user2(sandbox_tenant):
    # Another sandbox user for endpoints that need multiple
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    return bifrost.run()


@pytest.fixture(scope="module")
def incomplete_user(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    body = get("hosted/user/private/token", None, bifrost.auth_token)
    return body["fp_id"]


@pytest.fixture(scope="module")
def vault_user(sandbox_tenant):
    return post("users", None, sandbox_tenant.sk.key)["id"]


def test_get_users_list(incomplete_user, sandbox_user2, vault_user, sandbox_user):
    tenant = sandbox_user.tenant
    body = post(
        "entities/search", dict(pagination=dict(page_size=100)), *tenant.db_auths
    )
    scoped_users = body["data"]
    assert len(scoped_users)

    # Check both scoped users exist
    all_fp_ids = [
        sandbox_user.fp_id,
        sandbox_user2.fp_id,
        vault_user,
        incomplete_user,
    ]
    assert set(u["id"] for u in scoped_users) > set(all_fp_ids)
    for fp_id in [sandbox_user.fp_id, sandbox_user2.fp_id]:
        scoped_user = next(u for u in scoped_users if u["id"] == fp_id)
        assert set(["id.first_name", "id.last_name"]) < set(scoped_user["attributes"])
        assert scoped_user["status"] == "pass"


def test_get_users_by_fp_id_query(sandbox_user):
    tenant = sandbox_user.tenant
    body = post("entities/search", {"search": sandbox_user.fp_id}, *tenant.db_auths)
    scoped_users = body["data"]
    assert len(scoped_users) == 1
    assert scoped_users[0]["id"] == sandbox_user.fp_id


@pytest.mark.parametrize(
    "filters,expected_user_idxs",
    [
        (dict(statuses="pass"), [0, 1]),
        (dict(statuses="fail"), []),
        (dict(statuses="none"), [2]),
        (dict(statuses="incomplete"), [3]),
        (dict(statuses="pass,none"), [0, 1, 2]),
        (dict(statuses="pass,incomplete"), [0, 1, 3]),
        (dict(statuses="pass,incomplete,none"), [0, 1, 2, 3]),
    ],
)
def test_get_users_filter(
    incomplete_user,
    sandbox_user,
    sandbox_user2,
    vault_user,
    filters,
    expected_user_idxs,
):
    tenant = sandbox_user.tenant
    data = dict(pagination=dict(page_size=100), **filters)
    body = post("entities/search", data, *tenant.db_auths)
    scoped_users = body["data"]
    all_fp_ids = [
        sandbox_user.fp_id,
        sandbox_user2.fp_id,
        vault_user,
        incomplete_user,
    ]
    expected_user_ids = [all_fp_ids[i] for i in expected_user_idxs]
    assert set(u["id"] for u in scoped_users) >= set(expected_user_ids)


def test_get_users_filter_workflow_request(sandbox_user2):
    tenant = sandbox_user2.tenant

    filters = dict(
        pagination=dict(page_size=100), has_outstanding_workflow_request=False
    )
    body = post("entities/search", filters, *tenant.db_auths)
    assert any(i["id"] == sandbox_user2.fp_id for i in body["data"])

    filters = dict(
        pagination=dict(page_size=100), has_outstanding_workflow_request=True
    )
    body = post("entities/search", filters, *tenant.db_auths)
    assert not any(i["id"] == sandbox_user2.fp_id for i in body["data"])

    trigger = dict(
        kind="onboard", data=dict(playbook_id=sandbox_user2.client.ob_config.id)
    )
    action = dict(trigger=trigger, note="Flerp", kind="trigger")
    data = dict(actions=[action])
    body = post(f"entities/{sandbox_user2.fp_id}/actions", data, *tenant.db_auths)

    filters = dict(
        pagination=dict(page_size=100), has_outstanding_workflow_request=True
    )
    body = post("entities/search", filters, *tenant.db_auths)
    assert any(i["id"] == sandbox_user2.fp_id for i in body["data"])

    filters = dict(
        pagination=dict(page_size=100), has_outstanding_workflow_request=False
    )
    body = post("entities/search", filters, *tenant.db_auths)
    assert not any(i["id"] == sandbox_user2.fp_id for i in body["data"])


def test_get_users_list_pagination(sandbox_user, sandbox_user2):
    sandbox_user2  # Not used, but need the fixture
    tenant = sandbox_user.tenant
    # Test paginated request with filters
    filters = dict(pagination=dict(page_size=1), statuses="pass")
    body = post("entities/search", filters, *tenant.db_auths)
    assert len(body["data"]) == 1
    next_cursor = body["meta"]["next"]
    assert next_cursor  # Should be more than one page
    # Make sure the cursor is a nanosecond-encoded timestamp
    assert arrow.get(int(next_cursor) / 1000) > arrow.now().shift(days=-1)
    filters = dict(pagination=dict(cursor=next_cursor, page_size=1), statuses="pass")
    body = post("entities/search", filters, *tenant.db_auths)
    assert len(body["data"]) == 1


def test_get_users_detail(sandbox_user):
    tenant = sandbox_user.tenant
    scoped_user = get(f"entities/{sandbox_user.fp_id}", None, *tenant.db_auths)
    assert set(["id.first_name", "id.last_name"]) < set(scoped_user["attributes"])


# TODO no longer have coverage here of uploading without selfie - somewhere else?
def test_get_users_detail_doc(
    sandbox_user,
    doc_request_sandbox_ob_config,
):
    tenant = sandbox_user.tenant
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    user = bifrost.run()

    res = get(f"entities/{user.fp_id}", None, *tenant.db_auths)
    assert "document.drivers_license.front.image" in res["attributes"]
    assert "document.drivers_license.back.image" in res["attributes"]
    assert "document.drivers_license.selfie.image" in res["attributes"]


def test_timeline(sandbox_user):
    body = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        *sandbox_user.tenant.db_auths,
    )
    assert any(i["event"]["kind"] == "data_collected" for i in body)
    decision_event = next(
        i for i in body if i["event"]["kind"] == "onboarding_decision"
    )
    assert decision_event["event"]["data"]["decision"]["status"] == "pass"
    assert decision_event["event"]["data"]["decision"]["source"]["kind"] == "footprint"
    workflow_started_event = next(
        i for i in body if i["event"]["kind"] == "workflow_started"
    )
    assert (
        workflow_started_event["event"]["data"]["playbook"]["id"]
        == sandbox_user.client.ob_config.id
    )

    # Test filtering
    body = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        dict(kinds="onboarding_decision"),
        *sandbox_user.tenant.db_auths,
    )
    assert len(body) == 1
    assert body[0] == decision_event


def test_audit_events_list(sandbox_user):
    # Make some decryptions to make audit events
    tenant = sandbox_user.tenant
    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "fields": attributes,
            "reason": "Doing a hecking decrypt",
        }
        body = post(
            f"entities/{sandbox_user.fp_id}/vault/decrypt",
            data,
            *tenant.db_auths,
        )

    # Then check the audit event list
    body = get(
        "org/audit_events",
        dict(search=sandbox_user.fp_id),
        *tenant.db_auths,
    )
    audit_events = body["data"]
    assert len(audit_events) == len(FIELDS_TO_DECRYPT)
    for expected_fields in FIELDS_TO_DECRYPT:
        assert any(
            event["name"] == "decrypt_user_data"
            and set(event["detail"]["data"]["decrypted_fields"]) == set(expected_fields)
            for event in audit_events
        )

    # Test filtering on kinds. We provide two different kinds, and we should get all audit events
    # that contain at least one of these fields
    params = dict(
        search=sandbox_user.fp_id,
        targets=",".join(["id.email", "id.address_line1"]),
        kind="decrypt",
    )
    body = get("org/audit_events", params, *tenant.db_auths)
    audit_events = body["data"]
    assert len(audit_events) == 2
    assert "id.email" in set(audit_events[0]["detail"]["data"]["decrypted_fields"])
    assert "id.address_line1" in set(
        audit_events[1]["detail"]["data"]["decrypted_fields"]
    )

    # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
    params = dict(timestamp_gte=arrow.utcnow().shift(days=1).isoformat())
    body = get("org/audit_events", params, *tenant.db_auths)
    assert len(body["data"]) == 0


def test_update_data_for_portable_user(sandbox_user):
    # Should be allowed to overwrite data for users that onboarded via bifrost
    fp_id = sandbox_user.fp_id
    decrypt_req = dict(reason="test", fields=["id.ssn9"])
    body = post(
        f"entities/{fp_id}/vault/decrypt", decrypt_req, sandbox_user.tenant.sk.key
    )
    assert body["id.ssn9"]

    # Even though the vault is portable, we should be able to update the data
    for new_ssn in ["120981234", "098765432"]:
        new_data = {"id.ssn9": new_ssn}
        patch(f"entities/{fp_id}/vault", new_data, sandbox_user.tenant.sk.key)

        # Make sure we see the new ssn
        body = post(
            f"entities/{fp_id}/vault/decrypt", decrypt_req, sandbox_user.tenant.sk.key
        )
        assert body["id.ssn9"] == new_ssn


def test_override_onboarding_decision(sandbox_user):
    tenant = sandbox_user.tenant

    scoped_user = get(f"entities/{sandbox_user.fp_id}", None, *tenant.db_auths)
    assert scoped_user["status"] == "pass"

    event_kinds = dict(kinds="onboarding_decision")
    events = get(
        f"entities/{sandbox_user.fp_id}/timeline", event_kinds, *tenant.db_auths
    )
    event = events[0]["event"]
    assert event["data"]["decision"]["source"]["kind"] == "footprint"

    test_note = "This is a test note. Flerp derp"
    action = dict(
        annotation=dict(note=test_note, is_pinned=True),
        status="fail",
        kind="manual_decision",
    )
    decision_data = dict(actions=[action])
    post(f"entities/{sandbox_user.fp_id}/actions", decision_data, *tenant.db_auths)

    scoped_user = get(f"entities/{sandbox_user.fp_id}", None, *tenant.db_auths)
    assert scoped_user["status"] == "fail"
    # Assert the latest decision is a manual decision
    events = get(
        f"entities/{sandbox_user.fp_id}/timeline", event_kinds, *tenant.db_auths
    )
    event = events[0]["event"]
    assert event["data"]["decision"]["source"]["kind"] == "organization"
    assert "@onefootprint.com" in event["data"]["decision"]["source"]["member"]

    # Assert that the annotation is pinned
    pinned_annotations = get(
        f"entities/{sandbox_user.fp_id}/annotations",
        dict(is_pinned="true"),
        *tenant.db_auths,
    )
    annotation = pinned_annotations[0]
    assert annotation["is_pinned"]
    assert annotation["note"] == test_note
    assert "@onefootprint.com" in annotation["source"]["member"]


def test_get_annotations(sandbox_user):
    note1 = "this user is chill"
    # Actor = TenantApiKey
    annotation1 = post(
        f"entities/{sandbox_user.fp_id}/annotations",
        dict(
            note=note1,
            is_pinned=False,
        ),
        *sandbox_user.tenant.db_auths,
    )

    annotations = get(
        f"entities/{sandbox_user.fp_id}/annotations",
        None,
        *sandbox_user.tenant.db_auths,
    )
    annotations.sort(key=lambda x: x["timestamp"])

    assert annotation1["id"] == annotations[-1]["id"]
    assert annotation1["note"] == note1
    assert annotation1["source"]["kind"] == "organization"
    assert annotation1["is_pinned"] == False

    note2 = "ok mb they are a little sketch"
    # Actor = TenantUser
    annotation2 = post(
        f"entities/{sandbox_user.fp_id}/annotations",
        dict(
            note=note2,
            is_pinned=True,
        ),
        *sandbox_user.tenant.db_auths,
    )

    annotations = get(
        f"entities/{sandbox_user.fp_id}/annotations",
        None,
        *sandbox_user.tenant.db_auths,
    )
    annotations.sort(key=lambda x: x["timestamp"])

    assert annotation2["id"] == annotations[-1]["id"]
    assert annotation2["note"] == note2
    assert annotation2["source"]["kind"] == "organization"
    assert (
        " (integrationtests@onefootprint.com)" in annotation2["source"]["member"]
    )  # I guess there's no way to get the tenant user from Tenant so we just hard code this?
    assert annotation2["is_pinned"] == True


def test_update_data(sandbox_tenant):
    """
    Test updating an existing vault from the dashboard
    """
    data = {"id.first_name": "Flerp", "id.last_name": "Derp"}
    fp_id = post("users", data, sandbox_tenant.sk.key)["id"]
    data = {"id.first_name": "Hayes", "id.last_name": "Valley"}
    patch(f"users/{fp_id}/vault", data, *sandbox_tenant.db_auths)

    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    event = body[0]["event"]
    assert event["kind"] == "data_collected"
    assert event["data"]["attributes"] == ["name"]
    assert event["data"]["actor"]["kind"] == "organization"
    # And the initial event that added the name
    event = body[1]["event"]
    assert event["kind"] == "data_collected"
    assert event["data"]["attributes"] == ["name"]
    assert event["data"]["actor"]["kind"] == "api_key"


def test_entity_data(sandbox_user, sandbox_tenant):
    """
    Check the data attribute in the GET entities list and detail endpoints, including the data
    that is auto decrypted.
    """
    data = dict(pagination=dict(page_size=100))
    body = post("entities/search", data, *sandbox_tenant.db_auths)
    user_list = next(u for u in body["data"] if u["id"] == sandbox_user.fp_id)
    user_detail = get(f"entities/{sandbox_user.fp_id}", None, *sandbox_tenant.db_auths)

    for user in [user_list, user_detail]:
        first_name = next(d for d in user["data"] if d["identifier"] == "id.first_name")
        assert (
            first_name["value"] == sandbox_user.client.decrypted_data["id.first_name"]
        )
        assert not first_name["transforms"]
        assert first_name["source"] == "hosted"
        assert first_name["is_decryptable"]
        assert first_name["data_kind"] == "vault_data"

        last_name = next(d for d in user["data"] if d["identifier"] == "id.last_name")
        assert not last_name["value"]
        assert (
            last_name["transforms"]["prefix(1)"]
            == sandbox_user.client.decrypted_data["id.last_name"][0]
        )
        assert last_name["source"] == "hosted"
        assert last_name["is_decryptable"]
        assert last_name["data_kind"] == "vault_data"

        phone_number = next(
            d for d in user["data"] if d["identifier"] == "id.phone_number"
        )
        assert not phone_number["value"]
        assert not phone_number["transforms"]
        assert phone_number["source"] == "hosted"
        assert phone_number["is_decryptable"]
        assert phone_number["data_kind"] == "vault_data"


def test_missing_decrypt_permissions(sandbox_user, sandbox_tenant):
    """
    Check the a dashboard user without decrypt permissions cannot see a user's first name decrypted
    """
    user = get(f"entities/{sandbox_user.fp_id}", None, *sandbox_tenant.ro_db_auths)
    first_name = next(d for d in user["data"] if d["identifier"] == "id.first_name")
    assert not first_name["value"]
    assert not first_name["transforms"]

    last_name = next(d for d in user["data"] if d["identifier"] == "id.last_name")
    assert not last_name["value"]
    assert not last_name["transforms"]
