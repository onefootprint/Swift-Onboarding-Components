import hashlib
import hmac
from tests.utils import post, get, patch, delete
from tests.constants import EMAIL, FIXTURE_PHONE_NUMBER, ID_DATA, CREDIT_CARD_DATA


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

    expiration = initial_data["card.hayes.expiration"]
    derived_data = {
        "card.hayes.expiration_month": expiration.split("/")[0],
        "card.hayes.expiration_year": expiration.split("/")[1],
        "card.hayes.issuer": "visa",
        "card.hayes.number_last4": initial_data["card.hayes.number"][-4:],
    }
    ALL_VAULT_DATA = initial_data | derived_data | update_data

    # check that the data is there now
    fields_to_check = [i for i in ALL_VAULT_DATA] + ["custom.insurance_id"]
    params = {"fields": ", ".join(fields_to_check)}

    response = get(f"entities/{fp_id}/vault", params, tenant.sk.key)
    for k in ALL_VAULT_DATA:
        assert response[k] == True
    assert response["custom.insurance_id"] == False

    # decrypt the data
    fields_to_decrypt = [
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
        fields=fields_to_decrypt,
    )
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key)
    for f in fields_to_decrypt:
        assert body[f] == ALL_VAULT_DATA[f]

    # delete some data
    fields_to_delete = ["card.valley.cvc", "id.first_name"]
    data = dict(fields=fields_to_delete)
    body = delete(f"entities/{fp_id}/vault", data, tenant.sk.key)
    assert body["card.valley.cvc"] == True
    assert body["id.first_name"] == True

    # check data no longer exists
    params = dict(fields=",".join(fields_to_delete))
    body = get(f"entities/{fp_id}/vault", params, tenant.sk.key)
    assert not body["card.valley.cvc"]
    assert not body["id.first_name"]

    # delete all data
    data = dict(delete_all=True)
    body = delete(f"entities/{fp_id}/vault", data, tenant.sk.key)
    expected_deleted_fields = list(set(ALL_VAULT_DATA.keys()) - set(fields_to_delete))
    for k in expected_deleted_fields:
        assert body[k] == True

    # check the audit events made by the two delete operations and the decrypt operation
    body = get("org/audit_events", dict(search=fp_id), *tenant.db_auths)
    audit_events = body["data"]

    assert audit_events[0]["name"] == "delete_user_data"
    assert set(audit_events[0]["detail"]["data"]["deleted_fields"]) == set(expected_deleted_fields)

    assert audit_events[1]["name"] == "delete_user_data"
    assert set(audit_events[1]["detail"]["data"]["deleted_fields"]) == set(fields_to_delete)

    assert audit_events[2]["name"] == "decrypt_user_data"
    assert set(audit_events[2]["detail"]["data"]["decrypted_fields"]) == set(fields_to_decrypt)

    data = dict(fields=["card.valley.cvc"], reason="try decrypt failure")
    body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key, status_code=200)
    assert "card.valley.cvc" not in data
    assert "id.first_name" not in data


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

    def check(resp):
        for key, value in data.items():
            expected = hmac.new(
                bytes.fromhex(signing_key),
                msg=bytes(value, "utf-8"),
                digestmod=hashlib.sha256,
            ).hexdigest()
            assert resp[key] == expected

    # should be able to validate the integrity
    resp = post(
        f"users/{fp_id}/vault/integrity",  # backwards compat
        dict(fields=list(data.keys()), signing_key=signing_key),
        sandbox_tenant.sk.key,
    )
    check(resp)

    resp = post(
        f"users/{fp_id}/vault/decrypt",
        {
            "fields": list(data.keys()),
            "reason": "hmac",
            "transforms": [f'hmac_sha256("{signing_key}")'],
        },
        sandbox_tenant.sk.key,
    )
    check(resp)


def test_decrypt_rsa_encrypt(sandbox_tenant):
    initial_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "custom.test_field": "hello world",
        **ID_DATA,
        **CREDIT_CARD_DATA,
    }
    body = post("users/", initial_data, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]

    # setup our keys
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.primitives import serialization

    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    pk_der = public_key.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).hex()

    # do our re-encrypt
    fields = ["custom.test_field", "id.first_name", "id.phone_number"]
    resp = post(
        f"entities/{fp_id}/vault/decrypt",
        {
            "fields": fields,
            "reason": "i want to",
            "transforms": [f"encrypt('rsa_pkcs1v15','{pk_der}')"],
        },
        sandbox_tenant.sk.key,
    )

    # check the results
    for identifier in fields:
        real_pii = initial_data[identifier]
        result_value = resp[identifier]
        decrypted = private_key.decrypt(
            bytes.fromhex(result_value), padding.PKCS1v15()
        ).decode("utf-8")
        assert decrypted == real_pii


