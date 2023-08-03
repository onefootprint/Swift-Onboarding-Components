import os

from tests.utils import put


def _logo_path():
    return os.path.dirname(__file__) + "/logo.png"


def test_org_update_logo(sandbox_tenant):
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

    body = put(
        "org/logo",
        None,
        *sandbox_tenant.db_auths,
        files=files,
    )

    assert body["logo_url"]
