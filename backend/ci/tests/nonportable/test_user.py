import pytest
from tests.headers import ExternalId, IdempotencyId
from tests.utils import (
    _gen_random_sandbox_id,
    post,
    get,
    create_ob_config,
    _gen_random_ssn,
)
from tests.constants import EMAIL, FIXTURE_PHONE_NUMBER, ID_DATA


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


def test_external_id(tenant, sandbox_tenant):
    external_id = f"my_cus_id_{_gen_random_sandbox_id()}"
    body = post("users/", None, tenant.sk.key, ExternalId(external_id))
    fp_id = body["id"]
    assert body["external_id"] == external_id

    # test fetching the user by the external id
    body = get(f"users/?external_id={external_id}", None, tenant.sk.key)
    print(body)
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


@pytest.mark.parametrize(
    "missing_can_access_data,missing_vault_data,expected_error",
    [
        ([], [], None),
        (["dob"], [], "Invalid onboarding configuration for Vault"),
        (
            [],
            ["id.ssn9"],
            "Unmet onboarding requirements: CollectData",
        ),  # TODO: these are not great user facing errors
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
        f"users/{fp_id}/kyc",
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
        *sandbox_tenant.db_auths,
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
