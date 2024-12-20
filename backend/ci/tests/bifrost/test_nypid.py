import pytest
from tests.utils import get, post, _gen_random_sandbox_id
from tests.identify_client import ForbiddenChallengeKindError, IdentifyClient
from tests.constants import (
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
    ID_DATA_CLEANED,
)
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


def challenge_kind_to_auth_method(kind):
    return {
        "email": "email",
        "sms": "phone",
    }[kind]


def add_primary_auth_method(kind, auth):
    data = {
        "kind": challenge_kind_to_auth_method(kind),
        "action_kind": "add_primary",
    }
    if kind == "email":
        data["email"] = FIXTURE_EMAIL
    elif kind == "sms":
        data["phone_number"] = FIXTURE_PHONE_NUMBER
    else:
        raise ValueError(f"Unknown kind: {kind}")

    body = post("hosted/user/challenge", data, auth)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    post("hosted/user/challenge/verify", data, auth)


def verified_fixture_id_data_for_auth_kinds(kinds):
    data = {}
    if "email" in kinds:
        data["id.verified_email"] = FIXTURE_EMAIL
    if "sms" in kinds:
        data["id.verified_phone_number"] = FIXTURE_PHONE_NUMBER
    return data


@pytest.mark.parametrize("login_auth_kind", ["sms", "email"])
def test_portablize_nypid_via_auth(
    sandbox_tenant,
    foo_sandbox_tenant,
    auth_playbook,
    login_auth_kind,
):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto an auth playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled

    Auth playbooks don't yet support passkeys, so portablization can only happen via a verified email.
    """
    login_auth_method = challenge_kind_to_auth_method(login_auth_kind)

    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Check that the identify response shows the user and the auth methods as unverified
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="auth")
    body = post("hosted/identify", data, sandbox_id_h, auth_playbook.key)
    assert body["user"]["is_unverified"]
    assert set(i["kind"] for i in body["user"]["auth_methods"]) == {"phone", "email"}
    assert all(not i["is_verified"] for i in body["user"]["auth_methods"])

    # Log into the user with an auth playbook, which will portablize it.
    IdentifyClient(auth_playbook, sandbox_id).login(kind=login_auth_kind, scope="auth")

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
        assert set(m["kind"] for m in auth_methods) == {"phone", "email"}
        assert all(
            m["is_verified"] for m in auth_methods if m["kind"] == login_auth_method
        ), f"The auth method used for login ({login_auth_method}) should be verified: {auth_methods}"
        assert all(
            not m["is_verified"] for m in auth_methods if m["kind"] != login_auth_method
        ), f"The auth methods not used for login (not {login_auth_method}) should be unverified: {auth_methods}"

    # Now, when one-click onboarding onto another tenant, we may prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.login_user(
        foo_sandbox_tenant.default_ob_config,
        sandbox_id,
        auth_kind=login_auth_kind,
    )
    user = bifrost.run()

    # Check how data was prefilled

    # Passkeys not supported for auth playbooks, so the portablized NYPID
    # doesn't have an associated passkey.
    expect_prefill = login_auth_kind == "email"
    verified_id_data = verified_fixture_id_data_for_auth_kinds([login_auth_kind])

    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    got_data_sources = {d["identifier"]: d["source"] for d in body["data"]}

    default_sources = {
        di: ("prefill" if expect_prefill else "hosted") for di in got_data_sources
    }
    prefilled_verified_id = {di: "prefill" for di in verified_id_data}
    expected_data_sources = {
        **default_sources,
        **prefilled_verified_id,
        # Contact info is always prefilled
        "id.phone_number": "prefill",
        "id.email": "prefill",
        # SSN was not in the NONPORTABLE_DATA, so it had to be entered in bifrost.
        "id.ssn4": "hosted",
    }

    assert got_data_sources == expected_data_sources

    # Check that the vaulted data is correct.
    decrypt_fields = list(NONPORTABLE_DATA.keys()) + list(verified_id_data.keys())
    data = dict(fields=decrypt_fields, reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )

    bifrost_entered_data = {}
    if not expect_prefill:
        bifrost_entered_data = {
            k: v for k, v in ID_DATA_CLEANED.items() if k in decrypt_fields
        }

    expected_data = {
        **NONPORTABLE_DATA,
        **bifrost_entered_data,
        **verified_id_data,
    }
    assert body == expected_data


@pytest.mark.parametrize(
    "first_login_auth_kind,verify_additional_auth_kinds",
    [
        # Only one auth kind verified
        ("sms", []),
        ("email", []),
        # Verify both SMS and email in different order.
        ("sms", ["email"]),
        ("email", ["sms"]),
    ],
)
@pytest.mark.parametrize("one_click_auth_kind", ["sms", "email", "passkey"])
def test_nypid_portablized_via_kyc_playbook(
    sandbox_tenant,
    foo_sandbox_tenant,
    first_login_auth_kind,
    verify_additional_auth_kinds,
    one_click_auth_kind,
):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """

    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Check that the identify response shows the user and the auth methods as unverified.
    # Try identifying by different methods.
    identify_by_fixture_data = {
        "phone": {"phone_number": FIXTURE_PHONE_NUMBER, "scope": "auth"},
        "email": {"email": FIXTURE_EMAIL, "scope": "auth"},
    }
    for data in identify_by_fixture_data.values():
        body = post(
            "hosted/identify", data, sandbox_id_h, sandbox_tenant.default_ob_config.key
        )
        assert body["user"]["is_unverified"]
        assert set(i["kind"] for i in body["user"]["auth_methods"]) == {
            "phone",
            "email",
        }
        assert all(not i["is_verified"] for i in body["user"]["auth_methods"])

    # Inherit the user via identify flow. This will verify the first auth method.
    auth = IdentifyClient(sandbox_tenant.default_ob_config, sandbox_id).login(
        kind=first_login_auth_kind,
    )

    # Logging in via the unverified auth method should not work, since an auth
    # method is already verified.
    for identify_auth_kind in verify_additional_auth_kinds:
        with pytest.raises(ForbiddenChallengeKindError):
            BifrostClient.login_user(
                sandbox_tenant.default_ob_config,
                sandbox_id,
                auth_kind=identify_auth_kind,
            )

        # Verify the additional auth kind.
        add_primary_auth_method(identify_auth_kind, auth)

    verified_auth_kinds = [first_login_auth_kind] + verify_additional_auth_kinds
    verified_auth_methods = [
        challenge_kind_to_auth_method(k) for k in verified_auth_kinds
    ]

    # After we mark this API-created vault as verified after logging into it, it should still be
    # visible via identify by any tenant and should now have a verified auth method.
    # Since this is not an auth playbook, we won't portablize all data in the vault - only the
    # auth method that was verified
    for obc, expected_ci in [
        (sandbox_tenant.default_ob_config, {"phone", "email"}),
        # Only the verified auth method can be used for identifying at a different tenant.
        (foo_sandbox_tenant.default_ob_config, verified_auth_methods),
    ]:
        for identify_auth_method, data in identify_by_fixture_data.items():
            body = post("hosted/identify", data, sandbox_id_h, obc.key)

            if identify_auth_method not in expected_ci:
                assert (
                    body["user"] is None
                ), f"The user should not be identifiable via {identify_auth_method} when expected_ci is {expected_ci}"
                continue
            assert not body["user"]["is_unverified"], "The user should now be verified"

            auth_methods = body["user"]["auth_methods"]
            got_auth_methods_verified = {
                m["kind"]: m["is_verified"] for m in auth_methods
            }
            expect_auth_methods_verified = {
                method: (method in verified_auth_methods) for method in expected_ci
            }
            assert got_auth_methods_verified == expect_auth_methods_verified

    # Then, run them through a KYC playbook
    bifrost = BifrostClient.raw_auth(sandbox_tenant.default_ob_config, auth, sandbox_id)
    user = bifrost.run()

    # Now, even identifying at foo_sandbox_tenant should show the verified contact info
    identify_by_fixture_data = {
        "phone": {"phone_number": FIXTURE_PHONE_NUMBER, "scope": "auth"},
        "email": {"email": FIXTURE_EMAIL, "scope": "auth"},
    }
    for identify_auth_method, data in identify_by_fixture_data.items():
        body = post(
            "hosted/identify",
            data,
            sandbox_id_h,
            foo_sandbox_tenant.default_ob_config.key,
        )

        auth_methods = body["user"]["auth_methods"]
        got_auth_methods_verified = {m["kind"]: m["is_verified"] for m in auth_methods}
        expect_auth_methods_verified = {
            "email": ("email" in verified_auth_methods),
            "phone": ("phone" in verified_auth_methods),
            "passkey": True,
        }
        assert got_auth_methods_verified == expect_auth_methods_verified

    # Now, when one-click onboarding onto another tenant, we may prefill this data instead of
    # using the data that is filled in by the Bifrost client
    def bifrost_login_user():
        return BifrostClient.login_user(
            foo_sandbox_tenant.default_ob_config,
            sandbox_id,
            auth_kind=one_click_auth_kind,
            webauthn=user.client.webauthn_device,
        )

    if one_click_auth_kind in verified_auth_kinds:
        bifrost = bifrost_login_user()
    else:
        with pytest.raises(ForbiddenChallengeKindError):
            bifrost_login_user()
        return

    user = bifrost.run()

    # Check how the data was prefilled
    expect_prefill = one_click_auth_kind in ["email", "passkey"]
    verified_id_data = verified_fixture_id_data_for_auth_kinds(verified_auth_kinds)

    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    got_data_sources = {d["identifier"]: d["source"] for d in body["data"]}

    default_data_sources = {
        di: ("prefill" if expect_prefill else "hosted") for di in got_data_sources
    }
    prefilled_verified_id = {di: "prefill" for di in verified_id_data}
    expected_data_sources = {
        **default_data_sources,
        **prefilled_verified_id,
        "id.phone_number": "prefill",
        "id.email": "prefill",
    }

    assert got_data_sources == expected_data_sources

    # Check that the vaulted data is correct.
    decrypt_fields = list(NONPORTABLE_DATA.keys()) + list(verified_id_data.keys())
    data = dict(fields=decrypt_fields, reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )

    bifrost_entered_data = {}
    if not expect_prefill:
        bifrost_entered_data = {
            k: v for k, v in ID_DATA_CLEANED.items() if k in decrypt_fields
        }

    expected_data = {
        **NONPORTABLE_DATA,
        **bifrost_entered_data,
        **verified_id_data,
    }
    assert body == expected_data
