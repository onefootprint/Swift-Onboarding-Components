import pytest
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import post, patch
from tests.dashboard.utils import latest_access_event_for
from tests.headers import ClientTokenAuth


def client_token_with_scopes(user, **kwargs):
    body = post(f"entities/{user.fp_id}/client_token", kwargs, user.tenant.sk.key)
    return ClientTokenAuth(body["token"])


def test_generate(sandbox_user):
    data = dict(fields=["id.ssn9"], ttl=60 * 60, scopes=["decrypt"])
    tenant = sandbox_user.tenant
    body = post(f"entities/{sandbox_user.fp_id}/client_token", data, tenant.sk.key)
    assert body["expires_at"]

    # Can't generate with dashboard auth
    post(
        f"entities/{sandbox_user.fp_id}/client_token",
        data,
        tenant.auth_token,
        status_code=401,
    )


@pytest.mark.parametrize("attrs_to_decrypt", FIELDS_TO_DECRYPT)
def test_decrypt(sandbox_user, attrs_to_decrypt):
    tenant = sandbox_user.tenant
    # Generate the token that can only be used to decrypt this info
    auth_token = client_token_with_scopes(
        sandbox_user, fields=attrs_to_decrypt, scopes=["decrypt"]
    )

    # Use the token to decrypt it
    data = dict(
        fields=attrs_to_decrypt,
        reason="Hayes valley",
    )
    body = post(f"entities/vault/decrypt", data, auth_token)
    for di, value in body.items():
        assert sandbox_user.client.decrypted_data[di] == value

    access_event = latest_access_event_for(sandbox_user.fp_id, tenant.sk)
    assert set(access_event["targets"]) == set(body)


def test_decrypt_reason(sandbox_user):
    tenant = sandbox_user.tenant
    auth_token = client_token_with_scopes(
        sandbox_user, fields=["id.first_name"], scopes=["decrypt"]
    )
    # Shouldn't be able to decrypt without a reason
    data = dict(fields=["id.first_name"])
    post(f"entities/vault/decrypt", data, auth_token, status_code=400)

    # Should work with reason specified on auth token
    auth_token = client_token_with_scopes(
        sandbox_user,
        fields=["id.first_name"],
        scopes=["decrypt"],
        decrypt_reason="Hayes valley",
    )
    post(f"entities/vault/decrypt", data, auth_token)
    access_event = latest_access_event_for(sandbox_user.fp_id, tenant.sk)
    assert access_event["reason"] == "Hayes valley"

    # And should be able to override the reason
    data = dict(
        fields=["id.first_name"],
        reason="Hayes valley2",
    )
    post(f"entities/vault/decrypt", data, auth_token)
    access_event = latest_access_event_for(sandbox_user.fp_id, tenant.sk)
    assert access_event["reason"] == "Hayes valley2"


def test_vault(sandbox_user):
    auth_token = client_token_with_scopes(
        sandbox_user,
        fields=["id.first_name", "id.last_name"],
        scopes=["decrypt", "vault"],
    )

    data = {
        "id.first_name": "Hayes",
        "id.last_name": "Valley",
    }
    post(f"entities/vault/validate", data, auth_token)
    patch(f"entities/vault", data, auth_token)

    data = dict(
        fields=["id.first_name", "id.last_name"],
        reason="Hayes valley",
    )
    body = post(f"entities/vault/decrypt", data, auth_token)
    assert body["id.first_name"] == "Hayes"
    assert body["id.last_name"] == "Valley"


def test_insufficient_permissions(sandbox_user):
    auth_tokens = [
        # Token with incorrect decrypt perms
        client_token_with_scopes(
            sandbox_user, fields=["id.first_name"], scopes=["decrypt"]
        ),
        # Token with vault perms
        client_token_with_scopes(sandbox_user, fields=["id.ssn9"], scopes=["vault"]),
    ]

    # Try to use the token to decrypt ssn - but we have insufficient permissions
    for auth_token in auth_tokens:
        data = dict(
            fields=["id.ssn9"],
            reason="Hayes valley",
        )
        post(f"entities/vault/decrypt", data, auth_token, status_code=401)

    auth_tokens = [
        # Token with incorrect vault perms
        client_token_with_scopes(
            sandbox_user, fields=["id.first_name"], scopes=["vault"]
        ),
        # Token with decrypt perms
        client_token_with_scopes(sandbox_user, fields=["id.ssn9"], scopes=["decrypt"]),
    ]
    for auth_token in auth_tokens:
        data = {
            "id.ssn9": "123-12-1234",
        }
        post(f"entities/vault/validate", data, auth_token, status_code=401)
        patch(f"entities/vault", data, auth_token, status_code=401)


def test_large_objects(sandbox_user):
    auth_token = client_token_with_scopes(
        sandbox_user, fields=["custom.large_id"], scopes=["decrypt", "vault"]
    )

    di = "custom.large_id"
    obj = {"some_key": "hello world!" * 100_000}

    post(f"entities/vault/{di}/upload", obj, auth_token)

    resp = post(
        f"entities/vault/decrypt",
        {
            "fields": [di],
            "reason": "i wanna2",
        },
        auth_token,
    )
    import base64, json

    assert resp[di]
    obj_out = base64.b64decode(resp[di])
    assert json.loads(obj_out)["some_key"] == obj["some_key"]
