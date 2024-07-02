import pytest
from tests.constants import CUSTODIAN_AUTH, ENVIRONMENT
from tests.vault_dr.utils import *
from tests.utils import patch, post


@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_footprint_dr_backup(tenant):
    enroll_tenant_in_live_vdr(tenant)

    # Vault some data for backup.
    body = post("users", {
        "id.first_name": "billy",
        "id.last_name": "bob",
    }, tenant.sk.key)
    fp_id_1 = body["id"]

    body = patch(f"users/{fp_id_1}/vault", {
        "id.ssn9": "222222222",
    }, tenant.sk.key)

    body = post("users", {
        "id.first_name": "alice",
        "id.last_name": "wonderland",
    }, tenant.sk.key)
    fp_id_2 = body["id"]

    body = patch(f"users/{fp_id_2}/vault", {
        "id.ssn9": "333333333",
    }, tenant.sk.key)

    # Run the VDR batch.
    post("private/vault_dr/run_batch", {
        "tenant_id": tenant.id,
        "is_live": True,
        "batch_size": 100,
        "fp_ids": [fp_id_1, fp_id_2],
    }, CUSTODIAN_AUTH)

    # TODO: check that the backup worked using the footprint-dr client.
