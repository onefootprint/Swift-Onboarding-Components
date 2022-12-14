import requests
import os
import time
from .auth import OnboardingSessionToken
import pytest
from twilio.rest import Client
from .constants import (
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET,
)
from .utils import (
    IncorrectServerVersion,
    build_user_data,
    _make_request,
    create_tenant,
    create_basic_sandbox_user,
    create_ob_config,
)
from .bifrost_client import BifrostClient


@pytest.fixture(scope="session", autouse="true")
def wait_for_deploy():
    """
    Run once per test session to make sure that the correct version of code is deployed
    """
    expected_version = os.environ.get("EXPECTED_SERVER_VERSION", None)
    if not expected_version:
        # Running locally, no need to wait for server version
        return
    num_successes = 0
    failed_attempts = 0
    REQUIRED_NUM_SUCCESS = 30
    MAX_ATTEMPTS = 60
    while num_successes < REQUIRED_NUM_SUCCESS:
        try:
            _make_request(requests.get, "/", None, None, 200, [])
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
def tenant(must_collect_data, can_access_data):
    org_data = {
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
def sandbox_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "Footprint Sandbox Integration Testing",
        "is_live": False,
    }

    ob_conf_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_conf_data)


@pytest.fixture
def doc_request_ob_config(must_collect_data, can_access_data):
    # TODO just use `tenant` when we can have multiple ScopedUsers for a single tenant. FP-2159
    org_data = {
        "name": "Footprint Integration Testing (docs)",
        "is_live": True,
    }
    ob_conf_data = {
        "name": "Doc request config",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
        "must_collect_identity_document": True,
    }
    return create_tenant(org_data, ob_conf_data).default_ob_config


@pytest.fixture(scope="session")
def doc_request_sandbox_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    ob_conf_data = {
        "name": "Doc request config",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
        "must_collect_identity_document": True,
        "can_access_identity_document_images": True,
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
    bifrost_client = BifrostClient(sandbox_tenant.default_ob_config)
    bifrost_client.init_user_for_onboarding(twilio, build_user_data())
    return bifrost_client.onboard_user_onto_tenant(sandbox_tenant)
