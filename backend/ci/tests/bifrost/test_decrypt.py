import pytest
from tests.utils import post, inherit_user_biometric


@pytest.fixture(scope="module")
def biometric_sandbox_user_auth(sandbox_user):
    """
    auth token for sandbox_user from logging in via biometric credential
    """
    auth_token = inherit_user_biometric(sandbox_user)
    return auth_token


@pytest.mark.parametrize(
    "fields_to_decrypt,expected_success",
    [
        (["id.first_name", "id.last_name"], True),
        (["id.dob"], False),
        (["id.phone_number"], False),
        (["id.ssn9"], False),
        (["business.address_line1"], False),
        (["custom.flerp"], False),
    ],
)
def test_decrypt_basic(sandbox_user, fields_to_decrypt, expected_success):
    data = dict(fields=fields_to_decrypt)
    expected_status = 200 if expected_success else 401
    body = post(
        "hosted/user/vault/decrypt",
        data,
        sandbox_user.client.auth_token,
        status_code=expected_status,
    )
    if expected_success:
        for k in fields_to_decrypt:
            assert body[k] == sandbox_user.client.data.get(k)


@pytest.mark.parametrize(
    "fields_to_decrypt,expected_success",
    [
        (["id.first_name", "id.last_name"], True),
        # Now, we can decrypt ssn9, phone, and email because we authed via webauthn!
        (["id.phone_number", "id.ssn9", "id.email", "id.dob"], True),
        (["business.address_line1"], False),
        (["custom.flerp"], False),
    ],
)
def test_decrypt_biometric(
    sandbox_user, biometric_sandbox_user_auth, fields_to_decrypt, expected_success
):
    data = dict(fields=fields_to_decrypt)
    # TODO should we 403 for insufficient perms rather than 401?
    expected_status = 200 if expected_success else 401
    body = post(
        "hosted/user/vault/decrypt",
        data,
        biometric_sandbox_user_auth,
        status_code=expected_status,
    )
    expected_data = {
        **sandbox_user.client.data,
        # TODO annoying that phone number has spaces
        "id.phone_number": sandbox_user.client.data["id.phone_number"].replace(" ", ""),
    }
    if expected_success:
        for k in fields_to_decrypt:
            assert body[k] == expected_data.get(k)
