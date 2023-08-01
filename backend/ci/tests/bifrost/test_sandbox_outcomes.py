import pytest
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number


@pytest.mark.parametrize(
    "sandbox_id,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        ("blah_123", "pass", False),
        ("manualreview12", "fail", True),
        ("stepup12", "pending", False),
    ],
)
def test_deterministic_onboarding(
    twilio,
    sandbox_tenant,
    sandbox_id,
    expected_status,
    expected_requires_manual_review,
):
    seed = _gen_random_n_digit_number(10)
    sandbox_id = f"{sandbox_id}{seed}"
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost.run()

    assert bifrost.validate_response["user"]["status"] == expected_status
    assert (
        bifrost.validate_response["user"]["requires_manual_review"]
        == expected_requires_manual_review
    )
