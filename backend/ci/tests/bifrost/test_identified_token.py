import pytest
from tests.utils import post, create_ob_config, get, step_up_user
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth
from tests.constants import FIXTURE_PHONE_NUMBER


@pytest.fixture(scope="session")
def progressive_ob_config(sandbox_tenant, must_collect_data):
    # TODO eventually we should be able to rm this config and pass an ob config in that the user
    # has already onboarded onto
    ob_conf_data = {
        "name": "Acme Bank Progressive Config",
        "must_collect_data": must_collect_data,
        "can_access_data": must_collect_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_onboarded_vault(twilio, progressive_ob_config, sandbox_user, sandbox_tenant):
    # Go through onboarding with a token made from a user that already onboarded
    data = dict(key=progressive_ob_config.key.value)
    body = post(f"entities/{sandbox_user.fp_id}/token", data, *sandbox_tenant.db_auths)
    auth_token = FpAuth(body["token"])

    auth_token = step_up_user(
        twilio, auth_token, sandbox_user.client.data["id.phone_number"]
    )

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        progressive_ob_config,
        auth_token,
        sandbox_user.client.data["id.phone_number"],
        sandbox_user.client.sandbox_id,
    )
    bifrost.run()
