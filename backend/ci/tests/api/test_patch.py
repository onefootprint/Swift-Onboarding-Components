import pytest
from tests.bifrost_client import BifrostClient
from tests.headers import IgnoreCardValidation
from tests.types import ObConfiguration
from tests.utils import post, patch, get
from tests.constants import FIXTURE_PHONE_NUMBER2, FIXTURE_EMAIL, FIXTURE_PHONE_NUMBER
from tests.headers import SandboxId, FpAuth


def test_ssn_vaulting(tenant):
    # We have some special logic that no-ops when updating ssn4
    data = {"id.ssn9": "12-345-6789"}
    body = post("users/", data, tenant.sk.key)
    fp_id = body["id"]

    # Shouldn't be able to add mismatching ssn4
    data = {"id.ssn4": "1233"}
    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    assert body["code"] == "T120"
    assert (
        body["context"]["id.ssn4"] == "Cannot add ssn4 when vault already has full data"
    )

    # But should be able to add matching ssn4
    data = {"id.ssn4": "6789"}
    patch(f"entities/{fp_id}/vault", data, tenant.sk.key)


def test_nationality_vaulting(tenant):
    # Add full US legal status CDO
    data = {"id.us_legal_status": "citizen"}
    body = post("users/", data, tenant.sk.key)
    fp_id = body["id"]

    # Can still update nationality independently
    data = {"id.nationality": "US"}
    patch(f"entities/{fp_id}/vault", data, tenant.sk.key)


def test_empty_response(tenant):
    """
    Make sure the empty response is an empty JSON object and not null
    """
    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]

    data = {"id.first_name": "Flerp"}
    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key)
    assert body == {}


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
        ("document.drivers_license.document_number", "12345"),
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
        ("business.name", "Flerp", "Cannot add to this type of vault"),
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
        (
            "document.drivers_license.front.image",
            "laksdjflasdjhfahsdkfhiuewr",
            "Cannot vault document data. Please use the vault upload endpoint instead for this attribute.",
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
    assert body["context"][key] == expected_error
    # Validate endpoint should also fail
    post(f"entities/{fp_id}/vault/validate", data, tenant.sk.key, status_code=400)


@pytest.mark.parametrize(
    "data,should_succeed",
    [
        [{"id.state": "CA", "id.country": "US"}, True],
        [{"id.state": "California", "id.country": "US"}, False],
        [{"id.state": "Yucatan", "id.country": "MX"}, True],
    ],
)
def test_multi_value_validation(tenant, data, should_succeed):
    # Can't create the user inline with invalid data
    post("users/", data, tenant.sk.key, status_code=200 if should_succeed else 400)

    body = post("users/", None, tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    # Validate endpoint should also fail
    post(
        f"users/{fp_id}/vault/validate",
        data,
        tenant.sk.key,
        status_code=200 if should_succeed else 400,
    )
    patch(
        f"users/{fp_id}/vault",
        data,
        tenant.sk.key,
        status_code=200 if should_succeed else 400,
    )


def test_ignore_card_validation(tenant):
    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]

    # Should fail luhn validation
    data = {"card.primary.number": "4242424242424241"}
    body = patch(f"users/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    assert (
        body["context"]["card.primary.number"]
        == "Invalid checksum. Please verify that the number is correct"
    )

    # Should be able to silence luhn validation
    patch(f"users/{fp_id}/vault", data, tenant.sk.key, IgnoreCardValidation("true"))


@pytest.mark.parametrize(
    "key", ["custom.", "custom.flerp!", "card.hayes valley.cvc", "id.derp"]
)
def test_invalid_dis(key, tenant):
    # Can't create the user inline with invalid data
    data = {key: "123"}
    body = post("users/", data, tenant.sk.key, status_code=400)
    assert "Json deserialize error" in body["message"]

    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]

    body = patch(f"entities/{fp_id}/vault", data, tenant.sk.key, status_code=400)
    assert "Json deserialize error" in body["message"]
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


