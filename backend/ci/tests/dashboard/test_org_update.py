import os

from tests.utils import put, patch, get


def _logo_path():
    return os.path.dirname(__file__) + "/logo.png"


def test_org_update_logo(sandbox_tenant):
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

    body = put("org/logo", None, *sandbox_tenant.db_auths, files=files)
    assert body["logo_url"]

    body = get("org", None, *sandbox_tenant.db_auths)
    assert body["logo_url"]


def test_allowed_origins(sandbox_tenant):
    body = patch(
        "/org/client_security_config",
        dict(allowed_origins=["https://google.com", "https://facebook.com"]),
        *sandbox_tenant.db_auths,
    )
    assert set(body["allowed_origins"]) == set(
        ["https://google.com", "https://facebook.com"]
    )
    body = patch(
        "/org/client_security_config",
        dict(allowed_origins=["https://onefootprint.com"]),
        *sandbox_tenant.db_auths,
    )
    assert set(body["allowed_origins"]) == set(["https://onefootprint.com"])
