import pytest
from tests.utils import create_tenant, patch, post, get


@pytest.fixture(scope="session")
def assumed_token(tenant, sandbox_tenant_data):
    # Same tenant as the sandbox_tenant, but we call the `private/test_tenant` endpoint again
    # to make an auth token that is only used in this test
    original_tenant = create_tenant(*sandbox_tenant_data)
    auth_token = original_tenant.auth_token
    data = dict(tenant_id=tenant.id)

    # Check that the auth token is for the sandbox tenant
    body = get("org", None, auth_token)
    assert body["id"] == original_tenant.id
    assert body["name"] == "Footprint Sandbox Integration Testing"

    body = get("org/member", None, auth_token)
    assert body["is_firm_employee"]
    assert not body.get("is_assumed_session")

    # Integration testing tenant should not be able to assume role for a real org
    post(
        "private/assume",
        dict(tenant_id="org_id_that_looks_real"),
        auth_token,
        status_code=401,
    )

    # Cannot assume with a secret key
    post("private/assume", data, tenant.sk.key, status_code=401)

    # Correct use
    post("private/assume", data, auth_token)

    # Can re-assume with the same token
    post("private/assume", data, auth_token)

    # Now, the auth token sees different data!
    body = get("org", None, auth_token)
    assert body["id"] == tenant.id
    assert body["name"] == "Footprint Live Integration Testing"

    body = get("org/member", None, auth_token)
    assert body["is_firm_employee"]
    assert body.get("is_assumed_session")

    return auth_token


@pytest.mark.parametrize(
    "path",
    [
        "org",
        "org/members",
        "org/roles",
        "org/onboarding_configs",
        "entities",
        "org/access_events",
    ],
)
def test_read_allowed(assumed_token, path):
    get(path, None, assumed_token)


@pytest.mark.parametrize(
    "path",
    [
        "org",
        # "org/api_keys/some_id",
        "org/member",  # this one is weird
        "org/members/some_id",
        "org/roles/some_id",
        # "org/onboarding_configs/some_id",
    ],
)
def test_cannot_patch(assumed_token, path):
    patch(path, dict(), assumed_token, status_code=401)


@pytest.mark.parametrize(
    "path, body",
    [
        # TODO: reinstate this when we require a header
        # (
        #     "entities/some_fp_id/vault/decrypt",
        #     dict(fields=["id.first_name"], reason="Blah"),
        # ),
        # (
        #     "entities/some_fp_id/vault/identity/document/decrypt",
        #     dict(document_type="passport", reason="blah"),
        # ),
        # (
        #     "entities/some_fp_id/decisions",
        #     dict(status="pass", annotation=dict(note="", is_pinned=False)),
        # ),
        # ("entities/some_fp_id/annotations", dict(note="", is_pinned=False)),
        # (
        #     "org/onboarding_configs",
        #     dict(name="", must_collect_data=[], can_access_data=[]),
        # ),
        ("org/members", dict(email="e@onefootprint.com", role_id="", redirect_url="")),
        ("org/members/some_id/deactivate", dict()),
        ("org/roles", dict(name="", scopes=[{"kind": "read"}], kind="api_key")),
        ("org/roles/some_id/deactivate", dict()),
        # ("org/api_keys", dict(name="")),
        # ("org/api_keys/some_id/reveal", dict()),
    ],
)
def test_cannot_post(assumed_token, path, body):
    post(path, body, assumed_token, status_code=401)


def test_super_admin_users(sandbox_user, tenant):
    # This user belongs to a different tenant. A firm employee auth context should be able to get
    # basic info on this user
    fp_id = sandbox_user.fp_id
    body = get(f"private/entities/{fp_id}", None, *tenant.db_auths)
    assert body["id"] == fp_id
    assert not body["is_live"]
    assert body["tenant_id"] == sandbox_user.tenant.id

    # Prove we're using a different auth class
    org = get(f"org", None, *tenant.db_auths)
    assert org["id"] != sandbox_user.tenant.id
