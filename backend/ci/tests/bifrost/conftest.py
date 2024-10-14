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
        document_types_and_countries={
            "global": [],
            "country_specific": {"US": ["drivers_license"]},
        },
        is_doc_first_flow=True,
    )
