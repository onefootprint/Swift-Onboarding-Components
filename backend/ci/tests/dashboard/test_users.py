import pytest
import arrow
from tests.bifrost_client import BifrostClient, DocumentDataOptions
from tests.utils import build_user_data
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import (
    get,
    put,
    post,
    _gen_random_ssn,
    create_sandbox_user,
)
from tests.auth import (
    DashboardAuthIsLive,
)


@pytest.fixture(scope="module")
def sandbox_user2(sandbox_tenant, twilio):
    # Another sandbox user for endpoints that need multiple
    return create_sandbox_user(sandbox_tenant, twilio)


def test_get_org(sandbox_user):
    body = get("org", None, sandbox_user.tenant.sk.key)
    tenant = body
    assert tenant["name"] == sandbox_user.tenant.name
    assert not tenant["is_sandbox_restricted"]
    tenant["logo_url"]


def test_get_users_list(sandbox_user, sandbox_user2):
    tenant = sandbox_user.tenant
    body = get("users", None, tenant.sk.key)
    scoped_users = body["data"]
    assert len(scoped_users)

    # Check both scoped users exist
    for fp_user_id in [sandbox_user.fp_user_id, sandbox_user2.fp_user_id]:
        scoped_user = next(u for u in scoped_users if u["id"] == fp_user_id)
        assert set(["first_name", "last_name"]) < set(
            scoped_user["identity_data_attributes"]
        )
        assert set(["id.first_name", "id.last_name"]) < set(scoped_user["attributes"])


def test_get_users_list_pagination(sandbox_user, sandbox_user2):
    sandbox_user2  # Not used, but need the fixture
    tenant = sandbox_user.tenant
    # Test paginated request with filters
    body = get("users", dict(page_size=1, statuses="pass"), tenant.sk.key)
    assert len(body["data"]) == 1
    next_cursor = body["meta"]["next"]
    assert next_cursor  # Should be more than one page
    body = get(
        "users",
        dict(page_size=1, cursor=next_cursor, statuses="pass"),
        tenant.sk.key,
    )
    assert len(body["data"]) == 1


def test_get_users_detail(sandbox_user):
    tenant = sandbox_user.tenant
    scoped_user = get(f"users/{sandbox_user.fp_user_id}", None, tenant.sk.key)
    assert set(["first_name", "last_name"]) < set(
        scoped_user["identity_data_attributes"]
    )


@pytest.mark.parametrize(
    "document_data,expected_identity_document_info",
    [
        (DocumentDataOptions.front_back, [{'type': 'passport', 'status': 'success', 'selfie_collected': False}]),
        (DocumentDataOptions.front_back_selfie, [{'type': 'passport', 'status': 'success', 'selfie_collected': True}]),
    ],
)
def test_get_users_detail_doc_and_selfie(
    sandbox_user,
    twilio,
    doc_request_sandbox_ob_config,
    document_data,
    expected_identity_document_info,
):
    tenant = sandbox_user.tenant
    bifrost_client = BifrostClient(doc_request_sandbox_ob_config)
    bifrost_client.init_user_for_onboarding(twilio, document_data=document_data)
    user = bifrost_client.onboard_user_onto_tenant(tenant)

    res = get(f"users/{user.fp_user_id}", None, tenant.sk.key)
    assert res["identity_document_info"] == expected_identity_document_info


def test_liveness_list(sandbox_user):
    tenant = sandbox_user.tenant
    body = get(f"users/{sandbox_user.fp_user_id}/liveness", None, tenant.sk.key)
    creds = body
    assert len(creds)
    assert creds[0]["insight_event"]


def test_access_events_list(sandbox_user):
    # Make some decryptions to make access events
    tenant = sandbox_user.tenant
    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "fields": attributes,
            "reason": "Doing a hecking decrypt",
        }
        body = post(
            f"users/{sandbox_user.fp_user_id}/vault/decrypt",
            data,
            tenant.sk.key,
        )

    # Then check the access event list
    body = get(
        "org/access_events",
        dict(footprint_user_id=sandbox_user.fp_user_id),
        tenant.sk.key,
    )
    access_events = body["data"]
    assert len(access_events) == len(FIELDS_TO_DECRYPT)
    for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
        expected_targets = [f"id.{k}" for k in expected_fields]
        access_events[i]["kind"] == "decrypt"
        assert set(access_events[i]["targets"]) == set(expected_targets)

    # Test filtering on kinds. We provide two different kinds, and we should get all access events
    # that contain at least one of these fields
    params = dict(
        footprint_user_id=sandbox_user.fp_user_id,
        targets=",".join(["id.email", "id.address_line1"]),
        kind="decrypt",
    )
    body = get("org/access_events", params, tenant.sk.key)
    access_events = body["data"]
    assert len(access_events) == 2
    assert "id.email" in set(access_events[0]["targets"])
    assert "id.address_line1" in set(access_events[1]["targets"])

    # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
    params = dict(timestamp_gte=arrow.utcnow().shift(days=1).isoformat())
    body = get("org/access_events", params, tenant.sk.key)
    assert not body["data"]


