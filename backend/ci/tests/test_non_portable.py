import pytest
from tests.utils import post, get, patch
from tests.constants import EMAIL, PHONE_NUMBER, ID_DATA, CREDIT_CARD_DATA


@pytest.mark.parametrize(
    "key, value, expected_error",
    [
        ("id.ssn9", "12345678", "Invalid length"),
        ("id.ssn4", "123456789", "Invalid length"),
        ("id.ssn4", "123", "Invalid length"),
        ("id.ssn4", "123a", "Invalid character: can only provide ascii digits"),
        ("id.first_name", "Hi", "Cannot vault without other Name data"),
        ("id.last_name", "Bye", "Cannot vault without other Name data"),
        (
            "id.dob",
            "2023-13-25",
            "Invalid date: must provide a valid date in ISO 8601 format, YYYY-MM-DD",
        ),
        ("id.zip", "12345", "Cannot vault without other Address data"),
        (
            "id.address_line1",
            "1 Footprint Way",
            "Cannot vault without other Address data",
        ),
        (
            "business.tin",
            "12-1234567",
            "Cannot add to this type of vault",
        ),
        (
            "card.flerp.number",
            "4026123412341233",
            "InvalidLuhn",
        ),
    ],
)
def test_data_validation(tenant, key, value, expected_error):
    # Can't create the user inline with invalid data
    data = {key: value}
    # TODO fix this
    post("users/", data, tenant.sk.key, status_code=400)

    body = post("users/", None, tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    # Should have a JSON error message with the invalid field identifier as the key
    assert body["error"]["message"][key] == expected_error
    # Validate endpoint should also fail
    post(f"entities/{fp_id}/vault/validate", data, tenant.sk.key, status_code=400)


@pytest.mark.parametrize(
    "key", ["custom.", "custom.flerp!", "card.hayes valley.cvc", "id.derp"]
)
def test_invalid_dis(key, tenant):
    # Can't create the user inline with invalid data
    data = {key: "123"}
    # TODO fix this
    # post("users/", data, tenant.sk.key, status_code=400)

    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]

    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    assert "Json deserialize error" in body["error"]["message"]
    post(f"entities/{fp_id}/vault/validate", data, tenant.sk.key, status_code=400)


@pytest.mark.parametrize(
    "entry,derived_entry",
    [
        (
            {
                "id.ssn9": "123-12-0987",
                "id.ssn4": "something bogus that will be overwritten",
            },
            {"id.ssn4": "0987"},
        ),
        (
            {
                "card.hayes_valley.number": "4428680502681658",
                "card.hayes_valley.last4": "something bogus that will be overwritten",
            },
            {"card.hayes_valley.last4": "1658"},
        ),
    ],
)
def test_derived_entries(tenant, entry, derived_entry):
    body = post("users/", entry, tenant.sk.key)
    fp_id = body["id"]

    data = dict(fields=list(derived_entry), reason="Hayes valley integration test")
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key)
    for k, v in derived_entry.items():
        assert body[k] == v


def test_vault_create_write_decrypt(tenant):
    # create the vault
    initial_data = {
        "id.phone_number": PHONE_NUMBER,
        "id.email": EMAIL,
        "custom.hi": "bye",
        **ID_DATA,
        **CREDIT_CARD_DATA,
    }
    body = post("users/", initial_data, tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    # add some more data to the vault
    update_data = {
        "custom.ach_account_number": "123467890",
        "custom.cc4": "4242",
    }
    patch(f"entities/{fp_id}/vault", update_data, tenant.sk.key)

    # check that the data is there now
    all_data = {
        **initial_data,
        **update_data,
    }
    fields_to_check = [i for i in all_data] + ["custom.insurance_id"]
    params = {"fields": ", ".join(fields_to_check)}

    response = get(f"entities/{fp_id}/vault", params, tenant.sk.key)
    for k in all_data:
        assert response[k]
    assert response["custom.insurance_id"] == False

    # decrypt the data
    fields_to_check = [
        "id.first_name",
        "id.zip",
        "custom.ach_account_number",
        "custom.cc4",
        "card.hayes.exp_month",
        "card.valley.cvc",
    ]
    data = dict(
        reason="test",
        fields=fields_to_check,
    )
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key)
    data = body
    for f in fields_to_check:
        assert data[f] == all_data[f]

    # verify access events created
    body = get(
        "org/access_events",
        dict(footprint_user_id=fp_id),
        tenant.sk.key,
    )
    access_events = body["data"]
    assert access_events[0]["kind"] == "decrypt"

    events = set(access_events[0]["targets"])
    assert events == set(fields_to_check)
