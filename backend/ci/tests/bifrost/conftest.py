import pytest
from tests.utils import create_ob_config


@pytest.fixture(scope="session")
def doc_first_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "KYC with document first",
        must_collect_data=[
            "phone_number",
            "full_address",
            "name",
            "email",
            "document.drivers_license.none.none",
            "ssn9",
        ],
        can_access_data=["phone_number", "full_address", "name", "email"],
        is_doc_first_flow=True,
    )


@pytest.fixture(scope="session")
def skip_phone_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "skip phone",
        must_collect_data=["full_address", "name", "email"],
        can_access_data=["full_address", "name", "email"],
        optional_data=[],
        is_no_phone_flow=True,
    )


@pytest.fixture(scope="session")
def auth_playbook(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "Auth playbook",
        ["phone_number", "email"],
        ["phone_number", "email"],
        kind="auth",
    )
