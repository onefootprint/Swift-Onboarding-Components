import pytest
from tests.utils import get
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number


@pytest.mark.parametrize(
    "sandbox_id,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        ("blah_123", "pass", False),
        ("manualreview12", "fail", True),
        (
            "stepup12",
            "fail",
            True,
        ),  # for now, we always fail with review after stepup in sandbox. later we'll probably let users fixture the post-stepup decision as well
    ],
)
def test_deterministic_onboarding(
    sandbox_tenant,
    sandbox_id,
    expected_status,
    expected_requires_manual_review,
):
    seed = _gen_random_n_digit_number(10)
    sandbox_id = f"{sandbox_id}{seed}"
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, override_sandbox_id=sandbox_id
    )
    bifrost.vault_barcode_with_doc = False  # hack cause /vault barfs when trying to vault barcode during stepup because stepup workflow state only gives the AddDocument guard, not the AddData guard

    bifrost.run()

    assert bifrost.validate_response["user"]["status"] == expected_status
    assert (
        bifrost.validate_response["user"]["requires_manual_review"]
        == expected_requires_manual_review
    )
