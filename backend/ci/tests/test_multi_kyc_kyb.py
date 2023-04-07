import pytest
from tests.utils import (
    create_ob_config,
)
from tests.bifrost_client import BifrostClient


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    kyb_cdos = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_kyced_beneficial_owners",
    ]
    return create_ob_config(
        sandbox_tenant,
        "Multi-KYC Business config",
        must_collect_data + kyb_cdos,
        can_access_data + kyb_cdos,
    )


@pytest.fixture(scope="session")
def sandbox_user(kyb_sandbox_ob_config, twilio):
    bifrost = BifrostClient(kyb_sandbox_ob_config, twilio)
    return bifrost.run()


def test(sandbox_user):
    sandbox_user
    # TODO do more
    pass
