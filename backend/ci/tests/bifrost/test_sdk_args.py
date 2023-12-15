import pytest

from tests.utils import get, post
from tests.headers import SdkArgs


def test_sdk_args_fail_validation():
    post("/org/sdk_args", {"kind": "verify_v1", "data": {}}, status_code=400)
    post(
        "/org/sdk_args",
        {"kind": "verify_v1", "data": {"public_key": "pb_test123455"}},
        status_code=404,
    )
    post(
        "/org/sdk_args",
        {"kind": "form_v1", "data": {}},
        status_code=400,
    )
    post(
        "/org/sdk_args",
        {"kind": "auth_v1", "data": {}},
        status_code=400,
    )
    post(
        "/org/sdk_args",
        {"kind": "auth_v1", "data": {"public_key": "pb_test123455"}},
        status_code=404,
    )
    post(
        "/org/sdk_args",
        {"kind": "render_v1", "data": {}},
        status_code=400,
    )
    post(
        "/org/sdk_args",
        {"kind": "render_v1", "data": {"id": "invalid_di"}},
        status_code=400,
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
            "data": {"public_key": obc_key, "l10n": {"locale": "en-US"}},
        },
        {
            "kind": "form_v1",
            "data": {
                "auth_token": "tok_12345",
            },
        },
        {
            "kind": "form_v1",
            "data": {
                "auth_token": "tok_12345",
                "title": "Form Title",
                "options": {
                    "hide_buttons": True,
                    "hide_footprint_logo": True,
                },
                "l10n": {"locale": "en-US"},
            },
        },
        {
            "kind": "auth_v1",
            "data": {
                "public_key": obc_key,
            },
        },
        {
            "kind": "auth_v1",
            "data": {
                "public_key": obc_key,
                "user_data": {
                    "id.email": "hayesvalley@onefootprint.com",
                    "id.phone_number": "incorrect phone number",
                },
            },
        },
        {
            "kind": "auth_v1",
            "data": {
                "public_key": obc_key,
                "user_data": {
                    "id.email": "hayesvalley@onefootprint.com",
                    "id.phone_number": "incorrect phone number",
                },
                "options": {
                    "show_logo": True,
                },
                "l10n": {"locale": "en-US"},
            },
        },
        {
            "kind": "render_v1",
            "data": {"auth_token": "tok_12345", "id": "id.email"},
        },
        {
            "kind": "render_v1",
            "data": {
                "auth_token": "tok_12345",
                "id": "id.email",
                "label": "Label",
            },
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
    TESTS = [
        {
            "kind": "verify_v1",
            "data": {"public_key": obc_key},
        },
        {
            "kind": "auth_v1",
            "data": {"public_key": obc_key},
        },
    ]
    for data in TESTS:
        body = post("/org/sdk_args", data)

        assert body["expires_at"]
        token = SdkArgs(body["token"])

        body = get("/org/sdk_args", None, token)
        assert body["args"]["kind"] == data["kind"]
        assert body["args"]["data"]["public_key"] == obc_key
        assert body["ob_config"]["name"] == sandbox_tenant.default_ob_config.name
        assert body["ob_config"]["key"] == obc_key


def test_sdk_telemetry():
    post("/org/sdk_telemetry", dict(log_message="my_test_event"))
