from typing import NamedTuple
import pytest
from tests.identify_client import IdentifyClient
from tests.utils import (
    _gen_random_n_digit_number,
    get,
    patch,
    post,
)
from tests.bifrost_client import BifrostClient, User
from tests.headers import FpAuth, SandboxId


class DualOnboardedUser(NamedTuple):
    fp_id: str
    foo_fp_id: str
    user: User
    external_id: str


@pytest.fixture(scope="module")
def dual_onboarded_user(sandbox_tenant, foo_sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()
    fp_id = sandbox_user.fp_id

    #
    # Then onboard them onto foo_sandbox_tenant
    #
    sandbox_id = bifrost.sandbox_id
    foo_bifrost = BifrostClient.inherit_user(
        foo_sandbox_tenant.default_ob_config, sandbox_id
    )

    # Before the user finishes onboarding to foo_sandbox_tenant, the tenant shouldn't be able to
    # make a token that inherits auth
    foo_fp_id = get("hosted/user/private_info", None, foo_bifrost.auth_token)["fp_id"]

    def get_scopes():
        body = post(
            f"users/{foo_fp_id}/token", dict(kind="user"), foo_sandbox_tenant.sk.key
        )
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

    # Set an external ID for the users to make it easier to search for them
    external_id = _gen_random_n_digit_number(10)
    data = dict(external_id=external_id)
    patch(f"users/{fp_id}", data, sandbox_tenant.s_sk)
    patch(f"users/{foo_fp_id}", data, foo_sandbox_tenant.s_sk)

    return DualOnboardedUser(fp_id, foo_fp_id, sandbox_user, external_id)


def test_fp_id(dual_onboarded_user):
    # Make sure the fp_ids are different
    assert (
        dual_onboarded_user.fp_id != dual_onboarded_user.foo_fp_id
    ), "Onboarding onto different tenants should give different fp_id"


def test_prefill_timeline_events(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_id = dual_onboarded_user.fp_id
    foo_fp_id = dual_onboarded_user.foo_fp_id

    body = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    assert body

    # There should be two timeline events showing data was prefilled into the new tenant.
    # The first event shows the contact info being prefilled, and the second shows the data
    body = get(
        f"entities/{foo_fp_id}/timeline",
        None,
        *foo_sandbox_tenant.db_auths,
    )
    collect_data_events = [i for i in body if i["event"]["kind"] == "data_collected"]
    assert len(collect_data_events) == 2
    assert all(e["event"]["data"]["is_prefill"] for e in collect_data_events)
    assert set(collect_data_events[1]["event"]["data"]["attributes"]) == {
        "phone_number",
        "email",
    }, "Prefill at auth populates auth methods"
    assert set(collect_data_events[0]["event"]["data"]["attributes"]) == (
        set(foo_sandbox_tenant.default_ob_config.must_collect_data)
        - {"phone_number", "email"}
    ), "Prefill at onboarding time populates all remaining attributes"


def test_prefill_passkeys(dual_onboarded_user, foo_sandbox_tenant):
    """
    Should be able to log into the user created at foo_sandbox_tenant with the passkey registered at sandbox_tenant
    """
    bifrost = dual_onboarded_user.user.client
    IdentifyClient(
        foo_sandbox_tenant.default_ob_config,
        bifrost.sandbox_id,
        webauthn=bifrost.webauthn_device,
    ).inherit(kind="biometric")


def test_prefill_phone_auth_method(dual_onboarded_user, foo_sandbox_tenant):
    """
    Should be able to log into the user created at foo_sandbox_tenant with the phone registered at sandbox_tenant
    """
    bifrost = dual_onboarded_user.user.client
    IdentifyClient(
        foo_sandbox_tenant.default_ob_config,
        bifrost.sandbox_id,
        webauthn=bifrost.webauthn_device,
    ).inherit(kind="sms")


def test_cant_see_fp_id(sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user):
    fp_id = dual_onboarded_user.fp_id
    foo_fp_id = dual_onboarded_user.foo_fp_id

    get(f"entities/{foo_fp_id}", None, *sandbox_tenant.db_auths, status_code=404)
    get(f"entities/{fp_id}", None, *foo_sandbox_tenant.db_auths, status_code=404)

    get(
        f"entities/{foo_fp_id}/timeline",
        None,
        *sandbox_tenant.db_auths,
        status_code=404,
    )
    get(
        f"entities/{fp_id}/timeline",
        None,
        *foo_sandbox_tenant.db_auths,
        status_code=404,
    )


def test_search(sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user):
    """
    Make sure we can search by fields that were prefilled
    """
    phone_number = dual_onboarded_user.user.client.data["id.phone_number"]
    email = dual_onboarded_user.user.client.data["id.email"]
    for search_query in [phone_number, email]:
        data = dict(search=search_query, external_id=dual_onboarded_user.external_id)
        # Both tenants should be able to find the user based on the search query

        body = post("entities/search", data, *sandbox_tenant.db_auths)
        assert any(i["id"] == dual_onboarded_user.fp_id for i in body["data"])

        body = post("entities/search", data, *foo_sandbox_tenant.db_auths)
        assert any(i["id"] == dual_onboarded_user.foo_fp_id for i in body["data"])

    # Search query with bogus fingerprint doesn't return the user, even with external_id query
    data = dict(search="asdfased", external_id=dual_onboarded_user.external_id)
    body = post("entities/search", data, *sandbox_tenant.db_auths)
    assert body["meta"]["count"] == 0


def test_cant_see_speculative_fingerprints(
    sandbox_tenant, foo_sandbox_tenant, dual_onboarded_user
):
    fp_id = dual_onboarded_user.fp_id

    # Overwrite the name only from sandbox_tenant
    data = {
        "id.first_name": "New",
        "id.last_name": "Name",
    }
    patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

    for search_query in ["new", "name"]:
        data = dict(search=search_query)

        # sandbox_tenant should be able to search for the user from its new name
        body = post("entities/search", data, *sandbox_tenant.db_auths)
        assert any(i["id"] == dual_onboarded_user.fp_id for i in body["data"])

        # foo_sandbox_tenant should _not_ be able to find the user by its name at sandbox_tenant
        body = post("entities/search", data, *foo_sandbox_tenant.db_auths)
        assert not any(i["id"] == dual_onboarded_user.foo_fp_id for i in body["data"])


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


def test_one_click_with_kba(sandbox_tenant, foo_sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()

    # Then onboard them onto foo_sandbox_tenant
    obc = foo_sandbox_tenant.default_ob_config
    sandbox_id = bifrost.sandbox_id
    phone_number = bifrost.data["id.phone_number"]
    email = bifrost.data["id.email"]
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(email=email, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    token = FpAuth(body["user"]["token"])

    # Run KBA
    kba_data = {"id.phone_number": phone_number}
    body = post("hosted/identify/kba", kba_data, token)
    new_token = FpAuth(body["token"])

    # Now, we can initiate an email challenge
    auth_token = IdentifyClient.from_token(new_token).step_up(
        kind="email", assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    foo_user = bifrost.run()
    assert foo_user.fp_id != sandbox_user.fp_id
