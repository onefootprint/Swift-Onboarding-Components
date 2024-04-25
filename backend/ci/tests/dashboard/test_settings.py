from tests.utils import get, patch


def test_get_org(sandbox_user):
    body = get("org", None, *sandbox_user.tenant.db_auths)
    tenant = body
    assert tenant["name"] == sandbox_user.tenant.name
    assert not tenant["is_sandbox_restricted"]


def test_patch_org(sandbox_user):
    data = dict(support_website="onefootprint.com")
    patch("org", data, *sandbox_user.tenant.db_auths)

    body = get("org", data, *sandbox_user.tenant.db_auths)
    assert body["support_website"] == "onefootprint.com"

    data = dict(clear_support_website=True)
    patch("org", data, *sandbox_user.tenant.db_auths)

    body = get("org", data, *sandbox_user.tenant.db_auths)
    assert not body["support_website"]
