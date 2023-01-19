import pytest
from tests.types import SecretApiKey
from tests.utils import (
    get,
    post,
    patch,
)


@pytest.fixture(scope="session")
def secret_key(sandbox_tenant):
    data = dict(name="Test secret key")
    body = post("org/api_keys", data, sandbox_tenant.sk.key)
    return SecretApiKey.from_response(body)


def test_api_key_check(secret_key):
    body = get("org/api_keys/check", None, secret_key.key)
    assert body["id"] == secret_key.id


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
    patch(f"org/api_keys/flerpderp", data, secret_key.key, status_code=404)

    # Update the name and status
    body = patch(f"org/api_keys/{secret_key.id}", data, secret_key.key)
    key = body
    assert key["name"] == new_name
    assert key["status"] == "disabled"

    # Verify the update, using the reveal endpoint as the detail endpoint
    body = post(f"org/api_keys/{secret_key.id}/reveal", None, sandbox_tenant.sk.key)
    assert body["name"] == new_name
    assert body["status"] == "disabled"

    # Verify we can't use the disabled API key for anything anymore
    post(
        f"org/api_keys/{secret_key.id}/reveal",
        None,
        secret_key.key,
        status_code=401,
    )
