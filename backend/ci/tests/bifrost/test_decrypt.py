import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import patch, post, get
from tests.identify_client import IdentifyClient
from tests.headers import BootstrappedFields


@pytest.fixture(scope="module")
def biometric_sandbox_user_auth(sandbox_user):
    """
    auth token for sandbox_user from logging in via biometric credential
    """
    return IdentifyClient.from_token(
        sandbox_user.client.auth_token, webauthn=sandbox_user.client.webauthn_device
    ).step_up(kind="biometric", scope="onboarding")


@pytest.mark.parametrize(
    "fields_to_decrypt,expected_success",
    [
        (["id.first_name", "id.last_name"], True),
        (["id.dob"], True),
        (["id.phone_number", "id.email"], True),
        (["id.ssn9"], False),
        (["business.address_line1"], False),
        (["custom.flerp"], False),
    ],
)
def test_decrypt_basic(sandbox_user, fields_to_decrypt, expected_success):
    data = dict(fields=fields_to_decrypt)
    expected_status = 200 if expected_success else 403
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
        (["id.first_name", "id.last_name", "id.phone_number", "id.email"], True),
        # Now, we can decrypt ssn9 because we authed via webauthn!
        (["id.ssn9", "id.dob"], True),
        (["business.address_line1"], False),
        (["custom.flerp"], False),
    ],
)
def test_decrypt_biometric(
    sandbox_user, biometric_sandbox_user_auth, fields_to_decrypt, expected_success
):
    data = dict(fields=fields_to_decrypt)
    expected_status = 200 if expected_success else 403
    body = post(
        "hosted/user/vault/decrypt",
        data,
        biometric_sandbox_user_auth,
        status_code=expected_status,
    )
    if expected_success:
        for k in fields_to_decrypt:
            assert body[k] == sandbox_user.client.decrypted_data.get(k)


def test_bootstrapped_data(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    data = {
        "id.first_name": "Hayes",
        "id.middle_name": "Best",
        "id.last_name": "Valley",
    }
    bootstrapped_fields_h = BootstrappedFields(
        ",".join(["id.first_name", "id.last_name"])
    )

    patch("hosted/user/vault", data, bifrost.auth_token, bootstrapped_fields_h)
    user = bifrost.run()

    # Make sure the data source is bootstrap
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    expected = [
        ("id.first_name", "bootstrap"),
        ("id.last_name", "bootstrap"),
        ("id.middle_name", "hosted"),
    ]
    for di, source in expected:
        assert (
            next(i for i in body["data"] if i["identifier"] == di)["source"] == source
        )
