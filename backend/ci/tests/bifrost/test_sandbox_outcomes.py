import pytest
from tests.utils import get
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number


@pytest.mark.parametrize(
    "sandbox_outcome,expected_status,expected_requires_manual_review",
    [
        ("fail", "fail", False),
        (None, "pass", False),
        ("manual_review", "fail", True),
        (
            "step_up",
            "fail",
            True,
        ),  # for now, we always fail with review after stepup in sandbox. later we'll probably let users fixture the post-stepup decision as well
    ],
)
def test_deterministic_onboarding(
    sandbox_tenant,
    sandbox_outcome,
    expected_status,
    expected_requires_manual_review,
):
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config, fixture_result=sandbox_outcome
    )
    bifrost.vault_barcode_with_doc = False  # hack cause /vault barfs when trying to vault barcode during stepup because stepup workflow state only gives the AddDocument guard, not the AddData guard

    bifrost.run()

    assert bifrost.validate_response["user"]["status"] == expected_status
    assert (
        bifrost.validate_response["user"]["requires_manual_review"]
        == expected_requires_manual_review
    )
