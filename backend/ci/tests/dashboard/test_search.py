import pytest
from tests.utils import post


@pytest.fixture(scope="session")
def fp_id1(sandbox_tenant):
    data = {"id.first_name": "Hayes", "id.last_name": "Valley"}
    return post("users", data, sandbox_tenant.sk.key)["id"]


@pytest.fixture(scope="session")
def fp_id2(sandbox_tenant):
    data = {"id.first_name": "Hayes", "id.last_name": "FLERP"}
    return post("users", data, sandbox_tenant.sk.key)["id"]


@pytest.fixture(scope="session")
def fp_id3(sandbox_tenant):
    data = {
        "id.first_name": "DERP",
        "id.last_name": "VALLEY",
        "id.phone_number": "+15555550100",
        "id.email": "sAnDboX@onefootprint.cOm",
    }
    return post("users", data, sandbox_tenant.sk.key)["id"]


@pytest.fixture(scope="session")
def fp_id3(sandbox_tenant):
    data = {
        "id.first_name": "DERP",
        "id.last_name": "VALLEY",
        "id.phone_number": "+15555550100",
        "id.email": "sAnDboX@onefootprint.cOm",
        "id.ssn9": "123-12-1234",
        "document.drivers_license.document_number": "A0002144",
    }
    return post("users", data, sandbox_tenant.sk.key)["id"]


@pytest.fixture(scope="session")
def fp_bid(sandbox_tenant):
    data = {
        "business.name": "Printfoot Inc",
        "business.dba": "Flerpderpco",
        "business.website": "printfoot.ai",
        "business.phone_number": "+15555550100",
    }
    return post("businesses", data, sandbox_tenant.sk.key)["id"]


@pytest.mark.parametrize(
    "search, expected_fp_ids",
    [
        # Names must be exact matches with what's provided
        ("Hayes", [True, True, False, False]),
        ("Valley", [True, False, True, False]),
        ("Hayes Valley", [True, False, False, False]),
        ("Hayes Merp Valley", [False, False, False, False]),
        # Search on ssn
        ("123121234", [False, False, True, False]),
        # Should be able to search on differently formatted phone numbers
        ("+15555550100", [False, False, True, True]),
        ("15555550100", [False, False, True, True]),
        ("5555550100", [False, False, True, True]),
        ("555-555-0100", [False, False, True, True]),
        ("(555) 555-0100", [False, False, True, True]),
        ("(555)-555-0100", [False, False, True, True]),
        ("+1 (555) 555-0100", [False, False, True, True]),
        ("1 (555) 555-0100", [False, False, True, True]),
        # Case insensitive email search
        ("sandbox@onefootpRint.com", [False, False, True, False]),
        # Search on DL number
        ("A0002144", [False, False, True, False]),
        # Search on subset of business name
        ("PrintFoot", [False, False, False, True]),
        # Search on DBA
        ("Flerpderpco", [False, False, False, True]),
        # Search on business website
        ("https://printFoot.ai", [False, False, False, True]),
        ("printFoot.ai", [False, False, False, True]),
    ],
)
def test_search(
    fp_id1, fp_id2, fp_id3, fp_bid, sandbox_tenant, search, expected_fp_ids
):
    fp_ids = [fp_id1, fp_id2, fp_id3, fp_bid]
    data = dict(search=search, pagination=dict(page_size=100))
    body = post("entities/search", data, *sandbox_tenant.db_auths)
    for i, (fp_id, expected) in enumerate(zip(fp_ids, expected_fp_ids)):
        exists = any(i["id"] == fp_id for i in body["data"])
        assert (
            exists == expected
        ), f"fp_id {i}: exists={exists}, but expected={expected}"
