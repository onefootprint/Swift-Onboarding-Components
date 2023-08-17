import pytest
from tests.headers import SandboxId
from tests.headers import FpAuth
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_sandbox_id
from tests.constants import EMAIL
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
    headers = [obc.key, SandboxId(_gen_random_sandbox_id())]
    res = post("hosted/identify/signup_challenge", dict(email=EMAIL), *headers)
    challenge_token = res["challenge_data"]["challenge_token"]

    # incorrect PIN fails
    res = post(
        "hosted/identify/verify",
        dict(challenge_response="323232", challenge_token=challenge_token),
        *headers,
        status_code=400
    )
    assert res["error"]["message"] == "Incorrect PIN code"
    # correct PIN suceeds and gives auth
    res = post(
        "hosted/identify/verify",
        dict(challenge_response="424242", challenge_token=challenge_token),
        *headers
    )

    auth_token = FpAuth(res["auth_token"])

    # TODO: should probably give BifrostClient a concept of skip phone but this works for now
    bifrost = BifrostClient(
        obc, auth_token, FIXTURE_PHONE_NUMBER, _gen_random_sandbox_id(), True
    )

    reqs = bifrost.get_status()["requirements"]

    assert get_requirement_from_requirements("liveness", reqs) is None

    collect_data_req = get_requirement_from_requirements("collect_data", reqs)
    assert set(collect_data_req["missing_attributes"]) == set(["full_address", "name"])
    assert set(collect_data_req["populated_attributes"]) == set(["email"])

    authorize_req = get_requirement_from_requirements("authorize", reqs)
    assert set(authorize_req["fields_to_authorize"]["collected_data"]) == set(
        collect_data
    )

    _ = bifrost.run()
