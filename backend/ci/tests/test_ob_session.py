from tests.utils import get, post
from tests.headers import ObToken
from tests.constants import ID_DATA, BUSINESS_DATA


def test_onboarding_token(sandbox_tenant):
    TESTS = [
        dict(key=sandbox_tenant.default_ob_config.key.value),
        dict(
            key=sandbox_tenant.default_ob_config.key.value,
            bootstrap_data={**ID_DATA, **BUSINESS_DATA},
        ),
        dict(
            key=sandbox_tenant.default_ob_config.key.value,
            bootstrap_data={
                **ID_DATA,
                "business.owners": [
                    {"first_name": "Piip", "last_name": "Penguin"},
                    {"first_name": "Percy", "last_name": "Penguin"},
                ],
            },
        ),
    ]
    for data in TESTS:
        body = post("onboarding/session", data, sandbox_tenant.s_sk)
        token = body["token"]
        assert token.startswith(
            "pbtok_"
        ), "Onboarding token MUST start with `pbtok_`. Our frontend SDK matches on this string EXPLICITLY. Do not change this prefix"
        token = ObToken(token)
        body = get("hosted/onboarding/session", None, token)
        assert body["key"] == data.get("key", None)
        assert body["bootstrap_data"] == data.get("bootstrap_data", {})


def test_onboarding_token_errors(sandbox_tenant, foo_sandbox_tenant):
    TESTS = [
        (
            dict(bootstrap_data={}),
            400,
            "Json deserialize error: missing field `key` at line 1 column 22",
        ),
        (
            dict(key=foo_sandbox_tenant.default_ob_config.key.value),
            404,
            "Data not found",
        ),
        (dict(key="blah"), 404, "Data not found"),
    ]
    for data, status_code, expected_err in TESTS:
        body = post(
            "onboarding/session", data, sandbox_tenant.s_sk, status_code=status_code
        )
        assert body["message"] == expected_err
