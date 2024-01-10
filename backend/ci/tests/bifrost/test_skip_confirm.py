import pytest
from tests.utils import (
    post,
    create_ob_config,
    step_up_user,
    patch,
)
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth
from tests.constants import FIXTURE_PHONE_NUMBER, ID_DATA, FIXTURE_EMAIL


@pytest.fixture(scope="session")
def ob_config(sandbox_tenant):
    ob_conf_data = {
        "name": "Acme Bank Progressive Config",
        "must_collect_data": ["phone_number", "email", "name", "full_address"],
        "can_access_data": ["phone_number", "email", "name", "full_address"],
        "skip_confirm": True,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_skip_confirm(sandbox_tenant, ob_config):
    """
    Test that we omit the confirm requirement when all data is already provided for a user.
    We will create the user via API with all identity data pre-populated.
    """
    initial_data = {
        **ID_DATA,
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    body = post("users", initial_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    data = dict(kind="onboard", key=ob_config.key.value)
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should require step up because auth was not implied for API vault
    auth_token = step_up_user(auth_token, True)

    # Run bifrost
    bifrost = BifrostClient.raw_auth(ob_config, auth_token, sandbox_id)
    user = bifrost.run()
    # collect_data requirement should be missing entirely
    assert [i["kind"] for i in bifrost.already_met_requirements] == ["authorize"]
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "liveness",
        "process",
    ]
    assert user.fp_id == fp_id
