import pytest
from tests.utils import get, post, _gen_random_n_digit_number


@pytest.fixture(scope="session")
def admin_role(sandbox_tenant):
    body = get("org/roles", None, sandbox_tenant.auth_token)
    roles = body["data"]
    return next(i for i in roles if i["scopes"][0]["kind"] == "admin")
