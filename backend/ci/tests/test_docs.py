"""
In this file, we test functions that are publicly exposed in our documentation. If one of these
tests breaks, you are probably making a breaking change to our public API and need to either not
do it OR do it VERY carefully.
"""

from tests.utils import get


def test_get_users(sandbox_user, sandbox_tenant):
    body = get("/users", None, sandbox_tenant.sk.key)
    assert body["data"][0]["id"]

    email = sandbox_user.client.data["id.email"]
    body = get("/users", dict(search=email), sandbox_tenant.sk.key)
    assert any(i["id"] == sandbox_user.fp_id for i in body["data"])


# TODO add tests for everything else documented
