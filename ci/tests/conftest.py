import pytest
import requests
from .utils import url, _assert_response

from .constants import EMAIL, PHONE_NUMBER, WORKOS_ORG_ID, REQUIRED_DATA_KINDS

def cleanup():
    path = "private/cleanup?phone_number={0}".format(PHONE_NUMBER)
    r = requests.post(
        url(path),
    )
    assert r.status_code == 200
    identify_path = "identify"
    identifier = {"email": EMAIL}
    data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

    # check that we properly cleaned up user
    r = requests.post(
        url(identify_path),
        json=data,
    )
    body = _assert_response(r)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())

# runs before all integration tests
def pytest_sessionstart(session):
    cleanup()

# runs after all integration tests
def pytest_sessionfinish(session, exitstatus):
    cleanup()

# order to run tests in
def pytest_collection_modifyitems(items):
    """Modifies test items in place to ensure test modules run in a given order.
    Currently tests run in alphabetical order by default (desired behavior for us, coincidentally)
    but if we need to change that, we can modify this function
    """
    # MODULE_ORDER = ["tests.test_b", "tests.test_c", "tests.test_a"]
    # module_mapping = {item: item.module.__name__ for item in items}
    # print(module_mapping)
    # sorted_items = items.copy()
    # # Iteratively move tests of each module to the end of the test queue
    # for module in MODULE_ORDER:
    #     sorted_items = [it for it in sorted_items if module_mapping[it] != module] + [
    #         it for it in sorted_items if module_mapping[it] == module
    #     ]
    # items[:] = sorted_items




# global fixtures
@pytest.fixture(scope="module")
def workos_tenant():
    path = "private/client"
    data = {
        "name": "Acme Bank",
        "workos_org_id": WORKOS_ORG_ID,
        "email_domain": "onefootprint.com",
        "must_collect_data_kinds": REQUIRED_DATA_KINDS,
        "can_access_data_kinds": REQUIRED_DATA_KINDS,
    }
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }


@pytest.fixture(scope="module")
def foo_tenant():
    path = "private/client"
    data = {
        "name": "foo",
        "workos_org_id": "bar",
        "email_domain": "foo.bar",
        "must_collect_data_kinds": REQUIRED_DATA_KINDS,
        "can_access_data_kinds": REQUIRED_DATA_KINDS,
    }
    r = requests.post(url(path), json=data)
    body = _assert_response(r)
    client_public_key = body["data"]["keys"]["client_public_key"]
    client_secret_key = body["data"]["keys"]["client_secret_key"]
    return {
        "pk": client_public_key,
        "sk": client_secret_key,
        "configuration_id": body["data"]["configuration_id"]
    }

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # execute all other hooks to obtain the report object
    outcome = yield
    rep = outcome.get_result()

    # set a report attribute for each phase of a call, which can
    # be "setup", "call", "teardown"
    setattr(item, "rep_" + rep.when, rep)

@pytest.fixture(scope='module', autouse=True)
def print_failed_tests(request):
    def fin():
        l = request.config.cache.get("failed_tests", [])
        if len(l):
            print("\n")
            for val in l:
                print(":bangbang: test failed: {}".format(val))
            request.config.cache.set("failed_tests", [])
    request.addfinalizer(fin) 

@pytest.fixture(scope='function', autouse=True)
def print_failure(request):
    yield
    if request.node.rep_setup.passed:
        if request.node.rep_call.failed:
            l = request.config.cache.get("failed_tests", [])
            l.append(request.node.nodeid)
            request.config.cache.set("failed_tests", l)
