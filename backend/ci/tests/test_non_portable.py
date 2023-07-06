import pytest
from tests.utils import _gen_random_ssn, create_ob_config
from tests.utils import post, get, patch, delete
from tests.headers import IdempotencyId
from tests.constants import EMAIL, FIXTURE_PHONE_NUMBER, ID_DATA, CREDIT_CARD_DATA
import hmac
import hashlib


def test_ssn_vaulting(tenant):
    # We have some special logic that no-ops when updating ssn4
    data = {"id.ssn9": "123-456789"}
    body = post("users/", data, tenant.sk.key)
    fp_id = body["id"]

    # Shouldn't be able to add mismatching ssn4
    data = {"id.ssn4": "0000"}
    patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)

    # But should be able to add matching ssn4
    data = {"id.ssn4": "6789"}
    patch(f"entities/{fp_id}/vault", data, tenant.sk.key)


@pytest.mark.parametrize(
    "key, value",
    [
        ("id.first_name", "Hi"),
        ("id.last_name", "Bye"),
        ("id.dob", "2023-12-25"),
        ("id.ssn9", "123-12-1234"),
        ("id.ssn4", "1234"),
        ("id.zip", "12345"),
        ("id.zip", "12345-1234"),
        ("id.address_line1", "1 Footprint Way"),
        ("id.phone_number", "+14444444444"),
        ("id.email", "piip@onefootprint.com"),
        ("id.email", "example#@gmail.com"),
    ],
)
def test_data_vaulting(tenant, key, value):
    # Should be able to initialize a vault with the data
    data = {key: value}
    post("users/", data, tenant.sk.key)

    # And should be able to add it to an existing vault
    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]
    patch(f"entities/{fp_id}/vault", data, tenant.sk.key)
    post(f"entities/{fp_id}/vault/validate", data, tenant.sk.key)


@pytest.mark.parametrize(
    "key, value, expected_error",
    [
        ("id.ssn9", "12345678", "Invalid length"),
        ("id.ssn4", "123456789", "Invalid length"),
        ("id.ssn4", "123", "Invalid length"),
        ("id.ssn4", "123a", "Invalid character: can only provide ascii digits"),
        (
            "id.dob",
            "2023-13-25",
            "Invalid date: must provide a valid date in ISO 8601 format, YYYY-MM-DD",
        ),
        (
            "business.tin",
            "12-1234567",
            "Cannot add to this type of vault",
        ),
        (
            "card.flerp.number",
            "4026123412341233",
            "Invalid checksum. Please verify that the number is correct",
        ),
        (
            "card.flerp.expiration_month",
            "12",
            "Cannot specify this piece of data. It will automatically be derived.",
        ),
    ],
)
def test_data_validation(tenant, key, value, expected_error):
    # Can't create the user inline with invalid data
    data = {key: value}
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
    body = post("users/", data, tenant.sk.key, status_code=400)
    assert "Json deserialize error" in body["error"]["message"]

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
            },
            {
                "card.hayes_valley.number_last4": "1658",
                "card.hayes_valley.issuer": "visa",
            },
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
        "id.phone_number": FIXTURE_PHONE_NUMBER,
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
        "card.hayes.expiration_month",
        "card.hayes.expiration_year",
        "card.hayes.number_last4",
        "card.valley.cvc",
    ]
    data = dict(
        reason="test",
        fields=fields_to_check,
    )
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key)
    data = body

    all_data = {
        **all_data,
        "card.hayes.expiration_month": all_data["card.hayes.expiration"].split("/")[0],
        "card.hayes.expiration_year": all_data["card.hayes.expiration"].split("/")[1],
        "card.hayes.number_last4": all_data["card.hayes.number"][-4:],
    }
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

    # delete some data
    params = dict(fields="card.valley.cvc")
    body = delete(f"entities/{fp_id}/vault", params, tenant.sk.key)
    assert body["card.valley.cvc"] == True

    # check data no longer exists
    body = get(f"entities/{fp_id}/vault", params, tenant.sk.key)
    assert not body["card.valley.cvc"]

    data = dict(fields=["card.valley.cvc"], reason="try decrypt failure")
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key, status_code=200)
    assert "card.valley.cvc" not in data

    # check the access events and check it's correct
    body = get(
        "org/access_events",
        dict(footprint_user_id=fp_id),
        tenant.sk.key,
    )
    access_events = body["data"]
    events = access_events[1]["targets"]
    assert events == ["card.valley.cvc"]

    assert access_events[1]["kind"] == "delete"


