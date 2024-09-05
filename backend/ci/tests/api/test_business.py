import pytest
from tests.utils import _gen_random_sandbox_id, _gen_random_str, post, patch, get
from tests.headers import ExternalId


@pytest.mark.parametrize(
    "key, value",
    [
        ("business.name", "Footprint"),
        ("business.dba", "Printfoot"),
        ("business.tin", "123121234"),
        ("business.zip", "12345"),
        ("business.zip", "12345-1234"),
        ("business.address_line1", "1 Footprint Way"),
        ("business.phone_number", "+14444444444"),
        ("business.corporation_type", "llc"),
        ("custom.my_fun_field", "Hayes Valley"),
        ("custom.my_fun_field2", dict(a="b")),
    ],
)
def test_data_vaulting(sandbox_tenant, key, value):
    # Should be able to initialize a vault with the data
    data = {key: value}
    post("businesses/", data, sandbox_tenant.sk.key)

    # And should be able to add it to an existing vault
    body = post("businesses/", None, sandbox_tenant.sk.key)
    fp_id = body["id"]
    patch(f"businesses/{fp_id}/vault", data, sandbox_tenant.sk.key)
    post(f"businesses/{fp_id}/vault/validate", data, sandbox_tenant.sk.key)
    data = dict(fields=[key], reason="testing")
    body = post(f"businesses/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
    assert body[key] == value


@pytest.mark.parametrize(
    "key, value, expected_error",
    [
        ("id.ssn9", "123121234", "Cannot add to this type of vault"),
        (
            "business.corporation_type",
            "flerp",
            "Cannot parse: Matching variant not found",
        ),
    ],
)
def test_data_validation(sandbox_tenant, key, value, expected_error):
    # Can't create the business inline with invalid data
    data = {key: value}
    post("businesses/", data, sandbox_tenant.sk.key, status_code=400)

    body = post("businesses/", None, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    body = patch(
        f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key, status_code=400
    )
    # Should have a JSON error message with the invalid field identifier as the key
    assert body["context"][key] == expected_error
    # Validate endpoint should also fail
    post(
        f"entities/{fp_id}/vault/validate", data, sandbox_tenant.sk.key, status_code=400
    )


def test_vault_benficial_owners(sandbox_tenant):
    data = {
        "business.beneficial_owners": [
            {"first_name": "Piip", "last_name": "Penguin", "ownership_stake": 50}
        ]
    }
    body = post("businesses/", data, sandbox_tenant.sk.key)
    fp_bid = body["id"]

    body = get(f"entities/{fp_bid}/business_owners", None, *sandbox_tenant.db_auths)
    assert body[0]["ownership_stake"] == 50


def test_external_id(tenant, sandbox_tenant):
    external_id = f"my_cus_id_{_gen_random_sandbox_id()}"
    body = post("businesses/", None, tenant.sk.key, ExternalId(external_id))
    fp_id = body["id"]
    assert body["external_id"] == external_id

    # test fetching the user by the external id
    body = get(f"businesses/?external_id={external_id}", None, tenant.sk.key)
    print(body)
    assert body["data"][0]["id"] == fp_id
    assert body["data"][0]["external_id"] == external_id

    # test no failure creating the same user
    body = post("businesses/", None, tenant.sk.key, ExternalId(external_id))
    assert body["id"] == fp_id
    assert body["external_id"] == external_id

    # Cannot provide data alongisde external ID since result would be undefined
    data = {"id.dob": "1998-12-25"}
    post("businesses/", data, tenant.sk.key, ExternalId(external_id), status_code=400)

    # Can use the same external ID at another tenant to get a different vault
    body = post("businesses/", None, sandbox_tenant.sk.key, ExternalId(external_id))
    assert body["id"] != fp_id

    invalid_id_too_short = ExternalId("1234")
    post(
        "businesses/",
        None,
        sandbox_tenant.sk.key,
        invalid_id_too_short,
        status_code=400,
    )
