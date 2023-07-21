"""
In this file, we test functions that are publicly exposed in our documentation. If one of these
tests breaks, you are probably making a breaking change to our public API and need to either not
do it OR do it VERY carefully.
"""
import pytest
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number
from tests.utils import get, post, patch


def test_get_users(sandbox_user, sandbox_tenant):
    body = get("/users", None, sandbox_tenant.sk.key)
    assert body["data"][0]["id"]

    email = sandbox_user.client.data["id.email"].split("#")[0]
    body = get("/users", dict(search=email), sandbox_tenant.sk.key)
    assert any(i["id"] == sandbox_user.fp_id for i in body["data"])


@pytest.mark.parametrize(
    "sandbox_id,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        ("blah_123", "pass", False),
        ("manualreview", "fail", True),
    ],
)
def test_get_user(
    twilio, sandbox_tenant, sandbox_id, expected_status, expected_requires_manual_review
):
    seed = _gen_random_n_digit_number(10)
    sandbox_id = f"{sandbox_id}{seed}"
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    user = bifrost.run()

    body = get(f"/users/{user.fp_id}", None, sandbox_tenant.sk.key)
    assert body["id"] == user.fp_id
    assert body["requires_manual_review"] == expected_requires_manual_review
    assert body["status"] == expected_status


def test_standalone_vaults(tenant):
    body = post("/users", None, tenant.sk.key)
    assert body["id"]

    data = {
        "id.first_name": "Jane",
        "id.last_name": "Joe",
        "id.dob": "1988-12-30",
        "id.ssn9": "12-121-1212",
        "custom.cc4": "4242",
    }
    body = post("/users", data, tenant.sk.key)
    fp_id = body["id"]

    data = {"id.email": "jane@acmebank.com", "custom.ach_account": "111122224444"}
    patch(f"/users/{fp_id}/vault", data, tenant.sk.key)

    body = get("/users", dict(search="Jane"), tenant.sk.key)
    assert any(i["id"] == fp_id for i in body["data"])


# TODO add tests for everything else documented
