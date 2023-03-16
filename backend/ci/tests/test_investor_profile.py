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


@pytest.mark.parametrize(
    "ip_data,expected_status_code",
    [
        (
            {
                "investor_profile.employment_status": "employed",
                "investor_profile.occupation": "Neurosurgeon",
                "investor_profile.employed_by_brokerage": "no",
                "investor_profile.annual_income": "u50000",
                "investor_profile.net_worth": "a1m",
                "investor_profile.investment_goals": '["grow_long_term_wealth", "buy_a_home"]',
                "investor_profile.risk_tolerance": "conservative",
                "investor_profile.declarations": "[]",
            },
            200,
        ),
        # TODO test validation
    ],
)
def test_put_ip_info(sandbox_user, ip_data, expected_status_code):
    post(
        "hosted/user/vault/validate",
        ip_data,
        sandbox_user,
        status_code=expected_status_code,
    )
    put(
        "hosted/user/vault",
        ip_data,
        sandbox_user,
        status_code=expected_status_code,
    )
