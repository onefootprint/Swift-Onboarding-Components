import pytest
from tests.utils import _random_sandbox_phone
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
    sandbox_phone_number = _random_sandbox_phone(suffix)
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, sandbox_phone_number
    )
    bifrost.run()

    bifrost.validate_response["user"]["status"] == expected_status
    bifrost.validate_response["user"][
        "requires_manual_review"
    ] == expected_requires_manual_review
