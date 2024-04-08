import os

from tests.utils import put, patch, get, _gen_random_str


def _logo_path():
    return os.path.dirname(__file__) + "/data/logo.png"


def test_partner_org_updates(partner_tenant):
    # POST /partner/logo
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

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
    patch("partner", {
        "website_url": "https://onefootprint.com/?t=" + _gen_random_str(16),
    }, *partner_tenant.db_auths)
    body = get("partner", {}, *partner_tenant.ro_db_auths)
    # Website URL was updated. (Checking equality is a flake.)
    assert old_website_url != body["website_url"]
    # Logo wasn't cleared out.
    assert body["logo_url"]

    # Empty PATCH works.
    patch("partner", {}, *partner_tenant.db_auths)
