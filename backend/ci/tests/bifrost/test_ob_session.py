import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import HttpError, _gen_random_n_digit_number, get, post
from tests.headers import ExternalId, PlaybookKey
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
        token = PlaybookKey(token)
        body = get("hosted/onboarding/session", None, token)
        assert body["bootstrap_data"] == data.get("bootstrap_data", {})
        body = get("hosted/onboarding/config", None, token)
        assert body["key"] == data["key"]


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
        (
            dict(
                key=sandbox_tenant.default_ob_config.key.value,
                business_external_id="blah123456",
            ),
            400,
            "business_external_id is only supported for KYB playbooks",
        ),
        (dict(key="blah"), 404, "Data not found"),
    ]
    for data, status_code, expected_err in TESTS:
        body = post(
            "onboarding/session", data, sandbox_tenant.s_sk, status_code=status_code
        )
        assert body["message"] == expected_err


def test_business_external_id(sandbox_tenant, kyb_sandbox_ob_config):
    obc = kyb_sandbox_ob_config
    external_id = f"ob_session_{_gen_random_n_digit_number(10)}"
    data = dict(key=obc.key.value, business_external_id=external_id)
    body = post("onboarding/session", data, sandbox_tenant.s_sk)
    ob_token = PlaybookKey(body["token"])

    # We should not be able to select a business when the external ID is provided
    with pytest.raises(HttpError) as e:
        bifrost = BifrostClient.new_user(
            obc, override_ob_config_auth=ob_token, inherit_business_id="1234"
        )
    assert (
        e.value.json()["message"]
        == "Cannot select a business when business_external_id is set"
    )

    # Onboard a user with this ob session token
    bifrost = BifrostClient.new_user(obc, override_ob_config_auth=ob_token)
    user = bifrost.run()

    # Since the business external ID is provided, we didn't need to select a business. We will select it
    # automatically by external ID
    req = next(
        i
        for i in bifrost.handled_requirements
        if i["kind"] == "create_business_onboarding"
    )
    assert not req["requires_business_selection"]

    # Make sure the external ID is set on the business
    body = get(f"businesses/{user.fp_bid}", None, sandbox_tenant.s_sk)
    assert body["external_id"] == external_id

    # If we re-onboard onto the playbook, we should not create a new business - we should automatically
    # select the existing one
    bifrost = BifrostClient.login_user(
        obc, bifrost.sandbox_id, override_ob_config_auth=ob_token
    )
    user = bifrost.run()
    assert user.fp_bid == user.fp_bid


def test_business_external_id_must_own(sandbox_tenant, kyb_sandbox_ob_config):
    external_id = f"ob_session_{_gen_random_n_digit_number(10)}"
    post("businesses", None, sandbox_tenant.s_sk, ExternalId(external_id))

    obc = kyb_sandbox_ob_config
    data = dict(key=obc.key.value, business_external_id=external_id)
    body = post("onboarding/session", data, sandbox_tenant.s_sk)
    ob_token = PlaybookKey(body["token"])

    # Onboard a user with this ob session token
    with pytest.raises(HttpError) as e:
        BifrostClient.new_user(obc, override_ob_config_auth=ob_token)
    assert e.value.status_code == 400
    assert e.value.json()["message"] == "The business is not owned by the authed user"
    assert e.value.json()["code"] == "E124"
