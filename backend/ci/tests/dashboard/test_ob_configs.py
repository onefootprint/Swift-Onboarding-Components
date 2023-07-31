import pytest
from tests.utils import (
    get,
    post,
    patch,
    create_user,
    create_ob_config,
    _gen_random_sandbox_id,
)
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.headers import (
    PublishableOnboardingKey,
    SandboxId,
)


@pytest.fixture(scope="session")
def ob_configuration(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )


@pytest.fixture(scope="session")
def inactive_ob_configuration(sandbox_tenant, must_collect_data, can_access_data):
    ob_config = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )
    data = dict(status="disabled")
    body = patch(
        f"org/onboarding_configs/{ob_config.id}",
        data,
        sandbox_tenant.sk.key,
    )
    return body


def test_config_list(sandbox_tenant, ob_configuration, inactive_ob_configuration):
    body = get("org/onboarding_configs", None, sandbox_tenant.sk.key)

    config = next(
        config for config in body["data"] if config["id"] == ob_configuration.id
    )
    assert config["key"] == ob_configuration.key.value
    assert config["name"] == ob_configuration.name
    assert config["must_collect_data"] == ob_configuration.must_collect_data
    assert config["can_access_data"] == ob_configuration.can_access_data
    assert config["status"] == ob_configuration.status
    assert config["created_at"]

    config = next(
        config
        for config in body["data"]
        if config["id"] == inactive_ob_configuration["id"]
    )
    assert config["status"] == "disabled"


def test_config_list_filters(
    sandbox_tenant, ob_configuration, inactive_ob_configuration
):
    params = dict(status="enabled")
    body = get("org/onboarding_configs", params, sandbox_tenant.sk.key)
    assert [i for i in body["data"] if i["id"] == ob_configuration.id]

    params = dict(status="disabled")
    body = get("org/onboarding_configs", params, sandbox_tenant.sk.key)
    assert [i for i in body["data"] if i["id"] == inactive_ob_configuration["id"]]


def test_config_detail(sandbox_tenant, ob_configuration):
    config = get(
        f"org/onboarding_configs/{ob_configuration.id}", None, sandbox_tenant.sk.key
    )
    assert config["key"] == ob_configuration.key.value
    assert config["name"] == ob_configuration.name
    assert config["must_collect_data"] == ob_configuration.must_collect_data
    assert config["can_access_data"] == ob_configuration.can_access_data
    assert config["status"] == ob_configuration.status
    assert config["created_at"]


def test_config_create(sandbox_tenant, twilio):
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
        can_access_data=["ssn4", "phone_number", "email", "name", "full_address"],
    )
    body = post("org/onboarding_configs", data, sandbox_tenant.sk.key)
    ob_config = body
    ob_config_key = PublishableOnboardingKey(ob_config["key"])

    sandbox_id = _gen_random_sandbox_id()
    auth_token = create_user(
        twilio, FIXTURE_PHONE_NUMBER, ob_config_key, SandboxId(sandbox_id)
    )
    post("hosted/onboarding", None, ob_config_key, auth_token)


@pytest.mark.parametrize(
    "must_collect,can_access,expected_status",
    [
        (["ssn4", "name", "full_address", "email", "phone_number"], [], 200),
        (
            ["ssn4", "ssn9", "name", "full_address", "email", "phone_number"],
            [],
            400,
        ),
        (
            ["full_address", "partial_address", "name", "email", "phone_number"],
            [],
            400,
        ),
        (
            ["name", "email", "phone_number", "full_address"],
            ["ssn9"],
            400,
        ),  # can_access must be < must_collect
    ],
)
def test_config_create_validation(
    sandbox_tenant, must_collect, can_access, expected_status
):
    # Test validation errors
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=must_collect,
        can_access_data=can_access,
    )
    post(
        "org/onboarding_configs",
        data,
        sandbox_tenant.sk.key,
        status_code=expected_status,
    )


def test_config_update(sandbox_tenant, ob_configuration):
    # Test failing to update
    new_name = "Updated ob config name"
    new_status = "disabled"
    data = dict(name=new_name, status=new_status)
    patch(
        f"org/onboarding_configs/flerpderp",
        data,
        sandbox_tenant.sk.key,
        status_code=404,
    )

    # Update the name and status
    body = patch(
        f"org/onboarding_configs/{ob_configuration.id}",
        data,
        sandbox_tenant.sk.key,
    )
    ob_config = body
    assert ob_config["name"] == new_name
    assert ob_config["status"] == new_status

    # Verify the update
    body = get(f"org/onboarding_configs", None, sandbox_tenant.sk.key)
    configs = body["data"]
    ob_config = next(i for i in configs if i["id"] == ob_configuration.id)
    assert ob_config["name"] == new_name
    assert ob_config["status"] == new_status

    # Verify we can't use the disabled ob config for anything anymore
    get("org/onboarding_config", None, ob_configuration.key, status_code=401)
