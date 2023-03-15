import pytest
from tests.dashboard.utils import latest_access_event_for
from tests.utils import create_ob_config
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import (
    get,
    post,
)
from tests.bifrost_client import BifrostClient, DocumentDataOptions


@pytest.fixture(scope="session")
def user_with_documents(sandbox_tenant, doc_request_sandbox_ob_config, twilio):
    """
    Create a user with registered data and webuathn creds and onboard them onto the document_requesting_tenant_session_scoped
    with document info as well
    """
    bifrost_client = BifrostClient(doc_request_sandbox_ob_config)
    bifrost_client.init_user_for_onboarding(
        twilio, document_data=DocumentDataOptions.front_back_selfie
    )
    return bifrost_client.onboard_user_onto_tenant(sandbox_tenant)


def test_tenant_decrypt(sandbox_user):
    tenant = sandbox_user.tenant
    expected_data = {
        "id.first_name": sandbox_user.first_name,
        "id.last_name": sandbox_user.last_name,
        "id.email": sandbox_user.email,
        "id.address_line1": sandbox_user.address_line1,
        "id.address_line2": sandbox_user.address_line2,
        "id.zip": sandbox_user.zip,
        "id.country": sandbox_user.country,
        "id.ssn9": sandbox_user.ssn,
        "id.ssn4": sandbox_user.ssn[-4:],
    }
    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "fields": attributes,
            "reason": "Doing a hecking decrypt",
        }
        body = post(
            f"users/{sandbox_user.fp_user_id}/vault/decrypt",
            data,
            tenant.sk.key,
        )
        attributes = body
        for attribute, value in attributes.items():
            assert expected_data[attribute] == value

        access_event = latest_access_event_for(sandbox_user.fp_user_id, tenant.sk)
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
        f"users/{sandbox_user.fp_user_id}/vault/decrypt",
        data,
        tenant.sk.key,
        # Uh oh - we should be checking ensure_scope_allows_access
        status_code=401,
    )


# A tenant needs to use /vault/identity/document/decrypt for decrypting identity document, so
# this fails
def test_tenant_decrypt_identity_doc_with_identity_endpoint(sandbox_user):
    tenant = sandbox_user.tenant
    data = {
        "fields": ["identity_document"],
        "reason": "Let me see the face of the man or woman who wronged me",
    }
    post(
        f"users/{sandbox_user.fp_user_id}/vault/decrypt",
        data,
        tenant.sk.key,
        status_code=400,
    )


#########################
# Decrypting Documents
#########################
# This sandbox_user has not authorized any access to identity documents for the tenant
def test_tenant_document_decrypt_no_permissions(sandbox_user):
    tenant = sandbox_user.tenant
    data = {
        "document_type": "passport",
        "reason": "Not doing a hecking decrypt",
    }
    # confirm they didn't auth identity_document
    get_user_resp = get(f"users/{sandbox_user.fp_user_id}", None, tenant.sk.key)
    assert not get_user_resp["onboarding"]["can_access_identity_document_images"]

    post(
        f"users/{sandbox_user.fp_user_id}/vault/identity/document/decrypt",
        data,
        tenant.sk.key,
        status_code=401,
    )


# This sandbox_user has not authorized any access to identity documents for the tenant, so they
# can't even see what's in the vault
def test_tenant_document_get_decrypt_no_permissions(sandbox_user):
    tenant = sandbox_user.tenant
    # confirm they didn't auth identity_document
    get_user_resp = get(f"users/{sandbox_user.fp_user_id}", None, tenant.sk.key)
    assert not get_user_resp["onboarding"]["can_access_identity_document_images"]

    get(
        f"users/{sandbox_user.fp_user_id}/vault/identity/document",
        None,
        tenant.sk.key,
        status_code=401,
    )


# Check which things are available in the vault
def test_tenant_document_get_decrypt(user_with_documents):
    tenant = user_with_documents.tenant
    resp = get(
        f"users/{user_with_documents.fp_user_id}/vault/identity/document",
        None,
        tenant.sk.key,
        status_code=200,
    )
    expected = {"passport": True}
    assert resp == expected


# Test decryption of vaulted documents
def test_tenant_document_decrypt(user_with_documents):
    from tests.image_fixtures import test_image

    tenant = user_with_documents.tenant
    requested_doc_type = "passport"
    data = {
        "document_type": requested_doc_type,
        "reason": "Responding to a customer request",
    }

    resp = post(
        f"users/{user_with_documents.fp_user_id}/vault/identity/document/decrypt",
        data,
        tenant.sk.key,
        status_code=200,
    )

    assert resp["document_type"] == requested_doc_type
    assert resp["images"][0]["front"] == test_image
    assert resp["images"][0]["back"] == test_image
    assert not resp["images"][0]["selfie"]

    access_event = latest_access_event_for(user_with_documents.fp_user_id, tenant.sk)
    assert set(access_event["targets"]) == {"id_document.passport"}


def test_tenant_selfie_decrypt(
    sandbox_tenant,
    must_collect_data,
    can_access_data,
    twilio,
):
    from tests.image_fixtures import test_image

    ob_conf_data = {
        "name": "Flerp Config",
        "must_collect_data": must_collect_data + ["document_and_selfie"],
        "can_access_data": can_access_data + ["document_and_selfie"],
    }
    ob_config = create_ob_config(sandbox_tenant.sk, ob_conf_data)

    bifrost_client = BifrostClient(ob_config)
    bifrost_client.init_user_for_onboarding(
        twilio,
        document_data=DocumentDataOptions.front_back_selfie,
    )
    user = bifrost_client.onboard_user_onto_tenant(sandbox_tenant)

    data = {
        "document_type": "passport",
        "reason": "Responding to a customer request",
        "include_selfie": True,
    }

    resp = post(
        f"users/{user.fp_user_id}/vault/identity/document/decrypt",
        data,
        sandbox_tenant.sk.key,
    )

    assert resp["document_type"] == "passport"
    assert resp["images"][0]["front"] == test_image
    assert resp["images"][0]["back"] == test_image
    assert resp["images"][0]["selfie"] == test_image

    access_event = latest_access_event_for(user.fp_user_id, sandbox_tenant.sk)
    assert set(access_event["targets"]) == {
        "id_document.passport",
        "selfie.passport",
    }
