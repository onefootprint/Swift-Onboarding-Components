import pytest
from tests.bifrost_client import BifrostClient, RepeatRequirement
from tests.utils import create_ob_config


@pytest.fixture(scope="session")
def us_tax_id_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "KYC with US tax ID",
        must_collect_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_tax_id",
        ],
        can_access_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_tax_id",
        ],
        optional_data=[],
    )


@pytest.mark.parametrize(
    "data",
    [
        {
            "id.us_tax_id": "121-12-1212",
        },
        {
            "id.us_tax_id": "919-51-1212",
        },
    ],
)
def test_valid_us_tax_id(us_tax_id_obc, data):
    bifrost = BifrostClient.new_user(us_tax_id_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    user = bifrost.run()
    assert user.fp_id


@pytest.mark.parametrize(
    "data",
    [
        {
            "id.us_tax_id": "121-12-0000",  # invalid ssn & itin
        },
        {
            "id.us_tax_id": "919-44-1212",  # invalid itin
        },
    ],
)
def test_invalid_us_tax_id(us_tax_id_obc, data):
    bifrost = BifrostClient.new_user(us_tax_id_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    try:
        bifrost.run()
        assert False, "Should have failed running bifrost"
    except Exception as e:
        print(f"Handling error:\n{e}")
