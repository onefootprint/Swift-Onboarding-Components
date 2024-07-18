import pytest
from tests.constants import CUSTODIAN_AUTH, ENVIRONMENT
from tests.vault_dr.utils import *
from tests.utils import patch, post
import json


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
        "id.email": "abc123@onefootprint.com",
    }, tenant.sk.key)

    body = post("users", {
        "id.first_name": "alice",
        "id.last_name": "wonderland",
    }, tenant.sk.key)
    fp_id_2 = body["id"]

    body = patch(f"users/{fp_id_2}/vault", {
        "id.phone_number": "+1234232345",
    }, tenant.sk.key)

    # Updating the same data should create another blob.
    body = patch(f"users/{fp_id_2}/vault", {
        "id.phone_number": "+2222222222",
    }, tenant.sk.key)

    # Run the VDR batch.
    resp = post("private/vault_dr/run_batch", {
        "tenant_id": tenant.id,
        "is_live": True,
        "batch_size": 100,
        "fp_ids": [fp_id_1, fp_id_2],
    }, CUSTODIAN_AUTH)

    assert resp["num_blobs"] == 8

    with footprint_dr("status", "--live") as cmd:
        cmd.expect(r"Latest backup record timestamp: ([0-9:\.\- ]+ UTC)")
        # We can't actually assert anything about the backup lag
        # since we aren't running the real worker in the test,
        # and only processing DLs for the fp_ids we created.
        cmd.expect("Backup lag:")

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Test listing fp_ids.

    # --limit arg is required for sampling or paginating.
    with footprint_dr(
        "list-vaults", "--live",
        "--sample",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr(
        "list-vaults", "--live",
        "--fp-id-gt", fp_id_1
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Sampling doesn't work with --fp-id-gt.
    with footprint_dr(
        "list-vaults", "--live",
        "--sample",
        "--fp-id-gt", fp_id_1,
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # List all fp_ids.
    with footprint_dr("list-vaults", "--live") as cmd:
        cmd.expect_exact(min(fp_id_1, fp_id_2))
        cmd.expect_exact(max(fp_id_1, fp_id_2))
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # List just 10.
    with footprint_dr(
        "list-vaults", "--live",
        "--limit", "10",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert 2 <= cmd.before.count(b"\nfp_") <= 10

    # Check that each fp_id is present in the backup.
    for fp_id in [fp_id_1, fp_id_2]:
        with footprint_dr(
            "list-vaults", "--live",
            # Highly unlikely to be flaky unless there are multiple fp_ids that
            # match except for the lasst character
            "--fp-id-gt", fp_id[:-1],
            "--limit", "1",
        ) as cmd:
            cmd.expect_exact(fp_id)
            cmd.expect(pexpect.EOF)
        assert cmd.exitstatus == 0

    # Try sampling fp_ids.
    with footprint_dr(
        "list-vaults", "--live",
        "--sample",
        "--limit", "10",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert 2 <= cmd.before.count(b"\nfp_") <= 10

    # Ensure that --fp-id-gt works.
    # Test on the min so there is guaranteed to be at least one greater fp_id
    fp_id = min(fp_id_1, fp_id_2)
    with footprint_dr(
        "list-vaults", "--live",
        "--fp-id-gt", fp_id,
        "--limit", "10",
    ) as cmd:
        cmd.expect(r"fp_[A-Za-z0-9_]+")
        assert cmd.match.group(0).decode() > fp_id
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Test listing records.

    # --limit arg is required for sampling or paginating.
    with footprint_dr(
        "list-records", "--live",
        "--sample",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr(
        "list-records", "--live",
        "--fp-id-gt", fp_id_1
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Sampling doesn't work with --fp-id-gt.
    with footprint_dr(
        "list-vaults", "--live",
        "--sample",
        "--fp-id-gt", fp_id_1,
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # fp_id list doesn't work with sampling or pagination.
    with footprint_dr(
        "list-records", "--live",
        "--sample",
        "--limit", "10",
        fp_id_1, fp_id_2
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr(
        "list-records", "--live",
        "--fp-id-gt", fp_id_1,
        "--limit", "10",
        fp_id_1, fp_id_2
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # --limit doesn't work with fp_id list
    with footprint_dr(
        "list-records", "--live",
        "--limit", "10",
        fp_id_1, fp_id_2
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Fetch records for the two fp_ids.
    with footprint_dr(
        "list-records", "--live",
        fp_id_1, fp_id_2
    ) as cmd:
        expected_lines = [
            {
                "fp_id": fp_id_1,
                "fields": ["id.email", "id.first_name", "id.last_name", "id.phone_number"]
            },
            {
                "fp_id": fp_id_2,
                "fields": ["id.first_name", "id.last_name", "id.phone_number"]
            },
        ]

        for expected_line in expected_lines:
            cmd.expect(r"(^|\n){.+}\r")
            got_line = json.loads(cmd.match.group(0))
            assert got_line == expected_line, f"Got: {got_line} Want: {expected_line}"

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Fetch records for a sample.
    with footprint_dr(
        "list-records", "--live",
        "--sample", "--limit", "1",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Fetch records for a sample.
    with footprint_dr(
        "list-records", "--live",
        "--sample",
        "--limit", "10",
    ) as cmd:
        # There should be at least two fp_ids in the sample, one for each we created.
        cmd.expect(r"(^|\n){.+}\r")
        cmd.expect(r"(^|\n){.+}\r")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Ensure that --fp-id-gt works.
    # Test on the min so there is guaranteed to be at least one greater fp_id
    fp_id = min(fp_id_1, fp_id_2)
    with footprint_dr(
        "list-records", "--live",
        "--fp-id-gt", fp_id,
        "--limit", "10",
    ) as cmd:
        cmd.expect(r"(^|\n){.+}\r")
        assert json.loads(cmd.match.group(0))["fp_id"] > fp_id
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
