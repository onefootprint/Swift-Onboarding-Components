import pytest
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.utils import (
    _gen_random_sandbox_id,
    create_ob_config,
    post,
    create_user,
    step_up_user,
    identify_verify,
)
from tests.headers import SandboxId, FpAuth, IsLive


def test_entity_created_after_signup_challenge(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL),
        sandbox_tenant.default_ob_config.key,
        SandboxId(sandbox_id),
    )

    # Make sure entity is created after initiating signup challenge. Should be hidden
    body = post("entities/search", None, *sandbox_tenant.db_auths)
    assert not any(e["sandbox_id"] == sandbox_id for e in body["data"])

    # But we can find it with show_all
    body = post("entities/search", dict(show_all=True), *sandbox_tenant.db_auths)
    entity = next(e for e in body["data"] if e["sandbox_id"] == sandbox_id)
    assert set(entity["decryptable_attributes"]) == {"id.email", "id.phone_number"}
    assert entity["status"] == "in_progress"


def test_concurrent_signup_same_phone_number(twilio, sandbox_tenant):
    """
    Test a race condition where the user tries to sign up with the same phone number at the same
    time.
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    obc = sandbox_tenant.default_ob_config

    # Initiate two signup challenges for the same phone number, email, and sandbox ID.
    data = dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL)
    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_token1 = body["challenge_data"]["challenge_token"]

    data = dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL)
    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_token2 = body["challenge_data"]["challenge_token"]

    # Should be able to complete both challenges without conflict, effectively making two vaults
    # with the same phone fingerprint and same sandbox ID.
    identify_verify(
        twilio, FIXTURE_PHONE_NUMBER, challenge_token2, "onboarding", obc.key
    )
    identify_verify(
        twilio, FIXTURE_PHONE_NUMBER, challenge_token1, "onboarding", obc.key
    )


@pytest.fixture(scope="function")
def sandbox_id():
    return _gen_random_sandbox_id()


@pytest.fixture(scope="function")
def vault1(sandbox_id, sandbox_tenant):
    """
    Tenant A - vault made via signup challenge but unverified.
    Should never be identified.
    """
    sandbox_id_h = SandboxId(sandbox_id)
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL),
        sandbox_tenant.default_ob_config.key,
        sandbox_id_h,
    )


@pytest.fixture(scope="function")
def vault2(sandbox_id, sandbox_tenant, twilio):
    """
    Tenant A - vault made via bifrost and fully onboarded/portablized
    """
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost.data["id.first_name"] = "From Tenant A"
    bifrost.run()


@pytest.fixture(scope="function")
def vault3(sandbox_id, sandbox_tenant, twilio):
    """
    Tenant A - vault made via bifrost and OTP verified with no other info
    Should never be identified.
    """
    sandbox_id_h = SandboxId(sandbox_id)
    create_user(
        twilio,
        FIXTURE_PHONE_NUMBER,
        FIXTURE_EMAIL,
        "onboarding",
        sandbox_tenant.default_ob_config.key,
        sandbox_id_h,
    )


@pytest.fixture(scope="function")
def vault4(sandbox_id, foo_sandbox_tenant, twilio):
    """
    Tenant B - vault made via API, portablized
    """
    sandbox_id_h = SandboxId(sandbox_id)
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    body = post("users", vault_data, foo_sandbox_tenant.s_sk, sandbox_id_h)
    fp_id = body["id"]
    # Then portablize the API-created vault
    data = dict(kind="onboard", key=foo_sandbox_tenant.default_ob_config.key.value)
    body = post(f"users/{fp_id}/token", data, foo_sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])
    auth_token = step_up_user(twilio, auth_token, FIXTURE_PHONE_NUMBER, True)
    bifrost = BifrostClient.raw_auth(
        foo_sandbox_tenant.default_ob_config,
        auth_token,
        FIXTURE_PHONE_NUMBER,
        sandbox_id,
    )
    bifrost.data["id.first_name"] = "From Tenant B"
    bifrost.run()


@pytest.fixture(scope="function")
def vault5(sandbox_id, tenant):
    """
    Tenant C - vault made via API, not portablized
    """
    sandbox_id_h = SandboxId(sandbox_id)
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
        "id.first_name": "From Tenant C",
    }
    post("users", vault_data, tenant.s_sk, sandbox_id_h)


@pytest.fixture(scope="session")
def tenant_sandbox_obc(tenant, must_collect_data):
    """
    A sandbox obc for the non-sandbox tenant
    """
    return create_ob_config(
        tenant,
        "Sandbox config",
        must_collect_data,
        must_collect_data,
        override_auths=[tenant.auth_token, IsLive("false")],
    )


def test_identify_priority(
    vault1,
    vault2,
    vault3,
    vault4,
    sandbox_tenant,
    foo_sandbox_tenant,
    tenant_sandbox_obc,
    tenant,
    twilio,
    sandbox_id,
):
    """
    Create vaults with the same phone/email/sandbox ID at different tenants and assert that we find
    the correct ones in identify.
    """
    vault1, vault2, vault3, vault4
    tests = [
        (sandbox_tenant, sandbox_tenant.default_ob_config, "From Tenant A"),
        (foo_sandbox_tenant, foo_sandbox_tenant.default_ob_config, "From Tenant B"),
        # This tenant doesn't have any fp_id with the contact info, so it should inherit the
        # one created by bifrost
        (tenant, tenant_sandbox_obc, "From Tenant A"),
    ]

    for i, (tenant, obc, expected_first_name) in enumerate(tests):
        # Since the vault ID isn't public, the only way to really figure out which vault is selected
        # by identify is to onboard it and check the PII
        # Maybe it would be nice to expose via API to integration tests the underlying vault ID
        # TODO test identifying on email
        bifrost = BifrostClient.inherit(obc, twilio, FIXTURE_PHONE_NUMBER, sandbox_id)
        fp_id = bifrost.run().fp_id
        data = dict(fields=["id.first_name"], reason="flerp")
        body = post(f"users/{fp_id}/vault/decrypt", data, tenant.s_sk)
        assert body["id.first_name"] == expected_first_name, f"Incorrect user for {i}"


def test_identify_with_non_portable_api_vault(
    vault2, vault5, tenant, tenant_sandbox_obc, twilio, sandbox_id
):
    """
    Create two vaults: one portable one made via bifrost at tenant A, and then another made via
    API at tenant B with almost no info.
    TODO, eventually:
    When identifying via tenant B, we should locate the user that was created via API at tenant B
    instead of inheriting the vault from another tenant. Otherwise tenant B would have two fp_ids
    for the same underlying user.
    """
    vault2, vault5
    bifrost = BifrostClient.inherit(
        tenant_sandbox_obc, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    fp_id = bifrost.run().fp_id
    data = dict(fields=["id.first_name"], reason="flerp")
    body = post(f"users/{fp_id}/vault/decrypt", data, tenant.s_sk)
    # TODO For now. Should be Tenant C after we start identifying vaults on tenant-scoped
    # fingerprints, even if unverified
    assert body["id.first_name"] == "From Tenant A"
