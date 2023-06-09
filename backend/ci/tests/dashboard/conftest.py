import pytest
from tests.utils import get, post, _gen_random_n_digit_number


@pytest.fixture(scope="session")
def limited_role(sandbox_tenant):
    suffix = _gen_random_n_digit_number(10)
    role_data = dict(
        name=f"Test limited role {suffix}",
        scopes=["read", "onboarding_configuration"],
    )
    body = post("org/roles", role_data, sandbox_tenant.auth_token)
    assert body["name"] == role_data["name"]
    assert set(i for i in body["scopes"]) == set(i for i in role_data["scopes"])
    return body


@pytest.fixture(scope="session")
def admin_role(sandbox_tenant):
    body = get("org/roles", None, sandbox_tenant.auth_token)
    roles = body["data"]
    return next(i for i in roles if i["scopes"][0] == "admin")
