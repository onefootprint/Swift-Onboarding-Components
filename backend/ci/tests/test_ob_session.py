from tests.utils import get, post
from tests.headers import ObToken
from tests.constants import ID_DATA, BUSINESS_DATA


def test_onboarding_token(sandbox_tenant):
    TESTS = [
        dict(key=sandbox_tenant.default_ob_config.key.value),
        dict(bootstrap_data={**ID_DATA, **BUSINESS_DATA}),
        dict(
            key=sandbox_tenant.default_ob_config.key.value,
            bootstrap_data={**ID_DATA, **BUSINESS_DATA},
        ),
    ]
    for data in TESTS:
        body = post("onboarding/session", data, sandbox_tenant.s_sk)
        token = ObToken(body["session_token"])
        body = get("hosted/onboarding/session", None, token)
        assert body["key"] == data.get("key", None)
        assert body["bootstrap_data"] == data.get("bootstrap_data", {})


def test_onboarding_token_errors(sandbox_tenant, foo_sandbox_tenant):
    TESTS = [
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
