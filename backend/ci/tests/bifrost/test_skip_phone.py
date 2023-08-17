import pytest
from tests.utils import patch, post
from tests.utils import get_requirement_from_requirements
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config


def test_skip_phone(sandbox_tenant, twilio):
    collect_data = ["full_address", "name", "email"]
    obc = create_ob_config(
        sandbox_tenant,
        "KYC with optional ssn",
        must_collect_data=collect_data,
        can_access_data=collect_data,
        optional_data=[],
        is_no_phone_flow=True,
    )
    # TODO: dont create user via traditional path that auths via phone
    bifrost = BifrostClient.new(obc, twilio, override_ob_config_auth=None)

    reqs = bifrost.get_status()["requirements"]

    assert get_requirement_from_requirements("liveness", reqs) is None

    collect_data_req = get_requirement_from_requirements("collect_data", reqs)
    assert set(collect_data_req["missing_attributes"]) == set(["full_address", "name"])
    assert set(collect_data_req["populated_attributes"]) == set(["email"])

    authorize_req = get_requirement_from_requirements("authorize", reqs)
    assert set(authorize_req["fields_to_authorize"]["collected_data"]) == set(
        collect_data
    )
