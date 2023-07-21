"""
In this file, we test functions that are publicly exposed in our documentation. If one of these
tests breaks, you are probably making a breaking change to our public API and need to either not
do it OR do it VERY carefully.
"""
from tests.utils import get, post, patch


def test_get_users(sandbox_user, sandbox_tenant):
    body = get("/users", None, sandbox_tenant.sk.key)
    assert body["data"][0]["id"]

    email = sandbox_user.client.data["id.email"].split("#")[0]
    body = get("/users", dict(search=email), sandbox_tenant.sk.key)
    assert any(i["id"] == sandbox_user.fp_id for i in body["data"])


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
