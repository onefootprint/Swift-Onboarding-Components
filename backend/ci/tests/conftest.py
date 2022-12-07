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
    post,
    _make_request,
    create_tenant,
    create_basic_user,
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
def workos_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "Acme Bank",
        "is_live": True,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def workos_sandbox_tenant(must_collect_data, can_access_data):

    org_data = {
        "name": "Acme Bank",
        "is_live": False,
    }

    ob_data = {
        "name": "Acme Bank Card",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture
def document_requesting_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "document tenant",
        "is_live": True,
    }

    ob_data = {
        "name": "default",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
        "must_collect_identity_document": True,
    }

    return create_tenant(org_data, ob_data)


# TODO: some document tests rely on having a fresh tenant each run, so
# rather than fix that now, just introduce a separate tenant appropriately
# pytest scoped
@pytest.fixture(scope="session")
def document_requesting_sandbox_tenant_session_scoped(
    must_collect_data, can_access_data
):
    org_data = {
        "name": "sandbox document tenant",
        "is_live": False,
    }

    ob_data = {
        "name": "default",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
        "must_collect_identity_document": True,
        "can_access_identity_document_images": True,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def twilio():
    return Client(TWILIO_API_KEY, TWILIO_API_KEY_SECRET, TWILIO_ACCOUNT_SID)


@pytest.fixture(scope="module")
def basic_user(twilio):
    """
    Create a sandbox user with no data other than phone/email
    """
    return create_basic_user(twilio)


@pytest.fixture(scope="module")
def user(workos_sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the workos_sandbox_tenant
    """
    bifrost_client = BifrostClient(workos_sandbox_tenant)
    bifrost_client.init_user_for_onboarding(
        create_basic_user(twilio), build_user_data()
    )
    return bifrost_client.onboard_user_onto_tenant()


@pytest.fixture(scope="module")
def user_with_documents(document_requesting_sandbox_tenant_session_scoped, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the document_requesting_tenant_session_scoped
    with document info as well
    """
    bifrost_client = BifrostClient(document_requesting_sandbox_tenant_session_scoped)
    bifrost_client.init_user_for_onboarding(
        create_basic_user(twilio), build_user_data(), "both"
    )
    return bifrost_client.onboard_user_onto_tenant()


@pytest.fixture(scope="module")
def ob_session_token(workos_tenant):
    data = {"onboarding_config_id": workos_tenant.ob_config().id}
    body = post("onboarding/session", data, workos_tenant.sk.key)
    return OnboardingSessionToken(body["session_token"])
