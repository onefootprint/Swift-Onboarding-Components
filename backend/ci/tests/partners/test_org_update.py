import os
import requests
from tests.utils import put, patch, get, _gen_random_str


def test_partner_org_updates(partner_tenant):
    # SVG logo not allowed
    logo_path = os.path.dirname(__file__) + "/data/malicious_logo.svg"
    files = {"upload_file": ("logo.svg", open(logo_path, "rb"), "image/svg")}
    resp = put(
        "partner/logo", None, *partner_tenant.db_auths, files=files, status_code=400
    )
    assert resp["code"] == "E112"

    # SVG uploaded with PNG content type is downloaded as a PNG.
    files = {"upload_file": ("logo.svg", open(logo_path, "rb"), "image/png")}
    body = put("partner/logo", None, *partner_tenant.db_auths, files=files)
    assert body["logo_url"].endswith(".png")

    resp = requests.get(body["logo_url"])
    resp.raise_for_status()
    assert resp.headers["Content-Type"] == "image/png"

    # POST /partner/logo
    logo_path = os.path.dirname(__file__) + "/data/logo.png"
    files = {"upload_file": ("logo.png", open(logo_path, "rb"), "image/png")}

    body = put(
        "partner/logo",
        None,
        *partner_tenant.db_auths,
        files=files,
    )

    assert body["logo_url"]
    logo_url = body["logo_url"]

    # GET /partner
    body = get("partner", {}, *partner_tenant.ro_db_auths)
    assert body["name"] == "Footprint Compliance Partner Integration Testing"
    assert body["logo_url"] == logo_url
    old_website_url = body["website_url"]

    # PATCH /partner
    patch(
        "partner",
        {
            "website_url": "https://onefootprint.com/?t=" + _gen_random_str(16),
        },
        *partner_tenant.db_auths,
    )
    body = get("partner", {}, *partner_tenant.ro_db_auths)
    # Website URL was updated. (Checking equality is a flake.)
    assert old_website_url != body["website_url"]
    # Logo wasn't cleared out.
    assert body["logo_url"]

    # Empty PATCH works.
    patch("partner", {}, *partner_tenant.db_auths)
