import pytest
from tests.types import SecretApiKey
from tests.auth import DashboardAuthIsLive
from tests.utils import (
    get,
    post,
    patch,
)


@pytest.fixture(scope="session")
def secret_key(sandbox_tenant, admin_role):
    data = dict(name="Test secret key", role_id=admin_role["id"])
    body = post("org/api_keys", data, sandbox_tenant.auth_token)
    return SecretApiKey.from_response(body)


@pytest.fixture(scope="session")
def limited_secret_key(sandbox_tenant, limited_role):
    data = dict(name="Test secret key", role_id=limited_role["id"])
    body = post(
        "org/api_keys", data, sandbox_tenant.auth_token, DashboardAuthIsLive("false")
    )
    return (body, SecretApiKey.from_response(body))


def test_api_key_limited_role(
    limited_secret_key,
    sandbox_tenant,
    admin_role,
    must_collect_data,
    can_access_data,
    sandbox_user,
):
    key = limited_secret_key[1].key

    # Can do ob config operations with limited role
    data = {
        "name": "FLERP",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }
    post("org/onboarding_configs", data, key)

    # Cannot do other actions with limited role
    decrypt_data = dict(fields=["id.first_name"], reason="HI")
    fp_id = sandbox_user.fp_id
    post(f"entities/{fp_id}/vault/decrypt", decrypt_data, key, status_code=401)

    # Now, change the key's role
    data = dict(role_id=admin_role["id"])
    key_id = limited_secret_key[0]["id"]
    patch(
        f"org/api_keys/{key_id}",
        data,
        sandbox_tenant.auth_token,
        DashboardAuthIsLive("false"),
    )

    # And now can do other actions with admin permissions
    post(f"entities/{fp_id}/vault/decrypt", decrypt_data, key)


def test_api_key_list(secret_key):
    body = get("org/api_keys", None, secret_key.key)
    key = next(key for key in body["data"] if key["id"] == secret_key.id)
    assert key["name"] == secret_key.name
    assert key["status"] == secret_key.status
    assert key["created_at"]
    assert "key" not in key
    assert key["last_used_at"]


def test_api_key_reveal(secret_key):
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, secret_key.key)
    key = body
    assert key["key"] == secret_key.key.value
    assert key["status"] == "enabled"
    assert key["name"] == "Test secret key"


def test_api_key_update(sandbox_tenant, secret_key):
    # Test failing to update
    new_name = "Updated secret key name"
    data = dict(name=new_name, status="disabled")
    patch(f"org/api_keys/flerpderp", data, sandbox_tenant.auth_token, status_code=404)

    # Update the name and status
    body = patch(f"org/api_keys/{secret_key.id}", data, sandbox_tenant.auth_token)
    key = body
    assert key["name"] == new_name
    assert key["status"] == "disabled"

    # Verify the update, using the reveal endpoint as the detail endpoint
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, sandbox_tenant.auth_token)
    assert body["name"] == new_name
    assert body["status"] == "disabled"

    # Verify we can't use the disabled API key for anything anymore
    get(
        f"entities",
        None,
        secret_key.key,
        status_code=401,
    )
