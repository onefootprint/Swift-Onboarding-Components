import pytest
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.bifrost_client import BifrostClient
from tests.utils import patch, post


@pytest.fixture(scope="session")
def bifrost(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)

    # Add a verified email address
    data = dict(kind="email", email=FIXTURE_EMAIL, action_kind="add_primary")
    body = post("hosted/user/challenge", data, bifrost.auth_token)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    post("hosted/user/challenge/verify", data, bifrost.auth_token)

    return bifrost


@pytest.mark.parametrize(
    "di,value",
    [
        ("id.phone_number", FIXTURE_PHONE_NUMBER),
        ("id.email", FIXTURE_EMAIL),
    ],
)
def test_cannot_vault_verified_ci(di, value, bifrost):
    """
    When contact info is verified, we cannot replace it via the hosted vault API.
    """
    data = {di: value}
    body = patch("hosted/user/vault", data, bifrost.auth_token, status_code=400)
    assert body["code"] == "T120"
    assert body["context"][di] == "Cannot replace verified contact information via API."


def test_can_vault_unverified_ci(sandbox_tenant):
    """
    When there's no verified email address, we can vault it via hosted vault API.
    """
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    data = {"id.email": FIXTURE_EMAIL}
    patch("hosted/user/vault", data, bifrost.auth_token)