def test_portable_failed_data_write(sandbox_user):
    data = dict(reason="test", fields=["id.first_name", "id.ssn9"])
    body = post(
        f"users/{sandbox_user.fp_user_id}/vault/decrypt",
        data,
        sandbox_user.tenant.sk.key,
    )
    assert body["id.first_name"]

    data = {
        "id.dob": "1970-01-01",
        "id.ssn9": _gen_random_ssn(),
    }

    # ensure we cannot change data in a portable vault
    put(
        f"users/{sandbox_user.fp_user_id}/vault",
        data,
        sandbox_user.tenant.sk.key,
        status_code=401,
    )


def test_override_onboarding_decision(sandbox_user):
    tenant = sandbox_user.tenant

    scoped_user = get(f"users/{sandbox_user.fp_user_id}", None, tenant.sk.key)
    onboarding = scoped_user["onboarding"]
    assert onboarding["status"] == "pass"
    latest_decision = onboarding["latest_decision"]
    assert latest_decision["status"] == onboarding["status"]
    assert latest_decision["source"]["kind"] == "footprint"

    test_note = "This is a test note. Flerp derp"
    decision_data = dict(
        annotation=dict(note=test_note, is_pinned=True),
        status="fail",
    )
    post(
        f"users/{sandbox_user.fp_user_id}/decisions",
        decision_data,
        tenant.auth_token,
        DashboardAuthIsLive("false"),
    )

    scoped_user = get(f"users/{sandbox_user.fp_user_id}", None, tenant.sk.key)
    onboarding = scoped_user["onboarding"]
    assert onboarding["status"] == "fail"
    # Assert the latest decision is a manual decision
    latest_decision = onboarding["latest_decision"]
    assert latest_decision["status"] == onboarding["status"]
    assert latest_decision["source"]["kind"] == "organization"
    assert "@onefootprint.com" in latest_decision["source"]["member"]

    # Assert that the annotation is pinned
    pinned_annotations = get(
        f"users/{sandbox_user.fp_user_id}/annotations",
        dict(is_pinned="true"),
        tenant.sk.key,
    )
    annotation = pinned_annotations[0]
    assert annotation["is_pinned"]
    assert annotation["note"] == test_note
    assert "@onefootprint.com" in annotation["source"]["member"]


def test_get_annotations(sandbox_user):
    note1 = "this user is chill"
    # Actor = TenantApiKey
    annotation1 = post(
        f"/users/{sandbox_user.fp_user_id}/annotations",
        dict(
            note=note1,
            is_pinned=False,
        ),
        sandbox_user.tenant.sk.key,
        # `sandbox_user` creates a scoped sandbox_user that is is_live=false but the auths (tenant.sk.key, tenant.auth_token, workos_sandbox_tentnat.auth_token)
        # all are auth.is_live() = true, so I think I need to pass this DashboardAuthIsLive struct on every request? seems weird
        DashboardAuthIsLive("false"),
    )

    annotations = get(
        f"/users/{sandbox_user.fp_user_id}/annotations",
        None,
        sandbox_user.tenant.sk.key,
        DashboardAuthIsLive("false"),
    )
    annotations.sort(key=lambda x: x["timestamp"])

    assert annotation1["id"] == annotations[-1]["id"]
    assert annotation1["note"] == note1
    assert annotation1["source"]["kind"] == "api_key"
    assert annotation1["is_pinned"] == False

    note2 = "ok mb they are a little sketch"
    # Actor = TenantUser
    annotation2 = post(
        f"/users/{sandbox_user.fp_user_id}/annotations",
        dict(
            note=note2,
            is_pinned=True,
        ),
        sandbox_user.tenant.auth_token,
        DashboardAuthIsLive("false"),
    )

    annotations = get(
        f"/users/{sandbox_user.fp_user_id}/annotations",
        None,
        sandbox_user.tenant.auth_token,
        DashboardAuthIsLive("false"),
    )
    annotations.sort(key=lambda x: x["timestamp"])

    assert annotation2["id"] == annotations[-1]["id"]
    assert annotation2["note"] == note2
    assert annotation2["source"]["kind"] == "organization"
    assert (
        " (integrationtests@onefootprint.com)" in annotation2["source"]["member"]
    )  # I guess there's no way to get the tenant user from Tenant so we just hard code this?
    assert annotation2["is_pinned"] == True
