import pytest
from tests.identify_client import IdentifyClient
from tests.utils import create_ob_config, post, get, _gen_random_sandbox_id
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_EMAIL


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

    # We should see a remaining auth requirement for all except phone
    body = get("hosted/user/auth_requirements", None, auth_token)
    assert all(i["kind"] == "register_auth_method" for i in body["all_requirements"])
    expected_remaining_reqs = set((required_auth_methods or [])[1:])
    remaining_reqs = set(i["auth_method_kind"] for i in body["all_requirements"])
    assert remaining_reqs == expected_remaining_reqs

    if "email" in remaining_reqs:
        body = post("hosted/onboarding/validate", None, auth_token, status_code=400)
        assert body["message"] == "Requires registering email as an auth method"

        # Add the email to the user
        data = dict(kind="email", email=FIXTURE_EMAIL, action_kind="add_primary")
        body = post("hosted/user/challenge", data, auth_token)
        challenge_token = body["challenge_token"]
        data = dict(challenge_token=challenge_token, challenge_response="000000")
        post("hosted/user/challenge/verify", data, auth_token)

        # Should now have no remaining auth requirements
        body = get("hosted/user/auth_requirements", None, auth_token)
        assert not body["all_requirements"]

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

    registered_auth_methods = set(
        i["auth_method_kind"]
        for i in bifrost.handled_requirements
        if i["kind"] == "register_auth_method"
    )
    # We'll only register one auth method in the Identify machine, so we'll expect that anything else is
    # handled in bifrost
    expected_remaining_required_auth_methods = set(required_auth_methods[1:])
    assert registered_auth_methods == expected_remaining_required_auth_methods
