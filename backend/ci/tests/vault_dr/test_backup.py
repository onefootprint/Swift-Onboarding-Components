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
        "id.phone_number": "+123121234",
    }, tenant.sk.key)

    body = post("users", {
        "id.first_name": "alice",
        "id.last_name": "wonderland",
    }, tenant.sk.key)
    fp_id_2 = body["id"]

    body = patch(f"users/{fp_id_2}/vault", {
        "id.phone_number": "+1234232345",
    }, tenant.sk.key)

    # Run the VDR batch.
    resp = post("private/vault_dr/run_batch", {
        "tenant_id": tenant.id,
        "is_live": True,
        "batch_size": 100,
        "fp_ids": [fp_id_1, fp_id_2],
    }, CUSTODIAN_AUTH)

    assert resp["num_blobs"] == 6


    with footprint_dr("status", "--live") as cmd:
        cmd.expect(r"Latest backup record timestamp: ([0-9:\.\- ]+ UTC)")

        # The latest online record timestamp should be the same as the latest backup record timestamp, indicating no lag
        ts = cmd.match.group(1).decode("utf-8")
        cmd.expect_exact("Latest online record timestamp: " + ts)

        cmd.expect("Lag: 0s")

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
