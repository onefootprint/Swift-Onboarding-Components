# Testing common functionality between users and businesses.

import pytest
from tests.utils import (
    post_raw,
    patch_raw,
    _gen_random_str,
)
from tests.headers import ExternalId, FpAuth, VaultVersion


@pytest.mark.parametrize(
    "entity, di_1, di_2",
    [
        ("users", "id.first_name", "id.last_name"),
        ("businesses", "business.name", "business.dba"),
    ],
)
def test_new_entity_external_id(sandbox_tenant, entity, di_1, di_2):
    # Re-creating a vault with the same external ID yields the latest version number
    external_id = ExternalId(_gen_random_str(32))
    resp = post_raw(f"{entity}", None, sandbox_tenant.sk.key, external_id)
    version = resp.headers["x-fp-vault-version"]
    fp_id = resp.json()["id"]
    assert version == "0"

    resp = patch_raw(
        f"{entity}/{fp_id}/vault",
        {
            di_1: "abc",
            "custom.field": "123",
        },
        sandbox_tenant.s_sk,
    )
    version = resp.headers[VaultVersion.HEADER_NAME]
    assert version == "1"

    resp = post_raw(f"{entity}", None, sandbox_tenant.sk.key, external_id)
    version = resp.headers["x-fp-vault-version"]
    assert resp.json()["id"] == fp_id
    assert version == "1"
