import pytest
from tests.identify_client import IdentifyClient
from tests.utils import create_ob_config, post, _gen_random_sandbox_id
from tests.bifrost_client import BifrostClient


@pytest.mark.parametrize(
    "required_auth_methods", [None, ["phone"], ["email"], ["phone", "email"]]
)
def test_auth_playbook(sandbox_tenant, required_auth_methods):
    playbook = create_ob_config(
        sandbox_tenant,
        "Auth playbook w required auth methods",
        ["phone_number", "email"],
        kind="auth",
        required_auth_methods=required_auth_methods,
    )
    sandbox_id = _gen_random_sandbox_id()
    # The IdentifyClient by default will make a user with an SMS challenge
    auth_token = IdentifyClient(playbook, sandbox_id).create_user(scope="auth")

    # Can fetch the validation token after all auth methods are registered
    post("hosted/onboarding/validate", None, auth_token)


@pytest.mark.parametrize(
    "required_auth_methods", [["phone"], ["email"], ["phone", "email"]]
)
def test_kyc_playbook(sandbox_tenant, required_auth_methods, must_collect_data):
    playbook = create_ob_config(
        sandbox_tenant,
        "KYC w required auth",
        must_collect_data,
        required_auth_methods=required_auth_methods,
    )
    bifrost = BifrostClient.new_user(playbook)
    bifrost.run()

    aes = set(i["kind"] for i in bifrost.validate_response["user_auth"]["auth_events"])
    am_to_challenge = {
        "phone": "sms",
        "email": "email",
    }
    challenge_kinds = [am_to_challenge[i] for i in required_auth_methods]
    assert aes >= set(challenge_kinds)
