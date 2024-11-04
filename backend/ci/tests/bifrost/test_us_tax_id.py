import pytest
from tests.bifrost_client import BifrostClient, RepeatRequirement
from tests.utils import create_ob_config, get, patch, post


@pytest.fixture(scope="session")
def us_tax_id_obc(sandbox_tenant):
    return create_ob_config(
        sandbox_tenant,
        "KYC with US tax ID",
        must_collect_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_tax_id",
        ],
        optional_data=[],
    )


def test_valid_us_tax_id_ssn(us_tax_id_obc):
    data = {"id.us_tax_id": "121-12-1212"}
    tenant = us_tax_id_obc.tenant
    bifrost = BifrostClient.new_user(us_tax_id_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    user = bifrost.run()
    assert user.fp_id

    body = post(
        f"/users/{user.fp_id}/vault/decrypt",
        dict(fields=["id.us_tax_id", "id.ssn9"], reason="test"),
        tenant.sk.key,
    )
    assert body["id.us_tax_id"] == data["id.us_tax_id"].replace("-", "")
    assert body["id.ssn9"] == data["id.us_tax_id"].replace("-", "")

    # test that patching itin fails
    r = {"id.itin": "912-51-3131"}
    body = patch(f"/users/{user.fp_id}/vault", r, tenant.sk.key, status_code=400)
    assert body["context"]["id.itin"].startswith("Conflicts with id.ssn")

    # test that patching ssn9 also works
    r = {"id.ssn9": "121-12-1313"}
    patch(f"/users/{user.fp_id}/vault", r, tenant.sk.key)


def test_valid_us_tax_id_itin(us_tax_id_obc):
    data = {"id.us_tax_id": "919-51-1212"}
    tenant = us_tax_id_obc.tenant
    bifrost = BifrostClient.new_user(us_tax_id_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    user = bifrost.run()
    assert user.fp_id

    # test that getting itin works
    body = post(
        f"/users/{user.fp_id}/vault/decrypt",
        dict(fields=["id.us_tax_id", "id.itin"], reason="test"),
        tenant.sk.key,
    )
    assert body["id.us_tax_id"] == data["id.us_tax_id"].replace("-", "")
    assert body["id.itin"] == data["id.us_tax_id"].replace("-", "")

    # test that patching new itin works
    r = {"id.itin": "912-51-3131"}
    patch(f"/users/{user.fp_id}/vault", r, tenant.sk.key)

    # test that patching ssn9 fails
    r = {"id.ssn9": "121-12-1313"}
    body = patch(f"/users/{user.fp_id}/vault", r, tenant.sk.key, status_code=400)
    assert body["context"]["id.ssn9"] == "Conflicts with id.itin."


@pytest.mark.parametrize(
    "data",
    [
        {
            "id.us_tax_id": "121-12-0000",  # invalid ssn & itin
        },
        {
            "id.us_tax_id": "919-44-1212",  # invalid itin
        },
    ],
)
def test_invalid_us_tax_id(us_tax_id_obc, data):
    bifrost = BifrostClient.new_user(us_tax_id_obc)
    bifrost.data = {
        **bifrost.data,
        **data,
    }
    try:
        bifrost.run()
        assert False, "Should have failed running bifrost"
    except Exception as e:
        print(f"Handling error:\n{e}")


@pytest.mark.parametrize(
    "data",
    [
        {
            "id.ssn9": "121-12-1212",
        },
        {
            "id.itin": "919-51-1212",
        },
    ],
)
def test_vaulting_itin_or_ssn9_vaults_tax_id(sandbox_tenant, data):
    body = post("/users", None, sandbox_tenant.sk.key)
    fp_id = body["id"]

    r = {"id.first_name": "Jane", "id.last_name": "Doe", "id.dob": "1988-12-30", **data}
    patch(f"/users/{fp_id}/vault", r, sandbox_tenant.sk.key)
    body = post(
        f"/users/{fp_id}/vault/decrypt",
        dict(fields=["id.us_tax_id"], reason="test"),
        sandbox_tenant.sk.key,
    )
    if "id.ssn9" in data:
        assert body["id.us_tax_id"] == data["id.ssn9"].replace("-", "")
    else:
        assert body["id.us_tax_id"] == data["id.itin"].replace("-", "")


@pytest.mark.parametrize(
    "data",
    [
        # test no: ssn9/4 and itin in same request
        (
            {"id.ssn9": "121-12-1212", "id.itin": "912-51-3131"},
            400,
            {"id.ssn4": "1212", "id.itin": "912-51-3131"},
            400,
        ),
        # test no: us_tax_id(itin) if ssn9 exists
        ({"id.ssn9": "121-12-3131"}, 200, {"id.us_tax_id": "912-51-3131"}, 400),
        # test no: us_tax_id(ssn9) if itin exists
        ({"id.itin": "912-51-3131"}, 200, {"id.us_tax_id": "121-12-1212"}, 400),
        # test yes: us_tax_id(itin) if itin exists
        ({"id.itin": "912-51-3131"}, 200, {"id.us_tax_id": "912-51-3232"}, 200),
        # test yes: us_tax_id(ssn9) if ssn9 exists
        ({"id.ssn9": "121-12-3131"}, 200, {"id.us_tax_id": "121-12-1212"}, 200),
    ],
)
def test_edge_cases(sandbox_tenant, data):
    body = post("/users", None, sandbox_tenant.sk.key)
    fp_id = body["id"]
    r = {"id.first_name": "Jane", "id.last_name": "Doe", "id.dob": "1988-12-30"}
    patch(f"/users/{fp_id}/vault", r, sandbox_tenant.sk.key)

    (r1, s1, r2, s2) = data
    patch(f"/users/{fp_id}/vault", r1, sandbox_tenant.sk.key, status_code=s1)
    patch(f"/users/{fp_id}/vault", r2, sandbox_tenant.sk.key, status_code=s2)
