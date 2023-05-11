import pytest
from tests.utils import (
    inherit_user,
    get,
    post,
    inherit_user_biometric,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="module")
def auth_token(sandbox_user_real_phone, twilio):
    """
    My1fp-specific auth token
    """
    phone_number = sandbox_user_real_phone.client.data["id.phone_number"]
    # Specifically inherit the user through the identify flow without providing any ob public key auth
    auth_token = inherit_user(twilio, phone_number)
    body = get("/hosted/user/token", None, auth_token)
    assert body["scopes"] == ["BasicProfile"]
    return auth_token


@pytest.fixture(scope="module")
def biometric_auth_token(sandbox_user_real_phone, twilio):
    """
    Auth token with an elevated scope from authing with biometric rather than sms
    """
    auth_token = inherit_user_biometric(sandbox_user_real_phone)
    return auth_token


def test_authorized_orgs(sandbox_user_real_phone, auth_token):
    body = get("/hosted/user/authorized_orgs", None, auth_token)
    assert len(body) == 1
    ob = body[0]
    assert ob["org_name"] == sandbox_user_real_phone.client.ob_config.tenant.name
    assert set(ob["can_access_data"]) == set(
        sandbox_user_real_phone.client.ob_config.can_access_data
    )


BASIC_FIELDS = [
    "id.city",
    "id.state",
    "id.country",
    "id.zip",
    "id.first_name",
    "id.last_name",
]
SENSITIVE_FIELDS = [
    "id.address_line1",
    "id.address_line2",
    "id.dob",
    "id.phone_number",
    "id.email",
    "id.ssn4",
    "id.ssn9",
]


def test_decrypt_basic(sandbox_user_real_phone, auth_token):
    data = dict(fields=BASIC_FIELDS)
    body = post("/hosted/user/vault/decrypt", data, auth_token)
    for k in BASIC_FIELDS:
        assert body[k] == sandbox_user_real_phone.client.data[k]

    for f in SENSITIVE_FIELDS:
        data = dict(fields=[f])
        post("/hosted/user/vault/decrypt", data, auth_token, status_code=401)


def test_decrypt_sensitive(sandbox_user_real_phone, biometric_auth_token):
    fields = BASIC_FIELDS + SENSITIVE_FIELDS
    data = dict(fields=fields)
    body = post("/hosted/user/vault/decrypt", data, biometric_auth_token)
    verified_data = {
        **sandbox_user_real_phone.client.data,
        # Grrr, phone number spaces strike again
        "id.ssn4": sandbox_user_real_phone.client.data["id.ssn9"][-4:],
        "id.phone_number": sandbox_user_real_phone.client.data[
            "id.phone_number"
        ].replace(" ", ""),
    }
    for k in fields:
        assert body[k] == verified_data[k]