def test_idempotency_id(tenant, sandbox_tenant):
    # Can't create the user inline with invalid data
    idempotency_id = IdempotencyId("1234567890Aa._-")
    body = post("users/", None, tenant.sk.key, idempotency_id)
    fp_id = body["id"]

    # When making vault with same idempotency id, should get same fp_id
    body = post("users/", None, tenant.sk.key, idempotency_id)
    assert body["id"] == fp_id

    # Cannot provide data alongisde idempotency ID since result would be undefined
    data = {"id.dob": "1998-12-25"}
    post("users/", data, tenant.sk.key, idempotency_id, status_code=400)

    # Can use the same idempotency ID at another tenant to get a different vault
    body = post("users/", None, sandbox_tenant.sk.key, idempotency_id)
    assert body["id"] != fp_id

    invalid_idempotency_id = IdempotencyId("1234")
    post("users/", None, sandbox_tenant.sk.key, invalid_idempotency_id, status_code=400)

    invalid_idempotency_id = IdempotencyId("1234567890000!")
    post("users/", None, sandbox_tenant.sk.key, invalid_idempotency_id, status_code=400)


# validates integrity checks
def test_data_integrity_check(sandbox_tenant):
    body = post("users/", None, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    data = {
        "id.first_name": "billy",
        "id.last_name": "bob",
        "id.ssn9": "121212121",
        "card.primary.number": "4242424242424242",
    }
    body = patch(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

    signing_key = "a1f928d87278290bf9dece075d0e46330a01d21b346073f4f193739078dca458"

    # should be able to validate the integrity
    resp = post(
        f"users/{fp_id}/vault/integrity",
        dict(fields=list(data.keys()), signing_key=signing_key),
        sandbox_tenant.sk.key,
    )
    print("response: ", resp)

    for key, value in data.items():
        expected = hmac.new(
            bytes.fromhex(signing_key),
            msg=bytes(value, "utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()
        assert resp[key] == expected


@pytest.mark.parametrize(
    "missing_can_access_data,missing_vault_data,expected_error",
    [
        ([], [], None),
        (["dob"], [], "Invalid onboarding configuration for Vault"),
        ([], ["id.ssn9"], "Unmet onboarding requirements: CollectData"),
    ],
)
def test_kyc(
    sandbox_tenant,
    must_collect_data,
    missing_can_access_data,
    missing_vault_data,
    expected_error,
):
    obc = create_ob_config(
        sandbox_tenant,
        **{
            "name": "Acme Bank Card",
            "must_collect_data": must_collect_data,
            "can_access_data": list(
                set(must_collect_data) - set(missing_can_access_data)
            ),
        },
    )

    # create NPV
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    [vault_data.pop(d) for d in missing_vault_data]

    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # run KYC
    body = post(
        f"entities/{fp_id}/kyc",
        dict(onboarding_config_key=obc.key.value),
        sandbox_tenant.sk.key,
        status_code=200 if expected_error is None else 400,
    )
    if expected_error:
        assert expected_error in body["error"]["message"]
        return

    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"

    # confirm OBD timeline event created
    timeline = get(
        f"entities/{fp_id}/timeline",
        None,
        sandbox_tenant.sk.key,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # confirm we can still decrypt all fields
    post(
        f"entities/{fp_id}/vault/decrypt",
        {
            "fields": list(vault_data.keys()),
            "reason": "i wanna",
        },
        sandbox_tenant.sk.key,
    )


def test_large_objects(sandbox_tenant):
    body = post("users/", None, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    data = {
        "id.first_name": "billy",
        "id.last_name": "bob",
    }
    body = patch(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

    di = "custom.large_id"
    obj = {"some_key": "hello world!" * 250_000}

    post(f"/users/{fp_id}/vault/{di}/upload", obj, sandbox_tenant.sk.key)

    resp = post(
        f"entities/{fp_id}/vault/decrypt",
        {
            "fields": [di, "id.first_name"],
            "reason": "i wanna2",
        },
        sandbox_tenant.sk.key,
    )

    import base64, json

    assert resp["id.first_name"] == "billy"
    assert resp[di]
    obj_out = base64.b64decode(resp[di])
    assert json.loads(obj_out)["some_key"] == obj["some_key"]
