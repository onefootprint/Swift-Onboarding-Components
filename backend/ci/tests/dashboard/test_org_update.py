import pytest
import os
import requests

from tests.utils import (
    SERVER_VERSION_HEADER,
    HttpError,
    IncorrectServerVersion,
    _make_request,
    url,
)


def _logo_path():
    return os.path.dirname(__file__) + "/logo.png"


def test_org_update_logo(sandbox_tenant):
    files = {"upload_file": ("logo.png", open(_logo_path(), "rb"), "image/png")}

    body = _make_request(
        method=requests.put,
        path="org/logo",
        status_code=200,
        auths=[sandbox_tenant.auth_token],
        files=files,
    ).json()

    assert body["logo_url"]
