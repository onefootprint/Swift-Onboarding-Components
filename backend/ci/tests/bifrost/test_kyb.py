import pytest
from tests.utils import (
    patch,
    post,
    get_requirement_from_requirements,
)
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER


@pytest.fixture(scope="session")
def incomplete_bifrost(kyb_sandbox_ob_config, twilio, kyb_cdos):
    bifrost = BifrostClient.new(kyb_sandbox_ob_config, twilio)
    requirements = bifrost.get_status()["requirements"]
    business_requirement = get_requirement_from_requirements(
        "collect_business_data", requirements
    )
    assert set(business_requirement["missing_attributes"]) == set(kyb_cdos)
    return bifrost


@pytest.mark.parametrize(
    "business_data,expected_status_code",
    [
        ({"business.name": "Flerp"}, 200),
        ({"business.tin": "12-0987654"}, 200),
        (
            {
                "business.name": "Flerp",
                "business.website": "flerp.com",
                "business.phone_number": FIXTURE_PHONE_NUMBER,
                "business.tin": "123-45-1234",
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "12345",
                "business.country": "US",
            },
            200,
        ),
        (
            {"business.phone_number": "i am not a phone number"},
            400,
        ),
        (
            {"business.address_line1": "One Footprint Way"},
            400,
        ),
        ({"business.zip": "12345"}, 400),
        (
            {
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "blerp i am not a zip code!",
                "business.country": "US",
            },
            400,
        ),
        (
            {
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "94117",
                "business.country": "Blerp I am not a country",
            },
            400,
        ),
        (
            {"business.beneficial_owners": []},
            400,
        ),
        (
            {"business.kyced_beneficial_owners": []},
            400,
        ),
        (
            {
                "business.beneficial_owners": [
                    {
                        "first_name": "Piip",
                        "last_name": "Penguin",
                        "ownership_stake": 50,
                    }
                ]
            },
            200,
        ),
        (
            {
                "business.beneficial_owners": [
                    {"first_name": "Piip", "last_name": "Penguin"}
                ]
            },
            400,
        ),
        (
            {
                "business.kyced_beneficial_owners": [
                    {
                        "first_name": "Piip",
                        "last_name": "Penguin",
                        "email": "e@e.com",
                        "phone_number": "+14155555555",
                        "ownership_stake": 50,
                    }
                ]
            },
            200,
        ),
        (
            {
                "business.kyced_beneficial_owners": [
                    {
                        "first_name": "Piip",
                        "last_name": "Penguin",
                        "email": "e@e.com",
                        "phone_number": "not a phone",
                        "ownership_stake": 50,
                    }
                ]
            },
            400,
        ),
        ({"id.ssn4": "1234"}, 400),
    ],
)
def test_put_business_vault(incomplete_bifrost, business_data, expected_status_code):
    post(
        "hosted/business/vault/validate",
        business_data,
        incomplete_bifrost.auth_token,
        status_code=expected_status_code,
    )
    patch(
        "hosted/business/vault",
        business_data,
        incomplete_bifrost.auth_token,
        status_code=expected_status_code,
    )


def test_put_business_vault_not_authorized(sandbox_tenant, twilio):
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    auth_token = bifrost.auth_token
    # Can't hit PATCH /hosted/business/vault without a business vault
    patch("hosted/business/vault", {}, auth_token, status_code=401)


def test_one_click_kyb(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient.new(kyb_sandbox_ob_config, twilio)
    user = bifrost.run()

    phone_number = bifrost.data["id.phone_number"]
    sandbox_id = bifrost.sandbox_id
    bifrost2 = BifrostClient.inherit(
        kyb_sandbox_ob_config, twilio, phone_number, sandbox_id
    )
    user2 = bifrost2.run()
    assert user.fp_id == user2.fp_id
    assert user.fp_bid
    assert user.fp_bid == user2.fp_bid
