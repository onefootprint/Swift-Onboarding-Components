import arrow
import pytest
from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import (
    get,
    post,
    post_raw,
    patch,
    patch_raw,
    delete_raw,
    _gen_random_str,
)
from tests.headers import ExternalId, FpAuth, VaultVersion


# TODO: remove once version_at is removed
def test_historical_decrypt_by_timestamp(sandbox_tenant):
    # Shift a little for clock skew
    start_time = arrow.now().shift(minutes=-1).isoformat()

    # Onboard onto a playbook as a fail - should show up
    bifrost1 = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost1.run()

    # Make a second onboarding
    data = dict(kind="onboard", key=sandbox_tenant.default_ob_config.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    token = FpAuth(body["token"])
    token = IdentifyClient.from_token(token).inherit()
    bifrost2 = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, token, bifrost1.sandbox_id
    )
    # Add new data during second onboarding
    new_data = {
        "id.first_name": "New name",
        "id.last_name": "New last name",
        "id.ssn9": "123431234",
    }
    patch("hosted/user/vault", new_data, bifrost2.auth_token)
    user = bifrost2.run()

    # Fetch the timestamps of each decision
    body = get(f"users/{user.fp_id}/decisions", None, sandbox_tenant.s_sk)
    decisions = body["data"]

    end_time = arrow.now().shift(minutes=1).isoformat()

    TESTS = [
        (None, new_data),
        (end_time, new_data),
        (decisions[0]["timestamp"], new_data),
        (decisions[1]["timestamp"], bifrost1.data),
        (start_time, {}),
    ]
    for i, (timestamp, expected_data) in enumerate(TESTS):
        fields = ["id.first_name", "id.last_name", "id.ssn9"]
        data = dict(version_at=timestamp, fields=fields, reason="Historical decrypt")
        body = post(f"users/{user.fp_id}/vault/decrypt", data, sandbox_tenant.s_sk)
        for k in fields:
            assert body[k] == expected_data.get(k, None)


# TODO: remove once version_at is removed
def test_historical_decrypt_validation(sandbox_tenant, sandbox_user):
    data = dict(
        version_at=arrow.now().isoformat(),
        fields=["id.first_name", "id.last_name:1234"],
        reason="Historical decrypt",
    )
    body = post(
        f"users/{sandbox_user.fp_id}/vault/decrypt",
        data,
        sandbox_tenant.s_sk,
        status_code=400,
    )
    assert body["message"] == "Conflicting version arguments given"


@pytest.mark.parametrize(
    "entity, di_1, di_2",
    [
        ("users", "id.first_name", "id.last_name"),
        ("businesses", "business.name", "business.dba"),
    ],
)
def test_versioned_decryption(sandbox_tenant, entity, di_1, di_2):
    # Creating a new user with data yields version 1
    resp = post_raw(
        f"{entity}",
        {
            di_1: "abc123",
        },
        sandbox_tenant.sk.key,
    )
    version = resp.headers["x-fp-vault-version"]
    fp_id = resp.json()["id"]
    assert version == "1"

    # Empty vault starts with version 0
    external_id = ExternalId(_gen_random_str(32))
    resp = post_raw(f"{entity}", None, sandbox_tenant.sk.key, external_id)
    version = resp.headers["x-fp-vault-version"]
    fp_id = resp.json()["id"]
    assert version == "0"

    def decrypt(fp_id, fields, version=None):
        dec = post(
            f"{entity}/{fp_id}/vault/decrypt",
            {
                "fields": fields,
                "reason": "Test",
            },
            sandbox_tenant.s_sk,
            *([VaultVersion(version)] if version is not None else []),
        )
        return dec

    def patch_data(fp_id, data):
        resp = patch_raw(
            f"{entity}/{fp_id}/vault",
            data,
            sandbox_tenant.s_sk,
        )
        return resp.json(), resp.headers[VaultVersion.HEADER_NAME]

    # Decrypting without a version yields no data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc"])
    assert dec == {
        di_1: None,
        di_2: None,
        "custom.abc": None,
    }

    # Decrypting with explicit version zero also yields no data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc"], version=0)
    assert dec == {
        di_1: None,
        di_2: None,
        "custom.abc": None,
    }

    # Add data to the vault
    _, version = patch_data(
        fp_id,
        {
            di_1: "John",
            "custom.abc": "1234",
        },
    )
    assert version == "1"

    # Patching with an empty payload yields the same version
    _, version = patch_data(
        fp_id,
        {},
    )
    assert version == "1"

    # Decrypting with version 1 yields the new data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc"], version=1)
    assert dec == {
        di_1: "John",
        di_2: None,
        "custom.abc": "1234",
    }

    # Decrypting with version 0 still yields no data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc"], version=0)
    assert dec == {
        di_1: None,
        di_2: None,
        "custom.abc": None,
    }

    # Add more data to the vault
    _, version = patch_data(
        fp_id,
        {
            di_2: "Doe",
            "custom.def": "5678",
        },
    )
    assert version == "2"

    # Decrypting with version 1 yields the old data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc", "custom.def"], version=1)
    assert dec == {
        di_1: "John",
        di_2: None,
        "custom.abc": "1234",
        "custom.def": None,
    }

    # Decrypting with version 2 yields the new data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc", "custom.def"], version=2)
    assert dec == {
        di_1: "John",
        di_2: "Doe",
        "custom.abc": "1234",
        "custom.def": "5678",
    }

    # Deactivating a DL yields a new version
    resp = delete_raw(
        f"{entity}/{fp_id}/vault",
        {
            "fields": [di_2, "custom.abc"],
        },
        sandbox_tenant.s_sk,
    )
    version = resp.headers["x-fp-vault-version"]
    assert version == "3"

    # Decrypting with version 3 yields the new data
    dec = post(
        f"{entity}/{fp_id}/vault/decrypt",
        {
            "fields": [di_1, di_2, "custom.abc", "custom.def"],
            "reason": "Test",
        },
        sandbox_tenant.s_sk,
        VaultVersion(3),
    )
    assert dec == {
        di_1: "John",
        di_2: None,
        "custom.abc": None,
        "custom.def": "5678",
    }

    # Decrypting with the implicit latest version yields the same data
    dec = decrypt(fp_id, [di_1, di_2, "custom.abc", "custom.def"])
    assert dec == {
        di_1: "John",
        di_2: None,
        "custom.abc": None,
        "custom.def": "5678",
    }

    # Re-creating the vault with the same external ID yields the latest version
    resp = post_raw(f"{entity}", None, sandbox_tenant.sk.key, external_id)
    version = resp.headers["x-fp-vault-version"]
    assert resp.json()["id"] == fp_id
    assert version == "3"
