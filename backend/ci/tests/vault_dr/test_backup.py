import pytest
import json
import base64
from tests.constants import (
    CUSTODIAN_AUTH,
    ENVIRONMENT,
    VDR_AGE_KEYS,
    FAKE_WRAPPED_RECOVERY_KEY_B64,
)
from tests.vault_dr.utils import *
from tests.utils import file_contents, patch, post, get


FP_ID_1_DATA = {
    "id.first_name": "billy",
    "id.last_name": "bob",
    "id.phone_number": "+123121234",
    "id.email": "abc123@onefootprint.com",
}

FP_ID_2_DATA = {
    "id.first_name": "alice",
    "id.last_name": "wonderland",
    "id.phone_number": "+2222222222",
}

INVALID_API_ROOT = "http://127.0.0.1:123"


@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_footprint_dr_backup(tenant, tmp_path):
    cfg = enroll_tenant_in_live_vdr(tenant)

    expected_num_blobs = 0
    expected_num_manifests = 0

    # Vault some data for backup.
    body = post(
        "users",
        {
            "id.first_name": FP_ID_1_DATA["id.first_name"],
            "id.last_name": FP_ID_1_DATA["id.last_name"],
        },
        tenant.sk.key,
    )
    fp_id_1 = body["id"]
    expected_num_blobs += 2
    expected_num_manifests += 1

    patch(
        f"users/{fp_id_1}/vault",
        {
            "id.phone_number": FP_ID_1_DATA["id.phone_number"],
            "id.email": FP_ID_1_DATA["id.email"],
        },
        tenant.sk.key,
    )
    expected_num_blobs += 2
    expected_num_manifests += 1

    body = post(
        "users",
        {
            "id.first_name": FP_ID_2_DATA["id.first_name"],
            "id.last_name": FP_ID_2_DATA["id.last_name"],
        },
        tenant.sk.key,
    )
    fp_id_2 = body["id"]
    expected_num_blobs += 2
    expected_num_manifests += 1

    patch(
        f"users/{fp_id_2}/vault",
        {
            "id.phone_number": "+1234232345",
        },
        tenant.sk.key,
    )
    expected_num_blobs += 1
    expected_num_manifests += 1

    # Updating the same data should create another blob.
    patch(
        f"users/{fp_id_2}/vault",
        {
            "id.phone_number": FP_ID_2_DATA["id.phone_number"],
        },
        tenant.sk.key,
    )
    expected_num_blobs += 1
    expected_num_manifests += 1

    # Upload a file.
    post(
        f"users/{fp_id_2}/vault/document.id_card.front.image/upload",
        None,
        tenant.sk.key,
        raw_data=file_contents("drivers_license.front.png"),
        addl_headers={"Content-Type": "image/png"},
    )
    # 1 for document.id_card.front.image + 1 for document.id_card.front.latest_upload
    expected_num_blobs += 2
    expected_num_manifests += 1

    # Run the VDR batch.
    resp = post(
        "private/vault_dr/run_batch",
        {
            "tenant_id": tenant.id,
            "is_live": True,
            "blob_batch_size": 100,
            "manifest_batch_size": 100,
            "fp_ids": [fp_id_1, fp_id_2],
        },
        CUSTODIAN_AUTH,
    )

    assert resp["num_blobs"] == expected_num_blobs
    # 2 manifest.latest.json + number of times we update vault data
    assert resp["num_manifests"] == 2 + expected_num_manifests

    with footprint_dr("status", "--live") as cmd:
        cmd.expect(r"Latest Backup Record Timestamp: ([0-9:\.\- ]+ UTC)")
        # We can't actually assert anything about the backup lag
        # since we aren't running the real worker in the test,
        # and only processing DLs for the fp_ids we created.
        cmd.expect("Backup lag:")

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Test listing fp_ids.

    # --limit arg is required for sampling or paginating.
    with footprint_dr(
        "list-vaults",
        "--live",
        "--sample",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr("list-vaults", "--live", "--fp-id-gt", fp_id_1) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Sampling doesn't work with --fp-id-gt.
    with footprint_dr(
        "list-vaults",
        "--live",
        "--sample",
        "--fp-id-gt",
        fp_id_1,
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
        "list-vaults",
        "--live",
        "--limit",
        "10",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert 2 <= cmd.before.count(b"\nfp_") <= 10

    # Listing records works without the API for recovery purposes.
    with footprint_dr(
        "list-vaults",
        "--live",
        "--limit",
        "10",
        "--bucket",
        cfg.s3_bucket_name,
        "--namespace",
        cfg.namespace,
        api_root=INVALID_API_ROOT,
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert 2 <= cmd.before.count(b"\nfp_") <= 10

    # Check that each fp_id is present in the backup.
    for fp_id in [fp_id_1, fp_id_2]:
        with footprint_dr(
            "list-vaults",
            "--live",
            # Highly unlikely to be flaky unless there are multiple fp_ids that
            # match except for the lasst character
            "--fp-id-gt",
            fp_id[:-1],
            "--limit",
            "1",
        ) as cmd:
            cmd.expect_exact(fp_id)
            cmd.expect(pexpect.EOF)
        assert cmd.exitstatus == 0

    # Try sampling fp_ids.
    with footprint_dr(
        "list-vaults",
        "--live",
        "--sample",
        "--limit",
        "10",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert 2 <= cmd.before.count(b"\nfp_") <= 10

    # Ensure that --fp-id-gt works.
    # Test on the min so there is guaranteed to be at least one greater fp_id
    fp_id = min(fp_id_1, fp_id_2)
    with footprint_dr(
        "list-vaults",
        "--live",
        "--fp-id-gt",
        fp_id,
        "--limit",
        "10",
    ) as cmd:
        cmd.expect(r"(fp_[A-Za-z0-9_]+)([\r\n]|$)")
        assert cmd.match.group(1).decode() > fp_id
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Test listing records.

    # --limit arg is required for sampling or paginating.
    with footprint_dr(
        "list-records",
        "--live",
        "--sample",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr("list-records", "--live", "--fp-id-gt", fp_id_1) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Sampling doesn't work with --fp-id-gt.
    with footprint_dr(
        "list-vaults",
        "--live",
        "--sample",
        "--fp-id-gt",
        fp_id_1,
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # fp_id list doesn't work with sampling or pagination.
    with footprint_dr(
        "list-records", "--live", "--sample", "--limit", "10", fp_id_1, fp_id_2
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
    with footprint_dr(
        "list-records",
        "--live",
        "--fp-id-gt",
        fp_id_1,
        "--limit",
        "10",
        fp_id_1,
        fp_id_2,
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # --limit doesn't work with fp_id list
    with footprint_dr(
        "list-records", "--live", "--limit", "10", fp_id_1, fp_id_2
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Fetch records for the two fp_ids.
    fp_id_records = [
        {
            "fp_id": fp_id_1,
            "fields": [
                "id.email",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        },
        {
            "fp_id": fp_id_2,
            "fields": [
                "document.id_card.front.image",
                "document.id_card.front.latest_upload",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        },
    ]

    with footprint_dr("list-records", "--live", fp_id_1, fp_id_2) as cmd:
        for expected_line in fp_id_records:
            cmd.expect(r"([\r\n]|^){.+}([\r\n]|$)")
            got_line = json.loads(cmd.match.group(0))
            assert got_line == expected_line, f"Got: {got_line} Want: {expected_line}"

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Fetching records works without the API for recovery purposes.
    with footprint_dr(
        "list-records",
        "--live",
        "--bucket",
        cfg.s3_bucket_name,
        "--namespace",
        cfg.namespace,
        fp_id_1,
        fp_id_2,
        api_root=INVALID_API_ROOT,
    ) as cmd:
        for expected_line in fp_id_records:
            cmd.expect(r"([\r\n]|^){.+}([\r\n]|$)")
            got_line = json.loads(cmd.match.group(0))
            assert got_line == expected_line, f"Got: {got_line} Want: {expected_line}"

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Fetch records for a sample.
    with footprint_dr(
        "list-records",
        "--live",
        "--sample",
        "--limit",
        "1",
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Fetch records for a sample.
    with footprint_dr(
        "list-records",
        "--live",
        "--sample",
        "--limit",
        "10",
    ) as cmd:
        # There should be at least two fp_ids in the sample, one for each we created.
        cmd.expect(r"([\r\n]|^){.+}([\r\n]|$)")
        cmd.expect(r"([\r\n]|^){.+}([\r\n]|$)")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Ensure that --fp-id-gt works.
    # Test on the min so there is guaranteed to be at least one greater fp_id
    fp_id = min(fp_id_1, fp_id_2)
    with footprint_dr(
        "list-records",
        "--live",
        "--fp-id-gt",
        fp_id,
        "--limit",
        "10",
    ) as cmd:
        cmd.expect(r"([\r\n]|^){.+}([\r\n]|$)")
        assert json.loads(cmd.match.group(0))["fp_id"] > fp_id
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Set up to test decryption.
    records_file = tmp_path / "records.jsonl"
    with records_file.open("w") as f:
        for record in fp_id_records:
            json.dump(record, f)
            f.write("\n")

            # Include some extra whitespace to test that it's ignored.
            f.write("   \n")

    expected_data = {
        fp_id_1: FP_ID_1_DATA,
        fp_id_2: FP_ID_2_DATA,
    }

    # Test decryption using the test API using each org identity.
    for i, org_identity in enumerate(
        [
            VDR_AGE_KEYS["1"]["private"],
            VDR_AGE_KEYS["2"]["private"],
        ]
    ):
        output_dir = tmp_path / f"pii_test_{i}"
        output_dir.mkdir()

        org_identity_file = tmp_path / "org_identity.txt"
        org_identity_file.write_text(org_identity)

        with footprint_dr(
            "decrypt",
            "--live",
            "--records",
            str(records_file),
            "--org-identity",
            str(org_identity_file),
            "--output-dir",
            str(output_dir),
        ) as cmd:
            cmd.expect(pexpect.EOF)
        assert cmd.exitstatus == 0

        validate_decrypted_data(output_dir, fp_id_records, expected_data)

        # Check that we generated audit events for the test decryption.
        for record in fp_id_records:
            fp_id = record["fp_id"]
            for field in record["fields"]:
                resp = get(
                    f"org/audit_events",
                    {"names": "decrypt_user_data", "search": fp_id, "targets": field},
                    *tenant.db_auths,
                )

                vdr_events = [
                    event
                    for event in resp["data"]
                    if event["detail"]["data"]["reason"] == "Disaster recovery test"
                ]
                # Comparing w/ >= since other VDR test events may be present.
                assert len(vdr_events) >= i + 1

    # Testing full recovery isn't possible since there is no way to get the
    # wrapped recovery key via API (by design). We test as far as we can get
    # with an incorrect key wrapped with the correct org public keys.

    # This won't decrypt successfully, but we'll just test that we get a decrypt error.
    fake_wrapped_recovery_key = tmp_path / "fake_wrapped_recovery_key.age"
    fake_wrapped_recovery_key.write_text(
        base64.b64decode(FAKE_WRAPPED_RECOVERY_KEY_B64).decode("utf-8")
    )

    with footprint_dr(
        "decrypt",
        "--live",
        "--records",
        str(records_file),
        "--org-identity",
        str(org_identity_file),
        "--output-dir",
        str(output_dir),
        "--bucket",
        cfg.s3_bucket_name,
        "--namespace",
        cfg.namespace,
        "--wrapped-recovery-key",
        str(fake_wrapped_recovery_key),
        # Use an invalid API root to ensure there's no dependency on the API.
        api_root=INVALID_API_ROOT,
    ) as cmd:
        # The filename in the error message indicates we accessed the S3 bucket
        # without talking to the API.
        cmd.expect_exact(
            f"Error: failed to decrypt record footprint/vdr/{cfg.namespace}/fp_"
        )
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1


def validate_decrypted_data(output_dir, fp_id_records, expected_data):
    for record in fp_id_records:
        fp_id = record["fp_id"]

        for field in record["fields"]:
            path = output_dir / fp_id / field
            assert path.exists(), f"Missing path: {path}"

            pii_file = list(path.iterdir())
            assert len(pii_file) == 1
            pii_file = pii_file[0]

            if field in [
                "document.id_card.front.image",
                "document.id_card.front.latest_upload",
            ]:
                assert pii_file.name == "document.png"

                got_data = pii_file.read_bytes()
                assert got_data == file_contents("drivers_license.front.png")
            else:
                assert pii_file.name == "value.txt"

                got_data = pii_file.read_text()

                # HACK: Until we implement manifests in the S3 file layout,
                # there is a race condition where either the first or second
                # phone number may be returned if they are written with the
                # same second-granularity timestamp.
                #
                # The manifest file will solve this since the latest manifest
                # will point to a consistent snapshot of the data.
                if field == "id.phone_number":
                    assert (
                        got_data == expected_data[fp_id][field]
                        or got_data == "+1234232345"
                    )
                else:
                    assert got_data == expected_data[fp_id][field]
