import pytest
from tests.bifrost_client import BifrostClient


@pytest.mark.parametrize(
    "suffix,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        ("blah_123", "pass", False),
        ("manualreview", "fail", True),
    ],
)
def test_deterministic_onboarding(
    twilio,
    sandbox_tenant,
    suffix,
    expected_status,
    expected_requires_manual_review,
):
    bifrost = BifrostClient(
        sandbox_tenant.default_ob_config, twilio, sandbox_suffix=suffix
    )
    bifrost.run()
    
    bifrost.validate_response["user"]["status"] == expected_status
    bifrost.validate_response["user"][
        "requires_manual_review"
    ] == expected_requires_manual_review
