from typing import NamedTuple
import pytest
from tests.utils import (
    get,
    put,
    create_tenant,
    inherit_user,
)
from tests.bifrost_client import BifrostClient
from tests.constants import TENANT_ID3


@pytest.fixture(scope="session")
def foo_sandbox_tenant(must_collect_data, can_access_data):
    org_data = {
        "id": TENANT_ID3,
        "name": "Footprint Sandbox Integration Testing Foo",
        "is_live": False,
    }

    ob_conf_data = {
        "name": "Foo Credit Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_conf_data)


class DualOnboardedUser(NamedTuple):
    fp_user_id: str
    foo_fp_user_id: str


@pytest.fixture(scope="session")
def dual_onboarded_user(sandbox_tenant, foo_sandbox_tenant, twilio):
    # Create a sandbox user, onboard them onto sandbox_tenant
    bifrost_client = BifrostClient(sandbox_tenant.default_ob_config)
    bifrost_client.init_user_for_onboarding(twilio)
    user = bifrost_client.onboard_user_onto_tenant(sandbox_tenant)
    fp_user_id = user.fp_user_id

    #
    # Then onboard them onto foo_sandbox_tenant
    #
    inherited_auth_token = inherit_user(
        twilio, user.phone_number, foo_sandbox_tenant.default_ob_config.key
    )
    foo_bifrost_client = BifrostClient(foo_sandbox_tenant.default_ob_config)
    # Used instead of `init_user_for_onboarding` to instantiate the BifrostClient with the existing user's auth token.
    # The behavior of BifrostClient is still a little undefined in this case, though - don't do
    # this unless you know what you're doing
    foo_bifrost_client.auth_token = inherited_auth_token

    user = foo_bifrost_client.initialize_onboarding()
    validation_token = foo_bifrost_client.authorize_user_to_tenant()
    foo_fp_user_id = foo_bifrost_client.validate_user(
        validation_token, foo_sandbox_tenant.sk
    )

    return DualOnboardedUser(fp_user_id, foo_fp_user_id)


def test_fp_user_id(sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user):
    # Make sure the fp_user_ids are different
    assert (
        dual_onboarded_user.fp_user_id != dual_onboarded_user.foo_fp_user_id
    ), "Onboarding onto different tenants should give different fp_user_id"


def test_portable_timeline_events(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_user_id = dual_onboarded_user.fp_user_id
    foo_fp_user_id = dual_onboarded_user.foo_fp_user_id

    # Timeline events from sandbox_tenant's view belong to self
    body = get(f"/users/{fp_user_id}/timeline", None, sandbox_tenant.sk.key)
    assert body
    assert not any(i["is_from_other_org"] for i in body)

    # But from foo_sandbox_tenant's view, these events are portable and belong to another org
    body = get(
        f"/users/{foo_fp_user_id}/timeline",
        None,
        foo_sandbox_tenant.sk.key,
    )
    collect_data_events = [i for i in body if i["event"]["kind"] == "data_collected"]
    assert collect_data_events
    assert all(i["is_from_other_org"] for i in collect_data_events)


def test_cant_see_fp_user_id(sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user):
    fp_user_id = dual_onboarded_user.fp_user_id
    foo_fp_user_id = dual_onboarded_user.foo_fp_user_id

    get(f"/users/{foo_fp_user_id}", None, sandbox_tenant.sk.key, status_code=404)
    get(f"/users/{fp_user_id}", None, foo_sandbox_tenant.sk.key, status_code=404)

    get(
        f"/users/{foo_fp_user_id}/timeline",
        None,
        sandbox_tenant.sk.key,
        status_code=404,
    )
    get(
        f"/users/{fp_user_id}/timeline",
        None,
        foo_sandbox_tenant.sk.key,
        status_code=404,
    )


def test_cant_see_speculative_fingerprints(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_user_id = dual_onboarded_user.fp_user_id

    # Overwrite the name only from sandbox_tenant
    data = {
        "id.first_name": "New",
        "id.last_name": "Name",
    }
    put(f"/users/{fp_user_id}/vault", data, sandbox_tenant.sk.key)

    for search_query in ["new", "name"]:
        data = dict(search=search_query)

        # sandbox_tenant should be able to search for the user from its new name
        body = get(f"/users", data, sandbox_tenant.sk.key)
        assert [i for i in body["data"] if i["id"] == fp_user_id]

        # foo_sandbox_tenant should _not_ be able to find the user by its name at sandbox_tenant
        body = get(f"/users", data, foo_sandbox_tenant.sk.key)
        assert not len(body["data"])
