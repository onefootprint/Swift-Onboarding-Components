import pytest
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER


@pytest.mark.parametrize(
    "sandbox_id,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        ("blah_123", "pass", False),
        ("manualreview", "fail", True),
    ],
)
def test_deterministic_onboarding(
    twilio,
    sandbox_tenant,
    sandbox_id,
    expected_status,
    expected_requires_manual_review,
):
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost.run()

    bifrost.validate_response["user"]["status"] == expected_status
    bifrost.validate_response["user"][
        "requires_manual_review"
    ] == expected_requires_manual_review
