from tests.utils import _gen_random_sandbox_id, create_tenant, post, get
from tests.identify_client import IdentifyClient


def test_expire_dashboard_session(sandbox_tenant_data):
    """
    Test that we get the proper error code when a session expires. The dashboard relies upon this.
    Here, we test with a user session just because they're easier for integration tests.
    """
    # Same tenant as the sandbox_tenant, but we call the `private/test_tenant` endpoint again
    # to make an auth token that is only used in this test
    original_tenant = create_tenant(*sandbox_tenant_data)
    db_auth = original_tenant.auth_token

    get("org", None, db_auth)
    post("org/auth/logout", None, db_auth)
    body = get("org", None, db_auth, status_code=401)
    assert body["code"] == "E118"


def test_expire_user_session(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(
        sandbox_tenant.default_ob_config, sandbox_id
    ).create_user()
    get("hosted/user/auth_methods", None, auth_token)
    post("hosted/user/expire_session", None, auth_token)
    body = get("hosted/user/auth_methods", None, auth_token, status_code=401)
    assert body["code"] == "E118"
