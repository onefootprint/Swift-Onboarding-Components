import pytest
from tests.utils import post, get
from tests.headers import DashboardAuth, IsLive

LIVE = IsLive("true")
SANDBOX = IsLive("false")


@pytest.fixture
def docs_token(sandbox_tenant):
    data = dict(tenant_id=sandbox_tenant.id, purpose="docs")
    body = post("org/auth/assume_role", data, *sandbox_tenant.db_auths)
    assert body["tenant"]["id"] == sandbox_tenant.id
    assert body["token"].startswith("dtok_")
    docs_token = DashboardAuth(body["token"])

    body = get("org/member", None, docs_token, SANDBOX)
    assert body["tenant"]["id"] == sandbox_tenant.id
    assert set(i["kind"] for i in body["scopes"]) == {"read", "api_keys"}

    return docs_token


def test_docs_token_sandbox_only(docs_token):
    get("org/api_keys", None, docs_token, SANDBOX)

    body = get("org/api_keys", None, docs_token, LIVE, status_code=403)
    assert body["message"] == "Not allowed: docs site cannot access production data"


def test_cannot_elevate_docs_token(docs_token, sandbox_tenant):
    data = dict(tenant_id=sandbox_tenant.id, purpose="dashboard")
    body = post("org/auth/assume_role", data, docs_token, status_code=403)
    assert (
        body["message"]
        == "Not allowed: cannot create a session with the requested purpose"
    )
