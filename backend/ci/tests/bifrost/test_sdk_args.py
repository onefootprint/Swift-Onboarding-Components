import pytest

from tests.utils import get, post
from tests.headers import SdkArgs


def test_sdk_args_fail_validation():
    post("/org/sdk_args", {"kind": "verify_v1", "data": {}}, status_code=400)
    post(
        "/org/sdk_args",
        {"kind": "verify_v1", "data": {"public_key": "ob_test123455"}},
        status_code=404,
    )


def test_sdk_args(sandbox_tenant):
    obc_key = sandbox_tenant.default_ob_config.key.value
    TESTS = [
        {"kind": "verify_v1", "data": {"auth_token": "tok_12345"}},
        {
            "kind": "verify_v1",
            "data": {"public_key": obc_key},
        },
        {
            "kind": "verify_v1",
            "data": {
                "auth_token": "tok_12345",
                "public_key": obc_key,
                "user_data": {
                    "id.email": "hayesvalley@onefootprint.com",
                    "id.phone_number": "incorrect phone number",
                    "id.citizenships": ["US", "TR"],
                },
                "options": {"show_completion_page": True},
            },
        },
        {
            "kind": "verify_v1",
            "data": {"public_key": obc_key, "locale": "en-us"},
        },
    ]
    for data in TESTS:
        body = post("/org/sdk_args", data)

        assert body["expires_at"]
        token = SdkArgs(body["token"])

        body = get("/org/sdk_args", None, token)
        assert body["args"] == data


def test_sdk_args_ob_config(sandbox_tenant):
    obc_key = sandbox_tenant.default_ob_config.key.value
    data = {
        "kind": "verify_v1",
        "data": {"public_key": obc_key},
    }
    body = post("/org/sdk_args", data)

    assert body["expires_at"]
    token = SdkArgs(body["token"])

    body = get("/org/sdk_args", None, token)
    assert body["args"]["kind"] == "verify_v1"
    assert body["args"]["data"]["public_key"] == obc_key
    assert body["ob_config"]["name"] == sandbox_tenant.default_ob_config.name
    assert body["ob_config"]["key"] == obc_key
