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
        dict(search=fp_id),
        *tenant.db_auths,
    )
    access_events = body["data"]
    assert access_events[0]["kind"] == "decrypt"

    events = set(access_events[0]["targets"])
    assert events == set(fields_to_check)

    # delete some data
    fields = ["card.valley.cvc", "id.first_name"]
    data = dict(fields=fields)
    body = delete(f"entities/{fp_id}/vault", data, tenant.sk.key)
    assert body["card.valley.cvc"] == True
    assert body["id.first_name"] == True

    # check data no longer exists
    params = dict(fields=",".join(fields))
    body = get(f"entities/{fp_id}/vault", params, tenant.sk.key)
    assert not body["card.valley.cvc"]
    assert not body["id.first_name"]

    # check the access events and check it's correct
    body = get(
        "org/access_events",
        dict(search=fp_id),
        *tenant.db_auths,
    )
    access_events = body["data"]
    events = access_events[0]["targets"]
    assert set(events) == set(["card.valley.cvc", "id.first_name"])
    assert access_events[0]["kind"] == "delete"

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
