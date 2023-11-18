import requests
import time
import pytest
from twilio.rest import Client
from tests.constants import (
    IT_TWILIO_ACCOUNT_SID,
    IT_TWILIO_SECRET_AUTH_TOKEN,
    TENANT_ID2,
    TENANT_ID1,
    LIVE_PHONE_NUMBER,
    EMAIL,
)
from tests.utils import (
    EXPECTED_SERVER_VERSION_GIT_HASH,
    IncorrectServerVersion,
    _make_request,
    create_tenant,
    create_ob_config,
    _gen_random_sandbox_id,
    patch,
    clean_up_user,
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
    return ["name", "ssn9", "full_address", "email", "phone_number", "nationality"]


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
    return create_ob_config(
        sandbox_tenant,
        "Doc request config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
    )


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
    return create_ob_config(
        sandbox_tenant,
        "Business config",
        must_collect_data + kyb_cdos,
        can_access_data + kyb_cdos,
    )


@pytest.fixture(scope="session")
def investor_profile_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant,
        "Investor profile config",
        must_collect_data + ["investor_profile"],
        can_access_data + ["investor_profile"],
    )


@pytest.fixture(scope="session")
def twilio():
    # This twilio client is used to see what SMS messages were sent to LIVE_PHONE_NUMBER
    return Client(IT_TWILIO_ACCOUNT_SID, IT_TWILIO_SECRET_AUTH_TOKEN)


@pytest.fixture(scope="module")
def sandbox_user(sandbox_tenant, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the sandbox_tenant.
    """
    from tests.bifrost_client import BifrostClient

    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    user = bifrost.run()
    # These should be ordered
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]

    # Assert we can't replace the verified email
    data = {"id.phone_number": "+15555555555"}
    body = patch(
        f"entities/{user.fp_id}/vault", data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]["id.phone_number"]
        == "Cannot replace verified contact information via API."
    )

    return user


@pytest.fixture(scope="module")
def sandbox_user_real_phone(
    sandbox_tenant,
    twilio,
    live_phone_number,
):
    """
    Create a user with registered data and webuathn creds and onboard them onto the sandbox_tenant.
    """
    from tests.bifrost_client import BifrostClient

    sandbox_id = _gen_random_sandbox_id()
    bifrost = BifrostClient.create(
        sandbox_tenant.default_ob_config, twilio, live_phone_number, sandbox_id
    )
    return bifrost.run()


@pytest.fixture(scope="module")
def live_phone_number():
    """
    A fixture that returns the live phone number. It will also automagically clean up the phone
    number in each test file before giving it to you.
    You should use this instead of importing LIVE_PHONE_NUMBER manually since this will clean
    up the user for you.
    """
    # Cleanup the non-sandbox user that is used across all integration test runs
    clean_up_user(LIVE_PHONE_NUMBER, EMAIL)
    return LIVE_PHONE_NUMBER
