from typing import NamedTuple
import pytest
from tests.utils import get, patch, post
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth


class DualOnboardedUser(NamedTuple):
    fp_id: str
    foo_fp_id: str
    user: any


@pytest.fixture(scope="module")
def dual_onboarded_user(sandbox_user_real_phone, foo_sandbox_tenant, twilio):
    # Create a sandbox user, onboard them onto sandbox_tenant
    fp_id = sandbox_user_real_phone.fp_id

    #
    # Then onboard them onto foo_sandbox_tenant
    #
    phone_number = sandbox_user_real_phone.client.data["id.phone_number"]
    sandbox_id = sandbox_user_real_phone.client.sandbox_id
    foo_bifrost = BifrostClient.inherit(
        foo_sandbox_tenant.default_ob_config, twilio, phone_number, sandbox_id
    )

    # Before the user finishes onboarding to foo_sandbox_tenant, the tenant shouldn't be able to
    # make a token that inherits auth
    body = get("/entities", None, *foo_sandbox_tenant.db_auths)
    user = next(i for i in body["data"] if i["sandbox_id"] == sandbox_id)
    assert user["status"] == "in_progress"
    foo_fp_id = user["id"]

    def get_scopes():
        body = post(f"users/{foo_fp_id}/token", None, foo_sandbox_tenant.sk.key)
        auth_token = FpAuth(body["token"])
        body = get("hosted/user/token", None, auth_token)
        return body["scopes"]

    # Should have no scopes because auth can't be inherited
    assert not get_scopes()

    foo_user = foo_bifrost.run()
    assert foo_user.fp_id == foo_fp_id
    assert [i["kind"] for i in foo_bifrost.handled_requirements] == [
        "authorize",  # Should have authorize here because it's a one-click at another tenant
        "process",
    ]
    assert [i["kind"] for i in foo_bifrost.already_met_requirements] == ["collect_data"]

    # Even after running bifrost, we shouldn't be able to make a token with scopes because
    # foo_tenant's playbook collects less than sandbox_tenant's
    assert not get_scopes()

    return DualOnboardedUser(fp_id, foo_fp_id, sandbox_user_real_phone)


def test_fp_id(dual_onboarded_user):
    # Make sure the fp_ids are different
    assert (
        dual_onboarded_user.fp_id != dual_onboarded_user.foo_fp_id
    ), "Onboarding onto different tenants should give different fp_id"


def test_portable_timeline_events(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_id = dual_onboarded_user.fp_id
    foo_fp_id = dual_onboarded_user.foo_fp_id

    # Timeline events from sandbox_tenant's view belong to self
    body = get(f"/entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    assert body
    assert not any(i["is_from_other_org"] for i in body)

    # But from foo_sandbox_tenant's view, these events are portable and belong to another org
    body = get(
        f"/entities/{foo_fp_id}/timeline",
        None,
        *foo_sandbox_tenant.db_auths,
    )
    collect_data_events = [i for i in body if i["event"]["kind"] == "data_collected"]
    assert len(collect_data_events) == 1
    assert set(collect_data_events[0]["event"]["data"]["attributes"]) == set(
        foo_sandbox_tenant.default_ob_config.must_collect_data
    )
    assert all(e["event"]["data"]["is_prefill"] for e in collect_data_events)


def test_cant_see_fp_id(sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user):
    fp_id = dual_onboarded_user.fp_id
    foo_fp_id = dual_onboarded_user.foo_fp_id

    get(f"/entities/{foo_fp_id}", None, *sandbox_tenant.db_auths, status_code=404)
    get(f"/entities/{fp_id}", None, *foo_sandbox_tenant.db_auths, status_code=404)

    get(
        f"/entities/{foo_fp_id}/timeline",
        None,
        *sandbox_tenant.db_auths,
        status_code=404,
    )
    get(
        f"/entities/{fp_id}/timeline",
        None,
        *foo_sandbox_tenant.db_auths,
        status_code=404,
    )


def test_cant_see_speculative_fingerprints(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_id = dual_onboarded_user.fp_id

    # Overwrite the name only from sandbox_tenant
    data = {
        "id.first_name": "New",
        "id.last_name": "Name",
    }
    patch(f"/entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

    for search_query in ["new", "name"]:
        data = dict(search=search_query)

        # sandbox_tenant should be able to search for the user from its new name
        body = get(f"/entities", data, *sandbox_tenant.db_auths)
        assert any(i["id"] == fp_id for i in body["data"])

        # foo_sandbox_tenant should _not_ be able to find the user by its name at sandbox_tenant
        body = get(f"/entities", data, *foo_sandbox_tenant.db_auths)
        assert not any(i["id"] == fp_id for i in body["data"])


def test_cant_see_unrequested_portable(dual_onboarded_user, foo_sandbox_tenant):
    # Now, we shouldn't be able to see nationality or ssn9 since they weren't requested by foo_sandbox_tenant
    fp_id = dual_onboarded_user.foo_fp_id
    body = get(f"entities/{fp_id}", None, *foo_sandbox_tenant.db_auths)
    ssn4 = next(i for i in body["data"] if i["identifier"] == "id.ssn4")
    assert ssn4["is_decryptable"]
    assert not any(i for i in body["data"] if i["identifier"] == "id.ssn9")
    assert not any(i for i in body["data"] if i["identifier"] == "id.nationality")


def test_cant_decrypt_unrequested_portable(dual_onboarded_user, foo_sandbox_tenant):
    # Now, we shouldn't be able to decrypt nationality or ssn9 since they weren't requested by foo_sandbox_tenant
    fp_id = dual_onboarded_user.foo_fp_id

    # Even though the nationality and ssn9 exist, this tenant isn't able to see it
    data = dict(fields=["id.nationality"], reason="Hello")
    body = post(
        f"entities/{fp_id}/vault/decrypt",
        data,
        *foo_sandbox_tenant.db_auths,
    )
    assert body["id.nationality"] is None

    data = dict(fields=["id.ssn9"], reason="Hello")
    body = post(
        f"entities/{fp_id}/vault/decrypt",
        data,
        *foo_sandbox_tenant.db_auths,
    )
    assert body["id.ssn9"] is None

    # But, ssn4 is visible
    data = dict(fields=["id.ssn4"], reason="Hello")
    body = post(f"entities/{fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths)
    assert body["id.ssn4"] == dual_onboarded_user.user.client.decrypted_data["id.ssn4"]
