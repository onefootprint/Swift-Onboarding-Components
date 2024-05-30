import pytest
from tests.bifrost_client import BifrostClient, RepeatRequirement
from tests.utils import create_ob_config


@pytest.fixture(scope="session")
def legal_status_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "KYC with legal status",
        must_collect_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_legal_status",
        ],
        can_access_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_legal_status",
        ],
        optional_data=[],
    )


@pytest.mark.parametrize(
    "data",
    [
        {
            "id.us_legal_status": "citizen",
        },
        {
            "id.us_legal_status": "permanent_resident",
            "id.nationality": "NO",
            "id.citizenships": ["NO"],
        },
        {
            "id.us_legal_status": "visa",
            "id.nationality": "NO",
            "id.citizenships": ["NO", "IT"],
            "id.visa_kind": "h1b",
            "id.visa_expiration_date": "2050-12-25",
        },
    ],
)
def test_us_legal_status(legal_status_obc, data):
    bifrost = BifrostClient.new_user(legal_status_obc)
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
            "id.us_legal_status": "permanent_resident",
            "id.nationality": "NO",
            # No citizenships
        },
        {
            "id.us_legal_status": "visa",
            "id.nationality": "NO",
            "id.citizenships": ["NO", "IT"],
            "id.visa_kind": "h1b",
            # No visa expiration date
        },
        {
            "id.us_legal_status": "visa",
            "id.nationality": "NO",
            "id.citizenships": ["NO", "IT"],
            # No visa kind
            "id.visa_expiration_date": "2050-12-25",
        },
        {
            "id.us_legal_status": "visa",
            "id.nationality": "NO",
            # No citizenships
            "id.visa_kind": "h1b",
            "id.visa_expiration_date": "2050-12-25",
        },
    ],
)
def test_invalid_us_legal_status(legal_status_obc, data):
    bifrost = BifrostClient.new_user(legal_status_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    try:
        bifrost.run()
        assert False, "Should have failed running bifrost"
    except RepeatRequirement as e:
        print(f"Handling error:\n{e}")
        assert e.requirement["kind"] == "collect_data"
        assert e.requirement["missing_attributes"] == ["us_legal_status"]