def test_delete(sandbox_tenant):
    initial_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "custom.test_field": "hello world",
    }
    body = post("users", initial_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # Check validation errors
    for data in [
        dict(),
        dict(delete_all=False),
        dict(fields=["id.phone_number"], delete_all=True),
    ]:
        body = delete(
            f"users/{fp_id}/vault", data, sandbox_tenant.sk.key, status_code=400
        )
        assert body["message"] == "Must provide only one of `delete_all` and `fields`"

    # Check deleting data
    data = dict(fields=["id.phone_number"])
    body = delete(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)
    assert body["id.phone_number"] == True

    data = dict(delete_all=True)
    body = delete(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)
    assert body["id.email"] == True
    assert body["custom.test_field"] == True

    # Verify audit events
    body = get("org/audit_events", dict(search=fp_id), *sandbox_tenant.db_auths)
    audit_events = body["data"]

    assert audit_events[0]["name"] == "delete_user_data"
    assert set(audit_events[0]["detail"]["data"]["deleted_fields"]) == {"id.email", "custom.test_field"}
    assert audit_events[1]["name"] == "delete_user_data"
    assert set(audit_events[1]["detail"]["data"]["deleted_fields"]) == {"id.phone_number"}


def test_card_expiration_transform(tenant):
    # https://docs.onefootprint.com/vault/fields
    expiration_transforms = [
        # MM/YYYY (not transformed)
        ("01/2023", "01/2023"),
        ("12/2023", "12/2023"),
        ("02/0000", "02/0000"),
        ("03/1990", "03/1990"),
        # MM-YYYY
        ("01-2023", "01/2023"),
        ("12-2023", "12/2023"),
        ("02-0000", "02/0000"),
        ("03-1990", "03/1990"),
        # MM/YY
        ("01/23", "01/2023"),
        ("12/23", "12/2023"),
        ("02/00", "02/2000"),
        ("03/90", "03/2090"),
        # MM-YY
        ("01-23", "01/2023"),
        ("12-23", "12/2023"),
        ("02-00", "02/2000"),
        ("03-90", "03/2090"),
        # M/YY
        ("1/23", "01/2023"),
        ("2/00", "02/2000"),
        ("3/90", "03/2090"),
        # M-YY
        ("1-23", "01/2023"),
        ("2-00", "02/2000"),
        ("3-90", "03/2090"),
    ]

    for exp_input, exp_vaulted in expiration_transforms:
        # Create the vault
        body = post("users", {}, tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # Set the expiration date.
        update_data = {
            "card.testing.expiration": exp_input,
        }
        patch(f"entities/{fp_id}/vault", update_data, tenant.sk.key)

        # Ensure the new fields are available.
        expected_data = {
            "card.testing.expiration": exp_vaulted,
            "card.testing.expiration_month": exp_vaulted.split("/")[0],
            "card.testing.expiration_year": exp_vaulted.split("/")[1],
        }

        params = {"fields": ", ".join(expected_data.keys())}
        response = get(f"entities/{fp_id}/vault", params, tenant.sk.key)

        for k in expected_data:
            assert response[k] == True

        # Decrypt and check format.
        data = dict(
            reason="test",
            fields=list(expected_data.keys()),
        )
        body = post(f"entities/{fp_id}/vault/decrypt", data, tenant.sk.key)
        for f in expected_data:
            assert body[f] == expected_data[f]

    # Create a fresh vault
    body = post("users", {}, tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    bad_formats = [
        "January 2023",
        "Jan 2023",
        "Jan. 2023",
        "January 23",
        "Jan 23",
        "Jan23",
        "Jan2023",
        "",
        "1/2",
        "1-2",
        "12",
        "1",
        "1/",
        "1-",
        "/1",
        "-1",
        "01/0",
        "01-0",
        "01/",
        "01-",
        "/00",
        "-00",
        "01/99999",
        "01-99999",
        "111/22",
        "111-22",
        "111/222",
        "111-222",
        "012023",
        "0123",
        "13/23",
        "13-23",
        "100/23",
        "100-23",
        "00/23",
        "00/2023",
        "00/00",
        "0/23",
        "0/2023",
        "0/00",
    ]

    for bad_exp in bad_formats:
        update_data = {
            "card.testing.expiration": bad_exp,
        }
        patch(f"entities/{fp_id}/vault", update_data, tenant.sk.key, status_code=400)
