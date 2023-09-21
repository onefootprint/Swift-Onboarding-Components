import pytest
from tests.utils import post, patch


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
    ],
)
def test_data_vaulting(tenant, key, value):
    # Should be able to initialize a vault with the data
    data = {key: value}
    post("businesses/", data, tenant.sk.key)

    # And should be able to add it to an existing vault
    body = post("businesses/", None, tenant.sk.key)
    fp_id = body["id"]
    patch(f"businesses/{fp_id}/vault", data, tenant.sk.key)
    post(f"businesses/{fp_id}/vault/validate", data, tenant.sk.key)


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
def test_data_validation(tenant, key, value, expected_error):
    # Can't create the business inline with invalid data
    data = {key: value}
    post("businesses/", data, tenant.sk.key, status_code=400)

    body = post("businesses/", None, tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    # Should have a JSON error message with the invalid field identifier as the key
    assert body["error"]["message"][key] == expected_error
    # Validate endpoint should also fail
    post(f"entities/{fp_id}/vault/validate", data, tenant.sk.key, status_code=400)
