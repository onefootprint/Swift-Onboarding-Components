from tests.dashboard.utils import latest_access_event_for
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import (
    get,
    post,
)
from tests.bifrost_client import BifrostClient


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

        access_event = latest_access_event_for(sandbox_user.fp_id, tenant.sk)
        assert set(access_event["targets"]) == set(attributes)


# Note: `sandbox_user` was onboarded onto `sandbox_user.tenant` with an ob configuration
# that required the collection of DOB, but not the access. See the pytest fixture setup for the tenant associated
# with sandbox_user passed into this function for more info
def test_tenant_decrypt_no_permissions(sandbox_user):
    tenant = sandbox_user.tenant
    data = {
        "fields": ["id.dob"],
        "reason": "Not doing a hecking decrypt",
    }
    post(
        f"entities/{sandbox_user.fp_id}/vault/decrypt",
        data,
        tenant.sk.key,
        # Uh oh - we should be checking ensure_scope_allows_access
        status_code=401,
    )


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
    body = get(f"entities/{sandbox_user.fp_id}", None, tenant.sk.key)
    assert not "id.dob" in body["decryptable_attributes"]

    post(
        f"users/{sandbox_user.fp_id}/vault/decrypt",
        data,
        tenant.sk.key,
        status_code=401,
    )


def test_tenant_selfie_decrypt(
    sandbox_tenant,
    twilio,
    doc_request_sandbox_ob_config,
):
    from tests.image_fixtures import (
        test_image_dl_front,
        test_image_dl_back,
        test_image_dl_selfie,
    )

    bifrost = BifrostClient.new(doc_request_sandbox_ob_config, twilio)
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

    assert resp["document.drivers_license.front.image"] == test_image_dl_front
    assert resp["document.drivers_license.back.image"] == test_image_dl_back
    assert resp["document.drivers_license.selfie.image"] == test_image_dl_selfie
    assert resp["document.drivers_license.front.mime_type"] == "image/png"

    access_event = latest_access_event_for(user.fp_id, sandbox_tenant.sk)
    assert set(access_event["targets"]) == {
        "document.drivers_license.front.image",
        "document.drivers_license.back.image",
        "document.drivers_license.selfie.image",
    }
