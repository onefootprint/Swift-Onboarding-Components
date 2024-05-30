import pytest
import requests
from requests.auth import HTTPBasicAuth
from tests.utils import post, get, patch, url
from tests.constants import CUSTODIAN_AUTH
from tests.bifrost_client import BifrostClient
from tests.constants import ENVIRONMENT
from tests.utils import _gen_random_n_digit_number


def test_environment():
    assert ENVIRONMENT in {
        "local",
        "ci",
        "dev",
        "ephemeral",
        "production",
    }, f"Unknown environment: {ENVIRONMENT}"


def test_tenant_create():
    """
    We should not be able to create a test tenant with a primary key that doesn't start with
    _private_it_org_
    """
    org_data = {
        "id": "org_asdf",
        "name": "Should never be created",
        "is_live": False,
    }
    body = post("private/test_tenant", org_data, CUSTODIAN_AUTH, status_code=400)
    assert (
        body["error"]["message"]
        == "Cannot inherit credentials for a non-integration test tenant"
    )


def test_basic_auth(sandbox_tenant):
    response = requests.get(
        url("users"),
        auth=HTTPBasicAuth(sandbox_tenant.sk.key.value, ""),
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    "sandbox_outcome,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        (None, "pass", False),
        ("manual_review", "fail", True),
    ],
)
def test_get_user(
    sandbox_tenant, sandbox_outcome, expected_status, expected_requires_manual_review
):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result=sandbox_outcome
    )
    user = bifrost.run()

    body = get(f"/users/{user.fp_id}", None, sandbox_tenant.sk.key)
    assert body["id"] == user.fp_id
    assert body["requires_manual_review"] == expected_requires_manual_review
    assert body["status"] == expected_status


def test_check_session(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    bifrost.run()
    body = get(f"hosted/check_session", None, bifrost.auth_token)
    assert body == "active"
