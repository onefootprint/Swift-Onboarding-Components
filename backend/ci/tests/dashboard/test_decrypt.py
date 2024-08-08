from tests.dashboard.utils import latest_audit_event_for
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import (
    get,
    post,
)
from tests.bifrost_client import BifrostClient
from tests.utils import compare_b64_contents, create_ob_config


def test_tenant_decrypt(sandbox_user):
    tenant = sandbox_user.tenant

    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "fields": attributes,
            "reason": "Doing a hecking decrypt",
        }
        body = post(
            f"entities/{sandbox_user.fp_id}/vault/decrypt",
            data,
            tenant.sk.key,
        )
        attributes = body
        for di, value in attributes.items():
            assert sandbox_user.client.decrypted_data[di] == value

        audit_event = latest_audit_event_for(sandbox_user.fp_id, tenant)
        assert audit_event["name"] == "decrypt_user_data"
        assert set(audit_event["detail"]["data"]["decrypted_fields"]) == set(attributes)


# Note: `sandbox_user` was onboarded onto `sandbox_user.tenant` with an ob configuration
# that required the collection of DOB, but not the access. See the pytest fixture setup for the tenant associated
# with sandbox_user passed into this function for more info
def test_tenant_decrypt_no_permissions(sandbox_user):
    tenant = sandbox_user.tenant
    data = {
        "fields": ["id.dob"],
        "reason": "Not doing a hecking decrypt",
    }
    body = post(
        f"entities/{sandbox_user.fp_id}/vault/decrypt",
        data,
        tenant.sk.key,
    )
    assert body["id.dob"] is None


#########################
# Decrypting Documents
#########################
# This sandbox_user has not authorized any access to identity documents for the tenant
def test_tenant_document_decrypt_no_permissions(sandbox_user):
    tenant = sandbox_user.tenant
    data = {
        "fields": ["id.dob"],
        "reason": "Not doing a hecking decrypt",
    }
    # confirm they didn't auth identity_document
    body = get(f"entities/{sandbox_user.fp_id}", None, *tenant.db_auths)
    assert not "id.dob" in body["decryptable_attributes"]

    body = post(
        f"users/{sandbox_user.fp_id}/vault/decrypt",
        data,
        tenant.sk.key,
    )
    assert body["id.dob"] is None


def test_tenant_image_decrypt(
    sandbox_tenant,
    doc_request_sandbox_ob_config,
):
    bifrost = BifrostClient.new_user(doc_request_sandbox_ob_config)
    user = bifrost.run()

    data = {
        "fields": [
            "document.drivers_license.front.image",
            "document.drivers_license.back.image",
            "document.drivers_license.selfie.image",
            "document.drivers_license.front.mime_type",
        ],
        "reason": "Responding to a customer request",
    }

    resp = post(
        f"users/{user.fp_id}/vault/decrypt",
        data,
        sandbox_tenant.sk.key,
    )

    tests = [
        ("document.drivers_license.front.image", "drivers_license.front.png"),
        ("document.drivers_license.back.image", "drivers_license.back.png"),
        ("document.drivers_license.selfie.image", "drivers_license.selfie.png"),
    ]
    for di, file_name in tests:
        assert compare_b64_contents(resp[di], file_name)

    assert resp["document.drivers_license.front.mime_type"] == "image/png"

    audit_event = latest_audit_event_for(user.fp_id, sandbox_tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == {
        "document.drivers_license.front.image",
        "document.drivers_license.back.image",
        "document.drivers_license.selfie.image",
    }


def test_decrypt_optional(sandbox_tenant):
    """
    Test that we can't decrypt fields that aren't in can_access
    """
    obc = create_ob_config(
        sandbox_tenant,
        "Doc request config",
        ["phone_number", "email", "name", "full_address"],
        ["phone_number"],
        optional_data=["ssn9"],
    )
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()

    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    phone_number = next(i for i in body["data"] if i["identifier"] == "id.phone_number")
    assert phone_number["is_decryptable"]
    email = next(i for i in body["data"] if i["identifier"] == "id.email")
    assert not email["is_decryptable"]
    ssn = next(i for i in body["data"] if i["identifier"] == "id.ssn9")
    assert not ssn["is_decryptable"]
