from tests.utils import get, post, _gen_random_sandbox_id
from tests.identify_client import IdentifyClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.headers import SandboxId
from tests.bifrost_client import BifrostClient

# This data is slightly different from that in constants.py
NONPORTABLE_DATA = {
    "id.first_name": "Nonportable",
    "id.last_name": "Penguin",
    "id.address_line1": "1 Hayes St",
    "id.city": "San Francisco",
    "id.state": "CA",
    "id.zip": "94117",
    "id.country": "US",
    "id.phone_number": FIXTURE_PHONE_NUMBER,
    "id.email": FIXTURE_EMAIL,
}


def test_portablize_nypid_via_auth(sandbox_tenant, foo_sandbox_tenant, auth_playbook):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto an auth playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Check that the identify response shows the user and the auth methods as unverified
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="auth")
    body = post("hosted/identify", data, sandbox_id_h, auth_playbook.key)
    assert body["user"]["is_unverified"]
    assert set(i["kind"] for i in body["user"]["auth_methods"]) == {"phone", "email"}
    assert all(not i["is_verified"] for i in body["user"]["auth_methods"])

    # Log into the user with an auth playbook, which will portablize it
    IdentifyClient(auth_playbook, sandbox_id).login(scope="auth")

    # After we mark this API-created vault as verified after logging into it, it should still be
    # visible via identify and should now have a verified auth method.
    # Since this was an auth playbook, we also immediately portablize the data in the vault,
    # as a method to portablize NYPIDs
    for obc, scope in [
        (auth_playbook, "auth"),
        (foo_sandbox_tenant.default_ob_config, "onboarding"),
    ]:
        data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope=scope)
        body = post("hosted/identify", data, sandbox_id_h, obc.key)
        assert not body["user"]["is_unverified"], "The user should now be verified"
        auth_methods = body["user"]["auth_methods"]
        assert set(i["kind"] for i in auth_methods) == {"phone", "email"}
        assert next(i["is_verified"] for i in auth_methods if i["kind"] == "phone")
        assert not next(i["is_verified"] for i in auth_methods if i["kind"] == "email")

    # Now, when one-click onboarding onto another tenant, we should prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.login_user(foo_sandbox_tenant.default_ob_config, sandbox_id)
    user = bifrost.run()

    # Double check the data was prefilled
    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert all(
        d["source"] == "prefill"
        for d in body["data"]
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())


def test_portablize_nypid_via_kyc(sandbox_tenant, foo_sandbox_tenant):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Check that the identify response shows the user and the auth methods as unverified
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="auth")
    body = post(
        "hosted/identify", data, sandbox_id_h, sandbox_tenant.default_ob_config.key
    )
    assert body["user"]["is_unverified"]
    assert set(i["kind"] for i in body["user"]["auth_methods"]) == {"phone", "email"}
    assert all(not i["is_verified"] for i in body["user"]["auth_methods"])

    # Inherit the user via identify flow
    bifrost = BifrostClient.login_user(sandbox_tenant.default_ob_config, sandbox_id)

    # After we mark this API-created vault as verified after logging into it, it should still be
    # visible via identify by any tenant and should now have a verified auth method.
    # Since this is not an auth playbook, we won't portablize all data in the vault - only the
    # phone that was verified
    for obc, expected_ci in [
        (sandbox_tenant.default_ob_config, {"phone", "email"}),
        (foo_sandbox_tenant.default_ob_config, {"phone"}),
    ]:
        data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="onboarding")
        body = post("hosted/identify", data, sandbox_id_h, obc.key)
        assert not body["user"]["is_unverified"], "The user should now be verified"
        auth_methods = body["user"]["auth_methods"]
        assert set(i["kind"] for i in auth_methods) == expected_ci
        assert next(i["is_verified"] for i in auth_methods if i["kind"] == "phone")
        if "email" in expected_ci:
            assert not next(
                i["is_verified"] for i in auth_methods if i["kind"] == "email"
            )

    # Then, run them through a KYC playbook
    bifrost.run()

    # Now, even identifying at foo_sandbox_tenant should show the email address
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="onboarding")
    body = post(
        "hosted/identify", data, sandbox_id_h, foo_sandbox_tenant.default_ob_config.key
    )
    auth_methods = body["user"]["auth_methods"]
    assert set(i["kind"] for i in auth_methods) == {"phone", "email", "passkey"}
    assert next(i["is_verified"] for i in auth_methods if i["kind"] == "phone")
    assert next(i["is_verified"] for i in auth_methods if i["kind"] == "passkey")
    assert not next(i["is_verified"] for i in auth_methods if i["kind"] == "email")

    # Now, when one-click onboarding onto another tenant, we should prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.login_user(foo_sandbox_tenant.default_ob_config, sandbox_id)
    user = bifrost.run()
    # Double check the data was prefilled
    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert all(
        d["source"] == "prefill"
        for d in body["data"]
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())


def test_portablize_nypid_by_email_then_phone(sandbox_tenant, foo_sandbox_tenant):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Inherit the user via email
    auth = IdentifyClient(sandbox_tenant.default_ob_config, sandbox_id).login(
        kind="email"
    )

    # Add a verified phone number
    data = dict(
        kind="phone", phone_number=FIXTURE_PHONE_NUMBER, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth)

    # And then run the user through bifrost
    bifrost = BifrostClient.raw_auth(sandbox_tenant.default_ob_config, auth, sandbox_id)
    bifrost.run()

    # Now, when one-click onboarding onto another tenant, we should prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.login_user(foo_sandbox_tenant.default_ob_config, sandbox_id)
    user = bifrost.run()

    # Double check the data was prefilled
    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert all(
        d["source"] == "prefill"
        for d in body["data"]
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())
