import os

from tests.utils import put, patch, get


def _logo_path():
    return os.path.dirname(__file__) + "/data/logo.png"


def test_partner_org_update_logo(partner_tenant):
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

    body = put(
        "partner/logo",
        None,
        *partner_tenant.db_auths,
        files=files,
    )

    assert body["logo_url"]
