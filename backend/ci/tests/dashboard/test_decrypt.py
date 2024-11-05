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


def test_tenant_decrypt_no_permissions(deprecated_missing_can_access_obc):
    bifrost = BifrostClient.new_user(deprecated_missing_can_access_obc)
    user = bifrost.run()
    tenant = deprecated_missing_can_access_obc.tenant
    data = {
        "fields": ["id.dob"],
        "reason": "Not doing a hecking decrypt",
    }
    body = post(f"entities/{user.fp_id}/vault/decrypt", data, tenant.sk.key)
    assert body["id.dob"] is None

    body = get(f"entities/{user.fp_id}", None, *tenant.db_auths)
    phone_number = next(i for i in body["data"] if i["identifier"] == "id.phone_number")
    assert phone_number["is_decryptable"]
    dob = next(i for i in body["data"] if i["identifier"] == "id.dob")
    assert not dob["is_decryptable"]


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
        ("document.drivers_license.front.image", "drivers_license.front.jpg"),
        ("document.drivers_license.back.image", "drivers_license.back.jpg"),
        ("document.drivers_license.selfie.image", "drivers_license.selfie.jpg"),
    ]
    for di, file_name in tests:
        assert compare_b64_contents(resp[di], file_name)

    assert resp["document.drivers_license.front.mime_type"] == "image/jpg"

    audit_event = latest_audit_event_for(user.fp_id, sandbox_tenant)
    assert audit_event["name"] == "decrypt_user_data"
    assert set(audit_event["detail"]["data"]["decrypted_fields"]) == {
        "document.drivers_license.front.image",
        "document.drivers_license.back.image",
        "document.drivers_license.selfie.image",
    }
