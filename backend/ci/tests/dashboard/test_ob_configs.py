import pytest
from tests.types import ObConfiguration
from tests.utils import (
    get,
    post,
    patch,
    create_basic_sandbox_user,
)
from tests.auth import (
    PublishableOnboardingKey,
)


@pytest.fixture(scope="session")
def ob_configuration(sandbox_tenant, must_collect_data, can_access_data):
    data = dict(
        name="Test OB config",
        must_collect_data=must_collect_data,
        can_access_data=can_access_data,
    )
    body = post("org/onboarding_configs", data, sandbox_tenant.sk.key)
    return ObConfiguration.from_response(body)


def test_config_list(sandbox_tenant, ob_configuration):
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


def test_config_create(sandbox_tenant, twilio):
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
        can_access_data=["ssn4", "phone_number", "email", "name", "full_address"],
    )
    body = post("org/onboarding_configs", data, sandbox_tenant.sk.key)
    ob_config = body
    ob_config_key = PublishableOnboardingKey(ob_config["key"])

    sandbox_user = create_basic_sandbox_user(twilio, ob_config_key)
    post("hosted/onboarding", None, ob_config_key, sandbox_user.auth_token)


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


@pytest.mark.parametrize(
    "must_collect_identity_document,must_collect_selfie,can_access_identity_document_images,can_access_selfie_image,expected_status",
    [
        (True, True, True, True, 200),
        # can't access doc if not collecting
        (False, True, True, False, 400),
        # can't access selfie if not collecting
        (True, False, True, True, 400),
        # can't collect selfie if not collecting doc
        (False, True, False, False, 400),
    ],
)
def test_config_create_doc_fields_validation(
    sandbox_tenant,
    must_collect_data,
    can_access_data,
    must_collect_identity_document,
    must_collect_selfie,
    can_access_identity_document_images,
    can_access_selfie_image,
    expected_status,
):
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=must_collect_data,
        can_access_data=can_access_data,
        must_collect_identity_document=must_collect_identity_document,
        must_collect_selfie=must_collect_selfie,
        can_access_identity_document_images=can_access_identity_document_images,
        can_access_selfie_image=can_access_selfie_image,
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
