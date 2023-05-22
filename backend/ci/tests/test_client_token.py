import pytest
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import post
from tests.dashboard.utils import latest_access_event_for
from tests.auth import ClientTokenAuth


def test_generate(sandbox_user):
    data = dict(fields=["id.ssn9"])
    tenant = sandbox_user.tenant
    post(f"entities/{sandbox_user.fp_id}/client_token", data, tenant.sk.key)

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
    expected_data = {
        **sandbox_user.client.data,
        "id.ssn4": sandbox_user.client.data["id.ssn9"][-4:],
    }

    # Generate the token that can only be used to decrypt this info
    data = dict(fields=attrs_to_decrypt)
    body = post(f"entities/{sandbox_user.fp_id}/client_token", data, tenant.sk.key)
    auth_token = ClientTokenAuth(body["token"])

    # Use the token to decrypt it
    data = dict(
        fields=attrs_to_decrypt,
        reason="Hayes valley",
    )
    body = post(f"entities/vault/decrypt", data, auth_token)
    for di, value in body.items():
        assert expected_data[di] == value

    access_event = latest_access_event_for(sandbox_user.fp_id, tenant.sk)
    assert set(access_event["targets"]) == set(body)


def test_decrypt_insufficient_permissions(sandbox_user):
    # Generate the token that can only be used to decrypt first name
    data = dict(fields=["id.first_name"])
    body = post(
        f"entities/{sandbox_user.fp_id}/client_token", data, sandbox_user.tenant.sk.key
    )
    auth_token = ClientTokenAuth(body["token"])

    # Try to use the token to decrypt ssn - but we have insufficient permissions
    data = dict(
        fields=["id.ssn9"],
        reason="Hayes valley",
    )
    post(f"entities/vault/decrypt", data, auth_token, status_code=401)
