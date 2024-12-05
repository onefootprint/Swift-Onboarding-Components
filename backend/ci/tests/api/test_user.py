import pytest
from tests.identify_client import IdentifyClient
from tests.constants import EMAIL, FIXTURE_PHONE_NUMBER, ID_DATA
from tests.headers import ExternalId, IdempotencyId, FpAuth
from tests.bifrost_client import BifrostClient
from tests.utils import (
    _gen_random_sandbox_id,
    post,
    delete,
    get,
    patch,
    create_ob_config,
    _gen_random_ssn,
    _gen_random_str,
    post_raw,
)


@pytest.fixture(scope="session")
def obc(sandbox_tenant, must_collect_data):
    return create_ob_config(sandbox_tenant, "Acme Bank Card", must_collect_data)


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


@pytest.mark.parametrize("url", ["users", "businesses"])
def test_update_external_id(sandbox_tenant, url):
    external_id1 = f"ext_id_{_gen_random_str(15)}"
    external_id2 = f"ext_id_{_gen_random_str(15)}"
    body = post(url, None, sandbox_tenant.s_sk, ExternalId(external_id1))
    fp_id1 = body["id"]
    assert body["external_id"] == external_id1

    body = post(url, None, sandbox_tenant.s_sk)
    assert not body["external_id"]
    fp_id2 = body["id"]
    assert fp_id2 != fp_id1

    # Can update the external ID after user is created
    body = patch(f"{url}/{fp_id2}", dict(external_id=external_id2), sandbox_tenant.s_sk)
    assert body["external_id"] == external_id2

    # External ID must use valid characters
    body = patch(
        f"{url}/{fp_id2}",
        dict(external_id="1234567890%!"),
        sandbox_tenant.s_sk,
        status_code=400,
    )
    assert (
        "External ID is invalid. Must only include alphanumeric characters, -, _, or ."
        in body["message"]
    )

    # Cannot update the external ID to conflict
    body = patch(
        f"{url}/{fp_id2}",
        dict(external_id=external_id1),
        sandbox_tenant.s_sk,
        status_code=400,
    )
    assert body["message"] == "User or business with this external ID already exists"


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


def test_kyc(sandbox_tenant, obc):
    # create NPV
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    resp = post_raw("users/", vault_data, sandbox_tenant.sk.key)
    create_version = resp.headers["x-fp-vault-version"]
    body = resp.json()
    fp_id = body["id"]

    # run KYC
    data = dict(key=obc.key.value)
    resp = post_raw(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key)
    kyc_version = resp.headers["x-fp-vault-version"]
    body = resp.json()

    assert create_version == kyc_version

    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"

    # confirm OBD timeline event created
    timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline["data"] if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

    # confirm we can still decrypt all fields
    data = {
        "fields": list(vault_data.keys()),
        "reason": "i wanna",
    }
    post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)


def test_kyc_stepup_link(sandbox_tenant, obc):
    """
    Run KYC on a user that triggers a stepup rule. We should generate a link that we can use to finish onboarding.
    """
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    sandbox_id = body["sandbox_id"]
    fp_id = body["id"]

    data = dict(
        key=obc.key.value, fixture_result="step_up", generate_link_on_stepup=True
    )
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key)
    assert body["status"] == "incomplete"

    auth_token = FpAuth(body["in_progress_link"]["token"])
    auth_token = IdentifyClient.from_token(auth_token).step_up()
    bifrost = BifrostClient.raw_auth(obc, auth_token, sandbox_id)
    user = bifrost.run()
    assert user.fp_id == fp_id
    # The `step_up` fixture result always ends in failure after the step up condition is met
    # https://github.com/onefootprint/monorepo/blob/bc04e7003b33393677b09462876008b05ab8e07e/backend/components/api/core/src/decision/state/kyc/states.rs#L593-L595
    assert bifrost.validate_response["user"]["status"] == "fail"
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_document",
        "process",
    ]


def test_kyc_missing_requirement(sandbox_tenant, obc):
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

    data = dict(key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=400)
    assert (
        body["message"]
        == "Cannot run kyc playbook due to unmet requirements. Missing name, ssn9. At a minimum, the following vault data must be provided: id.first_name, id.last_name, id.ssn9"
    )
    assert body["code"] == "T121"


def test_kyc_non_us_country_code(sandbox_tenant, obc):
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }

    vault_data["id.country"] = "CA"
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    data = dict(key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=400)
    assert body["message"] == "Validation error: Cannot trigger KYC on non-US addresses"


def test_kyc_missing_derypt_perms(sandbox_tenant, deprecated_missing_can_access_obc):
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users/", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # The default OBC has can access < must collect
    data = dict(key=deprecated_missing_can_access_obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=400)
    assert (
        body["message"]
        == "Cannot run a playbook whose authorized scopes don't include all collected data. The following fields need to be authorized for read access: dob"
    )


def test_force_redo_kyc(sandbox_tenant, obc):
    vault_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
        "id.ssn9": _gen_random_ssn(),
        **ID_DATA,
    }
    body = post("users", vault_data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # run KYC
    data = dict(key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key)
    assert body["requires_manual_review"] == False
    assert body["status"] == "pass"

    # Will re-run KYC by default
    data = dict(key=obc.key.value)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key)
    assert body["status"] == "pass"

    timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline["data"] if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2

    # Will error when trying to re-onboard to playbook if already onboarded onto
    data = dict(key=obc.key.value, force_reonboard=False)
    body = post(f"users/{fp_id}/kyc", data, sandbox_tenant.sk.key, status_code=409)
    assert body["code"] == "T122"
    assert body["message"] == "User has already started onboarding onto this playbook"
