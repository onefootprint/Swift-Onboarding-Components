import pytest
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import post, patch, get_raw, get
from tests.dashboard.utils import latest_audit_event_for
from tests.headers import ClientTokenAuth


def client_token_with_scope(user, **kwargs):
    body = post(f"users/{user.fp_id}/client_token", kwargs, user.tenant.sk.key)
    return ClientTokenAuth(body["token"]), body


def test_generate(sandbox_user):
    data = dict(fields=["id.ssn9"], ttl=60 * 60, scope="decrypt")
    tenant = sandbox_user.tenant
    body = post(f"users/{sandbox_user.fp_id}/client_token", data, tenant.sk.key)
    assert body["expires_at"]

    # Can't generate with dashboard auth
    post(
        f"users/{sandbox_user.fp_id}/client_token",
        data,
        *tenant.db_auths,
        status_code=401,
    )


@pytest.mark.parametrize("attrs_to_decrypt", FIELDS_TO_DECRYPT)
def test_decrypt(sandbox_user, attrs_to_decrypt):
    tenant = sandbox_user.tenant
    # Generate the token that can only be used to decrypt this info
    auth_token, _ = client_token_with_scope(
        sandbox_user, fields=attrs_to_decrypt, scope="decrypt"
    )

    # Use the token to decrypt it
    data = dict(
        fields=attrs_to_decrypt,
        reason="Hayes valley",
    )
    body = post(f"entities/vault/decrypt", data, auth_token)
    for di, value in body.items():
        assert sandbox_user.client.decrypted_data[di] == value

    audit_event = latest_audit_event_for(sandbox_user.fp_id, tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == set(body)


def test_decrypt_reason(sandbox_user):
    tenant = sandbox_user.tenant
    auth_token, _ = client_token_with_scope(
        sandbox_user, fields=["id.first_name"], scope="decrypt"
    )
    # Shouldn't be able to decrypt without a reason
    data = dict(fields=["id.first_name"])
    post(f"entities/vault/decrypt", data, auth_token, status_code=400)

    # Should work with reason specified on auth token
    auth_token, _ = client_token_with_scope(
        sandbox_user,
        fields=["id.first_name"],
        scope="decrypt",
        decrypt_reason="Hayes valley",
    )
    post(f"entities/vault/decrypt", data, auth_token)
    audit_event = latest_audit_event_for(sandbox_user.fp_id, tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert audit_event["detail"]["data"]["reason"] == "Hayes valley"

    # And should be able to override the reason
    data = dict(
        fields=["id.first_name"],
        reason="Hayes valley2",
    )
    post(f"entities/vault/decrypt", data, auth_token)
    audit_event = latest_audit_event_for(sandbox_user.fp_id, tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert audit_event["detail"]["data"]["reason"] == "Hayes valley2"


def test_vault(sandbox_user, sandbox_tenant):
    auth_token, _ = client_token_with_scope(
        sandbox_user,
        fields=["id.first_name", "id.last_name"],
        scope="vault_and_decrypt",
    )

    body = get(f"entities/client_token", None, auth_token)
    assert set(body["vault_fields"]) == set(["id.first_name", "id.last_name"])
    assert body["tenant"]["name"] == sandbox_tenant.name

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


def test_vault_card(sandbox_user, sandbox_tenant):
    auth_token, body = client_token_with_scope(
        sandbox_user,
        scope="vault_card",
    )
    fields = body["fields"]
    assert all(f.startswith("card.") for f in fields)
    assert set(f.split(".")[-1] for f in fields) == {
        "number",
        "expiration",
        "cvc",
        "name",
        "zip",
        "country",
    }
    card_alias = fields[0].split(".")[1]

    body = get(f"entities/client_token", None, auth_token)
    assert set(body["vault_fields"]) == set(fields)

    vault_data = {
        f"card.{card_alias}.number": "4428680502681658",
        f"card.{card_alias}.cvc": "101",
    }
    post(f"entities/vault/validate", vault_data, auth_token)
    patch(f"entities/vault", vault_data, auth_token)

    data = dict(
        fields=[f"card.{card_alias}.number", f"card.{card_alias}.cvc"],
        reason="Hayes valley",
    )
    body = post(
        f"entities/{sandbox_user.fp_id}/vault/decrypt", data, sandbox_tenant.sk.key
    )
    assert all(body[k] == vault_data[k] for k in vault_data.keys())


def test_insufficient_permissions(sandbox_user):
    auth_tokens = [
        # Token with incorrect decrypt perms
        client_token_with_scope(
            sandbox_user, fields=["id.first_name"], scope="decrypt"
        )[0],
        # Token with vault perms
        client_token_with_scope(sandbox_user, fields=["id.ssn9"], scope="vault")[0],
    ]

    # Try to use the token to decrypt ssn - but we have insufficient permissions
    for auth_token in auth_tokens:
        data = dict(
            fields=["id.ssn9"],
            reason="Hayes valley",
        )
        post(f"entities/vault/decrypt", data, auth_token, status_code=403)

    auth_tokens = [
        # Token with incorrect vault perms
        client_token_with_scope(sandbox_user, fields=["id.first_name"], scope="vault")[
            0
        ],
        # Token with decrypt perms
        client_token_with_scope(sandbox_user, fields=["id.ssn9"], scope="decrypt")[0],
    ]
    for auth_token in auth_tokens:
        data = {
            "id.ssn9": "123-12-1234",
        }
        post(f"entities/vault/validate", data, auth_token, status_code=403)
        patch(f"entities/vault", data, auth_token, status_code=403)


def test_vault_legacy(sandbox_user, sandbox_tenant):
    """
    Grid (and some other tenants) are still using the old version of this API that allows providing
    multiple scopes. Keep this integration test for as long as tenants are still using the legacy version
    """
    auth_token, _ = client_token_with_scope(
        sandbox_user,
        fields=["id.first_name", "id.last_name"],
        scopes=["vault", "decrypt"],
    )

    body = get(f"entities/client_token", None, auth_token)
    assert set(body["vault_fields"]) == set(["id.first_name", "id.last_name"])
    assert body["tenant"]["name"] == sandbox_tenant.name

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


@pytest.mark.parametrize("di", ["document.custom.large_id", "custom.large_id"])
def test_large_objects(sandbox_user, di):
    auth_token, _ = client_token_with_scope(
        sandbox_user, fields=[di], scope="vault_and_decrypt"
    )

    obj = {"some_key": "hello world!" * 100_000}

    body = post(f"entities/vault/{di}/upload", obj, auth_token)
    assert body == {}

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

    # Test decrypt downloading
    token, _ = client_token_with_scope(
        sandbox_user,
        fields=[di],
        scope="decrypt_download",
        decrypt_reason="flerp",
    )

    response = get_raw(f"entities/vault/decrypt/{token.value}")
    assert json.loads(response.content) == obj
    assert response.headers.get("content-type") == "application/json"
