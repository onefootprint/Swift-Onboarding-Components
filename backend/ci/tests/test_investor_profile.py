import pytest
from tests.utils import (
    put,
    post,
    get_requirement_from_requirements,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def sandbox_user(investor_profile_ob_config, twilio):
    bifrost_client = BifrostClient(investor_profile_ob_config)
    auth_token = bifrost_client.init_user_for_onboarding(twilio)
    bifrost_client.initialize_onboarding()
    requirements = bifrost_client.get_requirements()
    ip_requirement = get_requirement_from_requirements(
        "collect_investor_profile", requirements
    )
    assert "investor_profile" in ip_requirement["missing_attributes"]
    return auth_token


def test_put_ip_info_valid(sandbox_user, ip_data):
    post("hosted/user/vault/validate", ip_data, sandbox_user)
    put("hosted/user/vault", ip_data, sandbox_user)


@pytest.mark.parametrize(
    "key,value,expected_error",
    [
        ("investor_profile.occupation", "", "Invalid length"),
        ("investor_profile.brokerage_firm_employer", "", "Invalid length"),
        ("investor_profile.annual_income", "10000000000", "Matching variant not found"),
        ("investor_profile.net_worth", "0", "Matching variant not found"),
        (
            "investor_profile.investment_goals",
            '["hi", "grow_long_term_wealth"]',
            "Matching variant not found",
        ),
        ("investor_profile.investment_goals", "[]", "Invalid length"),
        (
            "investor_profile.risk_tolerance",
            "really high",
            "Matching variant not found",
        ),
        (
            "investor_profile.declarations",
            '["hi", "grow_long_term_wealth"]',
            "Matching variant not found",
        ),
    ],
)
def test_put_ip_info_invalid(sandbox_user, ip_data, key, value, expected_error):
    ip_data = {
        **ip_data,
        key: value,
    }
    body = post("hosted/user/vault/validate", ip_data, sandbox_user, status_code=400)
    assert expected_error in body["error"]["message"][key]

    body = put("hosted/user/vault", ip_data, sandbox_user, status_code=400)
    assert expected_error in body["error"]["message"][key]
