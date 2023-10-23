import pytest
from tests.utils import create_ob_config, create_tenant
from tests.constants import TENANT_ID3


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
def foo_sandbox_tenant():
    org_data = {
        "id": TENANT_ID3,
        "name": "Footprint Sandbox Integration Testing Foo",
        "is_live": False,
    }
    # Specifically don't request nationality and ssn9
    fields = ["name", "ssn4", "full_address", "email", "phone_number"]
    ob_conf_data = {
        "name": "Foo Credit Card",
        "must_collect_data": fields,
        "can_access_data": fields,
    }

    return create_tenant(org_data, ob_conf_data)
