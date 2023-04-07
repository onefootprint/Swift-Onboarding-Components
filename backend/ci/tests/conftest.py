import requests
import os
import time
import pytest
from twilio.rest import Client
from tests.constants import (
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
    TENANT_ID2,
    TENANT_ID1,
)
from tests.utils import (
    EXPECTED_SERVER_VERSION_GIT_HASH,
    IncorrectServerVersion,
    create_sandbox_user,
    _make_request,
    create_tenant,
    create_basic_sandbox_user,
    create_ob_config,
)


@pytest.fixture(scope="session", autouse="true")
def wait_for_deploy():
    """
    Run once per test session to make sure that the correct version of code is deployed
    """
    expected_version = EXPECTED_SERVER_VERSION_GIT_HASH
    if not expected_version:
        # Running locally, no need to wait for server version
        return
    num_successes = 0
    failed_attempts = 0
    REQUIRED_NUM_SUCCESS = 30
    MAX_ATTEMPTS = 60
    attempts = 0
    while num_successes < REQUIRED_NUM_SUCCESS:
        try:
            _make_request(
                requests.get,
                # we add these query params for easy debugging in logs!
                # roughly this can tell us if the deployment is behaving as we
                # expect it to...old version still appear even after the deployment
                # went through
                f"/?ev={expected_version}&r={attempts}",
                None,
                None,
                200,
                [],
                None,
            )
            num_successes += 1
            time.sleep(1)
        except IncorrectServerVersion as e:
            print(e)
            # Reset our success counter to make sure we have consecutive success
            num_successes = 0
            failed_attempts += 1
            if failed_attempts == MAX_ATTEMPTS:
                raise e
            time.sleep(10)
        attempts += 1
    print(
        f"Correct server version {expected_version} found! Continuing to run tests..."
    )


@pytest.fixture(scope="session")
def can_access_data():
    # Everything but dob
    return [
        "name",
        "ssn9",
        "full_address",
        "email",
        "phone_number",
    ]


@pytest.fixture(scope="session")
def must_collect_data(can_access_data):
    return can_access_data + ["dob"]


@pytest.fixture(scope="session")
def sandbox_tenant_data(must_collect_data, can_access_data):
    # We reuse this in another place
    org_data = {
        "id": TENANT_ID2,
        "name": "Footprint Sandbox Integration Testing",
        "is_live": False,
    }

    ob_conf_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return (org_data, ob_conf_data)


@pytest.fixture(scope="session")
def tenant(must_collect_data, can_access_data):
    """
    Production, non-sandbox tenant. Only used for these tests
    """
    org_data = {
        "id": TENANT_ID1,
        "name": "Footprint Live Integration Testing",
        "is_live": True,
    }

    ob_conf_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_conf_data)


@pytest.fixture(scope="session")
def sandbox_tenant(sandbox_tenant_data):
    return create_tenant(*sandbox_tenant_data)


@pytest.fixture(scope="session")
def doc_request_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    ob_conf_data = {
        "name": "Doc request config",
        "must_collect_data": must_collect_data + ["document_and_selfie"],
        "can_access_data": can_access_data + ["document_and_selfie"],
    }
    return create_ob_config(sandbox_tenant.sk, ob_conf_data)


@pytest.fixture(scope="session")
def kyb_cdos():
    return [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_beneficial_owners",
        # TODO add corporation type, beneficial owners
    ]


@pytest.fixture(scope="session")
def kyb_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data, kyb_cdos):
    ob_conf_data = {
        "name": "Business config",
        "must_collect_data": must_collect_data + kyb_cdos,
        "can_access_data": can_access_data + kyb_cdos,
    }
    return create_ob_config(sandbox_tenant.sk, ob_conf_data)


@pytest.fixture(scope="session")
def investor_profile_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    ob_conf_data = {
        "name": "Investor profile config",
        "must_collect_data": must_collect_data + ["investor_profile"],
        "can_access_data": can_access_data + ["investor_profile"],
    }
    return create_ob_config(sandbox_tenant.sk, ob_conf_data)


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)


@pytest.fixture(scope="module")
def basic_sandbox_user(twilio):
    """
    Create a sandbox user with no data other than phone.
    The user will not be onboarded onto any tenants.
    """
    return create_basic_sandbox_user(twilio)


@pytest.fixture(scope="module")
def sandbox_user(sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the sandbox_tenant.
    """
    return create_sandbox_user(sandbox_tenant, twilio)
