import os

from tests.utils import put, patch, get


def _logo_path():
    return os.path.dirname(__file__) + "/data/logo.png"


def test_partner_org_updates(partner_tenant):
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

    body = put(
        "partner/logo",
        None,
        *partner_tenant.db_auths,
        files=files,
    )

    assert body["logo_url"]
    logo_url = body["logo_url"]

    body = get("partner", {}, *partner_tenant.ro_db_auths)
    assert body["name"] == "Footprint Compliance Partner Integration Testing"
    assert body["logo_url"] == logo_url
