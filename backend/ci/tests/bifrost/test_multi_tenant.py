from typing import NamedTuple
import pytest
from tests.utils import (
    get,
    patch,
    post,
    create_tenant,
    inherit_user,
)
from tests.bifrost_client import BifrostClient
from tests.headers import SandboxId
from tests.constants import TENANT_ID3


@pytest.fixture(scope="session")
def foo_sandbox_tenant():
    org_data = {
        "id": TENANT_ID3,
        "name": "Footprint Sandbox Integration Testing Foo",
        "is_live": False,
    }
    # Specifically don't request nationality and ssn9
    fields = ["name", "ssn4", "full_address", "email", "phone_number"]
    ob_conf_data = {
        "name": "Foo Credit Card",
        "must_collect_data": fields,
        "can_access_data": fields,
    }

    return create_tenant(org_data, ob_conf_data)


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

    foo_user = foo_bifrost.run()
    foo_fp_id = foo_user.fp_id

    assert [i["kind"] for i in foo_bifrost.handled_requirements] == [
        "authorize",
        "process",
    ]

    assert [i["kind"] for i in foo_bifrost.already_met_requirements] == ["collect_data"]

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
    assert collect_data_events
    assert all(i["is_from_other_org"] for i in collect_data_events)


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
        assert [i for i in body["data"] if i["id"] == fp_id]

        # foo_sandbox_tenant should _not_ be able to find the user by its name at sandbox_tenant
        body = get(f"/entities", data, *foo_sandbox_tenant.db_auths)
        assert not len(body["data"])


def test_cant_see_unrequested_portable(dual_onboarded_user, foo_sandbox_tenant):
    # Now, we shouldn't be able to see nationality or ssn9 since they weren't requested by foo_sandbox_tenant
    fp_id = dual_onboarded_user.foo_fp_id
    body = get(f"entities/{fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert "id.ssn4" in body["attributes"]
    assert "id.ssn9" not in body["attributes"]
    assert "id.nationality" not in body["attributes"]

    assert "id.ssn4" in body["decryptable_attributes"]
    assert "id.ssn9" not in body["decryptable_attributes"]
    assert "id.nationality" not in body["decryptable_attributes"]


def test_cant_decrypt_unrequested_portable(dual_onboarded_user, foo_sandbox_tenant):
    # Now, we shouldn't be able to decrypt nationality or ssn9 since they weren't requested by foo_sandbox_tenant
    fp_id = dual_onboarded_user.foo_fp_id

    data = dict(fields=["id.nationality"], reason="Hello")
    post(
        f"entities/{fp_id}/vault/decrypt",
        data,
        *foo_sandbox_tenant.db_auths,
        status_code=401,
    )

    data = dict(fields=["id.ssn9"], reason="Hello")
    post(
        f"entities/{fp_id}/vault/decrypt",
        data,
        *foo_sandbox_tenant.db_auths,
        status_code=401,
    )

    # But, ssn4 is visible
    data = dict(fields=["id.ssn4"], reason="Hello")
    body = post(f"entities/{fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths)
    assert body["id.ssn4"] == dual_onboarded_user.user.client.decrypted_data["id.ssn4"]
