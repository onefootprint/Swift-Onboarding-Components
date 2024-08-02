import os
import requests
from tests.utils import get_raw, put, patch, get


def test_org_update_logo(sandbox_tenant):
    logo_path = os.path.dirname(__file__) + "/logo.png"

    files = {"upload_file": ("logo.png", open(logo_path, "rb"), "image/png")}

    body = put("org/logo", None, *sandbox_tenant.db_auths, files=files)
    assert body["logo_url"]

    body = get("org", None, *sandbox_tenant.db_auths)
    assert body["logo_url"]

    # SVG not allowed
    logo_path = os.path.dirname(__file__) + "/malicious_logo.svg"
    files = {"upload_file": ("logo.svg", open(logo_path, "rb"), "image/svg")}
    resp = put("org/logo", None, *sandbox_tenant.db_auths, files=files, status_code=400)
    assert resp["code"] == "E112"

    # SVG uploaded with PNG content type is downloaded as a PNG.
    files = {"upload_file": ("logo.svg", open(logo_path, "rb"), "image/png")}
    body = put("org/logo", None, *sandbox_tenant.db_auths, files=files)
    assert body["logo_url"].endswith(".png")

    resp = requests.get(body["logo_url"])
    resp.raise_for_status()
    assert resp.headers["Content-Type"] == "image/png"


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