def test_delete_and_update(tenant):
    # And should be able to add it to an existing vault
    body = post("users/", None, tenant.sk.key)
    fp_id = body["id"]

    # Add some data
    data = {"id.first_name": "Hayes", "id.last_name": "Valley"}
    patch(f"users/{fp_id}/vault", data, tenant.sk.key)
    post(f"users/{fp_id}/vault/validate", data, tenant.sk.key)

    body = get("org/audit_events", dict(fp_id=fp_id), *tenant.db_auths)
    assert any(
        i["name"] == "update_user_data"
        and set(i["detail"]["data"]["updated_fields"])
        == {"id.first_name", "id.last_name"}
        for i in body["data"]
    )

    # Delete some data and update some other data in the same request
    data = {"id.first_name": None, "id.dob": "1995-01-10"}
    patch(f"users/{fp_id}/vault", data, tenant.sk.key)
    post(f"users/{fp_id}/vault/validate", data, tenant.sk.key)

    body = get("org/audit_events", dict(fp_id=fp_id), *tenant.db_auths)
    assert any(
        i["name"] == "update_user_data"
        and set(i["detail"]["data"]["updated_fields"]) == {"id.dob"}
        for i in body["data"]
    )
    assert any(
        i["name"] == "delete_user_data"
        and set(i["detail"]["data"]["deleted_fields"]) == {"id.first_name"}
        for i in body["data"]
    )


def test_replace_verified_ci(sandbox_tenant, investor_profile_ob_config):
    obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()

    def identify(obc: ObConfiguration, **kwargs):
        data = dict(scope="onboarding", **kwargs)
        body = post("hosted/identify", data, obc.key, SandboxId(bifrost.sandbox_id))
        if not body["user"]:
            return None
        token = FpAuth(body["user"]["token"])
        body = get("hosted/user/private_info", None, token)
        return body["fp_id"]

    # Write a new phone number
    data = {"id.phone_number": FIXTURE_PHONE_NUMBER2}
    patch(f"users/{user.fp_id}/vault", data, sandbox_tenant.s_sk)

    # Should be able to use the new phone number or old email to locate the user
    assert identify(obc, phone_number=FIXTURE_PHONE_NUMBER) == None
    assert identify(obc, phone_number=FIXTURE_PHONE_NUMBER2) == user.fp_id
    assert (
        identify(obc, phone_number=FIXTURE_PHONE_NUMBER, email=FIXTURE_EMAIL)
        == user.fp_id
    )
    assert (
        identify(obc, phone_number=FIXTURE_PHONE_NUMBER2, email=FIXTURE_EMAIL)
        == user.fp_id
    )

    # Make sure the phone is still reported as verified since we copy the verification status
    data = dict(scope="onboarding", phone_number=FIXTURE_PHONE_NUMBER2)
    body = post("hosted/identify", data, obc.key, SandboxId(bifrost.sandbox_id))
    assert body["user"]["scrubbed_phone"] == "+1 (***) ***-**11"
    phone = next(i for i in body["user"]["auth_methods"] if i["kind"] == "phone")
    assert phone["is_verified"]

    # And can patch it again and verification status is still maintained
    data = {"id.phone_number": FIXTURE_PHONE_NUMBER}
    patch(f"users/{user.fp_id}/vault", data, sandbox_tenant.s_sk)
    data = dict(scope="onboarding", phone_number=FIXTURE_PHONE_NUMBER)
    body = post("hosted/identify", data, obc.key, SandboxId(bifrost.sandbox_id))
    assert body["user"]["scrubbed_phone"] == "+1 (***) ***-**00"
    phone = next(i for i in body["user"]["auth_methods"] if i["kind"] == "phone")
    assert phone["is_verified"]

    # Then, onboard this user onto a new playbook. This will log in using their unverified phone number
    bifrost = BifrostClient.inherit_user(investor_profile_ob_config, bifrost.sandbox_id)
    bifrost.run()
