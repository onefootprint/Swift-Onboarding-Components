import pytest
from tests.headers import ExternalId, IdempotencyId
from tests.utils import (
    _gen_random_sandbox_id,
    post,
    delete,
    get,
    create_ob_config,
    _gen_random_ssn,
)
from tests.constants import EMAIL, FIXTURE_PHONE_NUMBER, ID_DATA


def test_idempotency_id(tenant, sandbox_tenant):
    idempotency_id = IdempotencyId(f"1234567890Aa._-{_gen_random_sandbox_id()}")
    body = post("users/", None, tenant.sk.key, idempotency_id)
    fp_id = body["id"]

    # When making vault with same idempotency id, should get same fp_id
    body = post("users/", None, tenant.sk.key, idempotency_id)
    assert body["id"] == fp_id

    # Cannot provide data alongside idempotency ID since result would be undefined
    data = {"id.dob": "1998-12-25"}
    post("users/", data, tenant.sk.key, idempotency_id, status_code=400)

    # Can use the same idempotency ID at another tenant to get a different vault
    body = post("users/", None, sandbox_tenant.sk.key, idempotency_id)
    assert body["id"] != fp_id

    invalid_idempotency_id = IdempotencyId("1234")
    post("users/", None, sandbox_tenant.sk.key, invalid_idempotency_id, status_code=400)

    invalid_idempotency_id = IdempotencyId("1234567890000!")
    post("users/", None, sandbox_tenant.sk.key, invalid_idempotency_id, status_code=400)


def test_external_id(tenant, sandbox_tenant):
    external_id = f"my_cus_id_{_gen_random_sandbox_id()}"
    body = post("users/", None, tenant.sk.key, ExternalId(external_id))
    fp_id = body["id"]
    assert body["external_id"] == external_id

    # test fetching the user by the external id
    body = get(f"users/?external_id={external_id}", None, tenant.sk.key)
    assert body["data"][0]["id"] == fp_id
    assert body["data"][0]["external_id"] == external_id

    # Can search in dashboard on external_id
    data = dict(external_id=external_id)
    body = post(f"entities/search", data, *tenant.db_auths)
    assert body["data"][0]["id"] == fp_id
    assert body["data"][0]["external_id"] == external_id

    # test no failure creating the same user
    body = post("users/", None, tenant.sk.key, ExternalId(external_id))
    assert body["id"] == fp_id
    assert body["external_id"] == external_id

    # Cannot provide data alongisde external ID since result would be undefined
    data = {"id.dob": "1998-12-25"}
    post("users/", data, tenant.sk.key, ExternalId(external_id), status_code=400)

    # Can use the same external ID at another tenant to get a different vault
    body = post("users/", None, sandbox_tenant.sk.key, ExternalId(external_id))
    assert body["id"] != fp_id

    invalid_id_too_short = ExternalId("1234")
    post("users/", None, sandbox_tenant.sk.key, invalid_id_too_short, status_code=400)


def test_create_with_external_id_after_deactivate(tenant, sandbox_tenant):
    idempotency_id = f"idempotency_id_{_gen_random_sandbox_id()}"
    external_id = f"my_cus_id_{_gen_random_sandbox_id()}"
    body_1 = post(
        "users/",
        None,
        tenant.sk.key,
        IdempotencyId(idempotency_id),
        ExternalId(external_id),
    )
    body_2 = post(
        "users/",
        None,
        tenant.sk.key,
        IdempotencyId(idempotency_id),
        ExternalId(external_id),
    )

    assert body_1["id"] == body_2["id"]
    assert body_1["external_id"] == body_2["external_id"] == external_id

    fp_id = body_1["id"]
    delete(f"users/{fp_id}", None, tenant.sk.key)

    # Reusing the same idempotency ID results in a 400 error.
    post(
        "users/",
        None,
        tenant.sk.key,
        IdempotencyId(idempotency_id),
        ExternalId(external_id),
        status_code=400,
    )

    # Using a new idempotency ID works.
    idempotency_id = f"idempotency_id_{_gen_random_sandbox_id()}"
    body_1 = post(
        "users/",
        None,
        tenant.sk.key,
        IdempotencyId(idempotency_id),
        ExternalId(external_id),
    )

    # Using no idempotency ID works.
    body_2 = post("users/", None, tenant.sk.key, ExternalId(external_id))
    assert body_1["id"] == body_2["id"]
    assert body_1["external_id"] == body_2["external_id"] == external_id


def test_kyc(
    sandbox_tenant,
    must_collect_data,
):
    obc = create_ob_config(
        sandbox_tenant,
        "Acme Bank Card",
        must_collect_data,
        must_collect_data,
    )
    # create NPV
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # run KYC
    data = dict(onboarding_config_key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key)

    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"

    # confirm OBD timeline event created
    timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # confirm we can still decrypt all fields
    data = {
        "fields": list(vault_data.keys()),
        "reason": "i wanna",
    }
    post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)


def test_kyc_missing_requirement(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Acme Bank Card",
        must_collect_data,
        must_collect_data,
    )
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    for di in ["id.first_name", "id.last_name", "id.ssn9"]:
        vault_data.pop(di)
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    data = dict(onboarding_config_key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=400)
    assert (
        body["error"]["message"]
        == "Cannot run kyc playbook due to unmet requirements. Missing name, ssn9. At a minimum, the following vault data must be provided: id.first_name, id.last_name, id.ssn9"
    )
    assert body["error"]["code"] == "T121"


def test_kyc_missing_derypt_perms(sandbox_tenant, must_collect_data, can_access_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Acme Bank Card",
        must_collect_data,
        can_access_data,
    )
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    data = dict(onboarding_config_key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=400)
    assert (
        body["error"]["message"]
        == "Cannot run a playbook whose authorized scopes don't include all collected data. The following fields need to be authorized for read access: dob"
    )
