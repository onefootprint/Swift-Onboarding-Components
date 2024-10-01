import pytest
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.utils import _gen_random_sandbox_id, create_ob_config, post, get, patch
from tests.identify_client import IdentifyClient
from tests.headers import SandboxId, FpAuth, IsLive


def test_entity_created_after_signup_challenge(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER),
        email=dict(value=FIXTURE_EMAIL),
        scope="onboarding",
    )
    post(
        "hosted/identify/signup_challenge",
        data,
        sandbox_tenant.default_ob_config.key,
        SandboxId(sandbox_id),
    )

    # Make entity should be hidden after signup challenge
    pagination = dict(pagination=dict(page_size=100))
    body = post("entities/search", pagination, *sandbox_tenant.db_auths)
    assert not any(e["sandbox_id"] == sandbox_id for e in body["data"])

    # But we can find it with show_all
    body = post(
        "entities/search", dict(show_all=True, **pagination), *sandbox_tenant.db_auths
    )
    entity = next(e for e in body["data"] if e["sandbox_id"] == sandbox_id)
    assert set(entity["decryptable_attributes"]) == {"id.email", "id.phone_number"}
    assert entity["status"] == "in_progress"


def test_concurrent_signup_same_phone_number(sandbox_tenant):
    """
    Test a race condition where the user tries to sign up with the same phone number at the same
    time.
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    obc = sandbox_tenant.default_ob_config

    # Initiate two signup challenges for the same phone number, email, and sandbox ID.
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER),
        email=dict(value=FIXTURE_EMAIL),
        scope="onboarding",
    )
    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_data1 = body["challenge_data"]

    body = post("hosted/identify/signup_challenge", data, obc.key, sandbox_id_h)
    challenge_data2 = body["challenge_data"]

    def verify(challenge_data):
        data = {
            "challenge_response": "000000",
            "challenge_kind": "sms",
            "challenge_token": challenge_data["challenge_token"],
            "scope": "onboarding",
        }
        token = FpAuth(challenge_data["token"])
        post("hosted/identify/verify", data, token)

    # Should be able to complete both challenges without conflict, effectively making two vaults
    # with the same phone fingerprint and same sandbox ID.
    verify(challenge_data2)
    verify(challenge_data1)


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
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER),
        email=dict(value=FIXTURE_EMAIL),
        scope="onboarding",
    )
    post(
        "hosted/identify/signup_challenge",
        data,
        sandbox_tenant.default_ob_config.key,
        sandbox_id_h,
    )


@pytest.fixture(scope="function")
def vault2(sandbox_id, sandbox_tenant):
    """
    Tenant A - vault made via bifrost and fully onboarded/portablized
    """
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, override_sandbox_id=sandbox_id
    )
    user = bifrost.run()
    return get("hosted/user/private/token", None, user.client.auth_token)


@pytest.fixture(scope="function")
def vault3(sandbox_id, sandbox_tenant):
    """
    Tenant A - vault made via API but not OTP verified.
    """
    data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", data, sandbox_id_h, sandbox_tenant.sk.key)


@pytest.fixture(scope="function")
def vault4(sandbox_id, foo_sandbox_tenant):
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

    # Token should be unverified because this vault was made via API
    data = dict(scope="onboarding")
    body = post("/hosted/identify", data, auth_token)
    assert body["user"]
    assert body["user"]["is_unverified"]

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(
        foo_sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )
    user = bifrost.run()
    return get("hosted/user/private/token", None, user.client.auth_token)


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
    sandbox_id,
):
    """
    Create vaults with the same phone/email/sandbox ID at different tenants and assert that we find
    the correct ones in identify.
    """
    vault1, vault2, vault3, vault4
    tests = [
        (
            sandbox_tenant,
            sandbox_tenant.default_ob_config,
            vault2["vault_id"],
            vault2["fp_id"],
        ),
        (
            foo_sandbox_tenant,
            foo_sandbox_tenant.default_ob_config,
            vault4["vault_id"],
            vault4["fp_id"],
        ),
        # This tenant doesn't have any fp_id with the contact info, so it should inherit the
        # one created by bifrost
        (tenant, tenant_sandbox_obc, vault2["vault_id"], None),
    ]

    for i, (tenant, obc, expected_vault_id, expected_fp_id) in enumerate(tests):
        # TODO test identifying on email
        auth_token = IdentifyClient(obc, sandbox_id).inherit()
        body = get("hosted/user/private/token", None, auth_token)
        assert body["vault_id"] == expected_vault_id

        if expected_fp_id:
            assert body["fp_id"] == expected_fp_id


def test_identify_with_non_portable_api_vault(
    vault2, tenant, tenant_sandbox_obc, sandbox_id
):
    """
    Create two vaults: one portable made via bifrost at another tenant, and then another made via
    API at tenant this tenant with almost no info.
    When identifying, we should locate the user that was created via API at this tenant instead
    of inheriting the vault from another tenant. Otherwise this tenant would have two fp_ids
    for the same underlying user.
    """
    vault2

    # Create the unverified user via API at this tenant
    sandbox_id_h = SandboxId(sandbox_id)
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    body = post("users", vault_data, tenant.s_sk, sandbox_id_h)
    fp_id_c = body["id"]

    auth_token = IdentifyClient(tenant_sandbox_obc, sandbox_id).inherit()
    body = get("hosted/user/private/token", None, auth_token)
    assert body["fp_id"] == fp_id_c


def test_multi_identify(sandbox_user, sandbox_tenant):
    """
    Test identify queries with different amounts of matching data
    """
    sandbox_id = sandbox_user.client.sandbox_id
    sandbox_id_h = SandboxId(sandbox_id)
    email = sandbox_user.client.data["id.email"]
    phone_number = sandbox_user.client.data["id.phone_number"]
    obc = sandbox_tenant.default_ob_config

    # Identify the user, and get a token in exchange
    data = dict(phone_number=phone_number, email=email, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    assert set(body["user"]["matching_fps"]) == {"id.phone_number", "id.email"}

    data = dict(
        phone_number=phone_number, email="flerp@onefootprint.com", scope="onboarding"
    )
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    assert set(body["user"]["matching_fps"]) == {"id.phone_number"}

    data = dict(phone_number="+15555555555", email=email, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    assert set(body["user"]["matching_fps"]) == {"id.email"}


def test_login_flow(sandbox_user, sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "flerp", must_collect_data, must_collect_data
    )

    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # Identify the user, and get a token in exchange
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    user = body["user"]
    token = FpAuth(user["token"])
    assert not user["token_scopes"]
    assert all(i["is_verified"] for i in user["auth_methods"] if i["kind"] == "phone")
    assert all(
        not i["is_verified"] for i in user["auth_methods"] if i["kind"] == "email"
    )

    # Make sure the token issued has no scopes
    body = get("/hosted/user/token", None, token)
    assert not body["scopes"]

    # Now, we don't use the phone as an identifier - we just use the token that was given to us
    auth_token = IdentifyClient.from_token(token).step_up(assert_had_no_scopes=True)

    # Make sure the token has scopes
    data = dict(scope="onboarding")
    body = post("/hosted/identify", data, auth_token)
    assert set(body["user"]["token_scopes"]) >= {"sign_up"}

    # Finish onboarding onto this playbook using the auth token issued from the new flow
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    bifrost.run()


def test_login_flow_new_tenant(sandbox_tenant, sandbox_user, foo_sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    sandbox_user = bifrost.run()

    obc = foo_sandbox_tenant.default_ob_config
    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # Identify the user, and get a token in exchange
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    user = body["user"]
    token = FpAuth(user["token"])

    # Now, we don't use the phone as an identifier - we just use the token that was given to us
    auth_token = IdentifyClient.from_token(token).step_up(assert_had_no_scopes=True)

    # Finish onboarding onto this playbook using the auth token issued from the new flow
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    bifrost.run()


def test_signup_flow(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER),
        email=dict(value=FIXTURE_EMAIL),
        scope="onboarding",
    )
    body = post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)
    token = FpAuth(body["challenge_data"]["token"])

    # Make sure the token issued has no scopes
    token_body = get("/hosted/user/token", None, token)
    assert not token_body["scopes"]

    # Then finish sign up
    data = {
        "challenge_response": "000000",
        "challenge_token": body["challenge_data"]["challenge_token"],
        "scope": "onboarding",
    }
    body = post("hosted/identify/verify", data, token)
    auth_token = FpAuth(body["auth_token"])

    # Make sure the token has scopes
    data = dict(scope="onboarding")
    body = post("/hosted/identify", data, auth_token)
    assert set(body["user"]["token_scopes"]) >= {"sign_up"}

    # Finish onboarding onto this playbook using the auth token issued from the new flow
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    bifrost.run()


def test_modern_signup_flow(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER, is_bootstrap=True),
        email=dict(value=FIXTURE_EMAIL, is_bootstrap=False),
        scope="onboarding",
    )
    body = post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)
    token = FpAuth(body["challenge_data"]["token"])

    # Make sure the token issued has no scopes
    token_body = get("/hosted/user/token", None, token)
    assert not token_body["scopes"]

    # Then finish sign up
    data = {
        "challenge_response": "000000",
        "challenge_token": body["challenge_data"]["challenge_token"],
        "scope": "onboarding",
    }
    body = post("hosted/identify/verify", data, token)
    auth_token = FpAuth(body["auth_token"])

    # Make sure the token has scopes
    data = dict(scope="onboarding")
    body = post("/hosted/identify", data, auth_token)
    assert set(body["user"]["token_scopes"]) >= {"sign_up"}

    # Finish onboarding onto this playbook using the auth token issued from the new flow
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    user = bifrost.run()

    # And verify that the source of data is correct
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert (
        next(i for i in body["data"] if i["identifier"] == "id.phone_number")["source"]
        == "bootstrap"
    )
    assert (
        next(i for i in body["data"] if i["identifier"] == "id.email")["source"]
        == "hosted"
    )


@pytest.mark.parametrize(
    "kba_data,expected_err_str,expected_err_context",
    [
        (
            {"id.email": "sandbox@onefootprint.com"},
            "KBA not allowed for id.email",
            None,
        ),
        ({"id.ssn4": "1234"}, "KBA not allowed for id.ssn4", None),
        (
            {"id.phone_number": "Not a phone number"},
            "Vault data failed validation",
            {"id.phone_number": "not a number"},
        ),
        (
            {"id.phone_number": "+15555550111"},
            "Incorrect KBA response for id.phone_number",
            None,
        ),
        ({"id.phone_number": FIXTURE_PHONE_NUMBER}, None, None),
        # We should also support cleaning the user input phone number
        ({"id.phone_number": "+1 (555) 555-0100"}, None, None),
    ],
)
def test_kba(
    sandbox_user, sandbox_tenant, kba_data, expected_err_str, expected_err_context
):
    """
    Test performing KBA on an identified token
    """
    obc = sandbox_tenant.default_ob_config
    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # Identify the user, and get a token in exchange
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    token = FpAuth(body["user"]["token"])

    # Run KBA
    expected_status = 400 if expected_err_str else 200
    body = post("hosted/identify/kba", kba_data, token, status_code=expected_status)
    if expected_err_str:
        assert body["message"] == expected_err_str
        assert body.get("context", None) == expected_err_context
    else:
        # Make sure the new token issued still has no scopes
        new_token = FpAuth(body["token"])
        body = get("/hosted/user/token", None, new_token)
        assert not body["scopes"]


def test_otp_unverified(sandbox_user, sandbox_tenant):
    """
    Test that we can only initiate an OTP challenge to an unverified email after performing KBA.
    """
    obc = sandbox_tenant.default_ob_config
    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    # Identify the user, and get a token in exchange
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    token = FpAuth(body["user"]["token"])

    # Cannot initiate a login challenge
    data = dict(preferred_challenge_kind="email", scope="onboarding")
    body = post("/hosted/identify/login_challenge", data, token, status_code=400)
    assert body["message"] == "Cannot initiate a challenge of requested kind"

    # Run KBA
    kba_data = {"id.phone_number": phone_number}
    body = post("hosted/identify/kba", kba_data, token)
    new_token = FpAuth(body["token"])

    # Now, we can initiate an email challenge
    auth_token = IdentifyClient.from_token(new_token).step_up(
        kind="email", assert_had_no_scopes=True
    )
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    bifrost.run()


def test_cannot_make_duplicate(sandbox_user, sandbox_tenant):
    """
    Don't allow making a duplicate vault when a vault already exists at this tenant
    """
    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]
    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")

    # Shouldn't be able to initiate a new signup challenge when no playbook key is provided
    body = post("/hosted/identify", data, sandbox_id_h)
    assert not body["user"]["can_initiate_signup_challenge"]

    # Shouldn't be able to initiate a new signup challenge when there's already a SV at this tenant
    body = post(
        "/hosted/identify", data, sandbox_id_h, sandbox_tenant.default_ob_config.key
    )
    assert not body["user"]["can_initiate_signup_challenge"]

    # We should block making the signup challenge for this tenant
    data = dict(phone_number=dict(value=phone_number), scope="onboarding")
    body = post(
        "/hosted/identify/signup_challenge",
        data,
        sandbox_id_h,
        sandbox_tenant.default_ob_config.key,
        status_code=400,
    )
    assert body["message"] == "Please log into your existing account"
    assert body["code"] == "E120"

    # Perform a login challenge using the token given in the erro
    token = FpAuth(body["context"]["token"])
    IdentifyClient.from_token(token).step_up(assert_had_no_scopes=True)


def test_create_duplicate_vault(sandbox_user, foo_sandbox_tenant):
    """
    Allow creating a duplicate vault when the user doesn't exist at this tenant
    """
    sandbox_id = sandbox_user.client.sandbox_id
    phone_number = sandbox_user.client.data["id.phone_number"]

    sandbox_id_h = SandboxId(sandbox_id)
    data = dict(phone_number=phone_number, scope="onboarding")
    obc = foo_sandbox_tenant.default_ob_config
    body = post("/hosted/identify", data, sandbox_id_h, obc.key)
    assert body["user"]["can_initiate_signup_challenge"]

    data = dict(
        phone_number=dict(value=phone_number),
        email=dict(value=FIXTURE_EMAIL),
        scope="onboarding",
    )
    body = post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)
    data = {
        "challenge_response": "000000",
        "challenge_token": body["challenge_data"]["challenge_token"],
        "scope": "onboarding",
    }
    token = FpAuth(body["challenge_data"]["token"])
    post("hosted/identify/verify", data, token)


def test_double_signup_challenge(sandbox_tenant):
    """
    Test that we can initiate the same signup challenge twice in a row.
    Per implementation detail, this actually creates a duplicate vault, but the first one becomes
    orphaned.
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    obc = sandbox_tenant.default_ob_config
    data = dict(phone_number=dict(value=FIXTURE_PHONE_NUMBER), scope="onboarding")
    post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)
    post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)


def test_failed_verify(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    obc = sandbox_tenant.default_ob_config
    data = dict(
        phone_number=dict(value=FIXTURE_PHONE_NUMBER), scope="onboarding", kind="sms"
    )
    body = post("/hosted/identify/signup_challenge", data, sandbox_id_h, obc.key)

    data = {
        "challenge_response": "111111",
        "challenge_token": body["challenge_data"]["challenge_token"],
        "scope": "onboarding",
    }
    token = FpAuth(body["challenge_data"]["token"])
    body = post("hosted/identify/verify", data, token, status_code=400)
    assert body["message"] == "Incorrect PIN code"
    assert body["code"] == "E102"


def test_cannot_set_verified_ci(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    for data in [
        {"id.verified_phone_number": FIXTURE_PHONE_NUMBER},
        {"id.verified_email": FIXTURE_EMAIL},
    ]:
        body = patch("hosted/user/vault", data, bifrost.auth_token, status_code=400)
        assert (
            body["message"]
            == "Can only set verified CI DIs in challenge verification flow"
        )
