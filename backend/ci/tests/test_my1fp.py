import pytest
from tests.identify_client import IdentifyClient
from tests.utils import get, post


@pytest.fixture(scope="module")
def auth_token(sandbox_user):
    """
    My1fp-specific auth token
    """
    auth_token = IdentifyClient.from_user(
        sandbox_user,
        # Specifically don't provide any ob public key auth
        playbook=None,
    ).login(scope="my1fp")
    body = get("/hosted/user/token", None, auth_token)
    assert set(body["scopes"]) == {"basic_profile", "explicit_auth"}
    return auth_token


def test_authorized_orgs(sandbox_user, auth_token):
    body = get("/hosted/user/authorized_orgs", None, auth_token)
    assert len(body) == 1
    ob = body[0]
    assert ob["org_name"] == sandbox_user.client.ob_config.tenant.name
    assert set(ob["can_access_data"]) == set(
        sandbox_user.client.ob_config.must_collect_data
    )


BASIC_FIELDS = [
    "id.address_line1",
    "id.address_line2",
    "id.city",
    "id.state",
    "id.country",
    "id.zip",
    "id.first_name",
    "id.last_name",
    "id.dob",
    "id.phone_number",
    "id.email",
]
SENSITIVE_FIELDS = [
    "id.ssn4",
    "id.ssn9",
]


def test_decrypt_basic(sandbox_user, auth_token):
    data = dict(fields=BASIC_FIELDS)
    body = post("/hosted/user/vault/decrypt", data, auth_token)
    for k in BASIC_FIELDS:
        assert body[k] == sandbox_user.client.decrypted_data[k]

    for f in SENSITIVE_FIELDS:
        data = dict(fields=[f])
        post("/hosted/user/vault/decrypt", data, auth_token, status_code=403)


def test_decrypt_sensitive(sandbox_user, auth_token):
    # First login, identified by the existing auth token
    auth_token = IdentifyClient.from_token(
        auth_token,
        webauthn=sandbox_user.client.webauthn_device,
        expected_scopes={"basic_profile", "explicit_auth"},
    ).login(kind="biometric", scope="my1fp")
    body = get("/hosted/user/token", None, auth_token)
    assert "sensitive_profile" in body["scopes"]

    # Now, we should be able to decrypt sensitive data
    fields = BASIC_FIELDS + SENSITIVE_FIELDS
    data = dict(fields=fields)
    body = post("/hosted/user/vault/decrypt", data, auth_token)
    for k in fields:
        assert body[k] == sandbox_user.client.decrypted_data[k]
