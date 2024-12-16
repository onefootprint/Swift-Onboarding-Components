import pytest
from tests.utils import get, create_ob_config
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def skip_kyc_playbook(sandbox_tenant, must_collect_data):
    return create_ob_config(
        sandbox_tenant,
        "skip kyc (happens to be kyb)",
        ["business_name", "business_address"],
        skip_kyc=True,
        # For now, we don't support collection-only KYC playbooks, but we should.
        # Instead, we'll model this as a KYB playbook that has skip_kyc
        kind="kyb",
    )


@pytest.fixture(scope="session")
def skip_kyc_playbook_with_verification_checks(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "skip kyc (happens to be kyb)",
        ["business_name", "business_address"],
        # For now, we don't support collection-only KYC playbooks, but we should.
        # Instead, we'll model this as a KYB playbook that has skip_kyc
        kind="kyb",
        skip_kyc=None,
        # Note the absence of KYC verification check implies skipping KYC
        verification_checks=[{"kind": "kyb", "data": {"ein_only": False}}],
    )


@pytest.mark.parametrize(
    "playbook", ["skip_kyc_playbook", "skip_kyc_playbook_with_verification_checks"]
)
def test_skip_kyc(sandbox_tenant, playbook, request):
    """
    Since a skip_kyc playbook has no rules, we expect that it doesn't set a user's status
    """
    skip_kyc_playbook = request.getfixturevalue(playbook)
    bifrost = BifrostClient.new_user(
        skip_kyc_playbook, fixture_result="use_rules_outcome"
    )
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "none"

    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "none"


@pytest.mark.parametrize(
    "playbook", ["skip_kyc_playbook", "skip_kyc_playbook_with_verification_checks"]
)
def test_skip_kyc_status_unchanged(sandbox_tenant, playbook, request):
    skip_kyc_playbook = request.getfixturevalue(playbook)
    # First, onboard user to a playbook with rules. Status should be pass
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    assert user.client.validate_response["user"]["status"] == "pass"

    # Then, onboard them onto a playbook with no rules.
    bifrost = BifrostClient.login_user(
        skip_kyc_playbook, bifrost.sandbox_id, fixture_result="use_rules_outcome"
    )

    user = bifrost.run()
    # Status of the workflow should be none
    assert user.client.validate_response["user"]["status"] == "none"

    # But the status of the user should be pass, unchanged from before
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "pass"
