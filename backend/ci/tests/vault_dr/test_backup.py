import pexpect
import pytest
import json
import base64
from tests.constants import (
    CUSTODIAN_AUTH,
    ENVIRONMENT,
    VDR_AGE_KEYS,
    FAKE_WRAPPED_RECOVERY_KEY_B64,
)
from tests.vault_dr.utils import (
    footprint_dr,
    new_org_identity_file,
    new_output_dir,
    new_records_file,
    validate_decrypted_data,
)
from tests.utils import file_contents, patch, patch_raw, post, post_raw, get, delete


FINAL_FP_ID_1_DATA = {
    "id.first_name": "billy",
    "id.last_name": "bob",
    "id.phone_number": "+123121234",
    "id.email": "abc123@onefootprint.com",
}

FINAL_FP_ID_2_DATA = {
    "id.first_name": "alice",
    "id.last_name": "wonderland",
    "id.phone_number": "+2222222222",
    "document.id_card.front.image": file_contents("drivers_license.front.png"),
    "document.id_card.front.latest_upload": file_contents("drivers_license.front.png"),
}

INVALID_API_ROOT = "http://127.0.0.1:123"


@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_footprint_dr_backup(tenant_and_live_vdr_cfg, tmp_path_factory):
    tenant, cfg = tenant_and_live_vdr_cfg

    expected_num_blobs = 0

    # Vault some data for backup.
    resp = post_raw(
        "users",
        {
            "id.first_name": FINAL_FP_ID_1_DATA["id.first_name"],
            "id.last_name": FINAL_FP_ID_1_DATA["id.last_name"],
        },
        tenant.sk.key,
    )
    fp_id_1 = resp.json()["id"]
    expected_num_blobs += 2
    fp_id_1_version = int(resp.headers["x-fp-vault-version"])
    assert fp_id_1_version == 1

    resp = patch_raw(
        f"users/{fp_id_1}/vault",
        {
            "id.phone_number": FINAL_FP_ID_1_DATA["id.phone_number"],
            "id.email": FINAL_FP_ID_1_DATA["id.email"],
        },
        tenant.sk.key,
    )
    expected_num_blobs += 2
    fp_id_1_version = int(resp.headers["x-fp-vault-version"])
    assert fp_id_1_version == 2

    resp = post_raw(
        "users",
        {
            "id.first_name": FINAL_FP_ID_2_DATA["id.first_name"],
            "id.last_name": FINAL_FP_ID_2_DATA["id.last_name"],
        },
        tenant.sk.key,
    )
    fp_id_2 = resp.json()["id"]
    expected_num_blobs += 2
    fp_id_2_version = int(resp.headers["x-fp-vault-version"])
    assert fp_id_2_version == 1

    resp = patch_raw(
        f"users/{fp_id_2}/vault",
        {
            # Write an initial phone number. We'll update it to the final value next.
            "id.phone_number": "+1234232345",
        },
        tenant.sk.key,
    )
    expected_num_blobs += 1
    fp_id_2_version = int(resp.headers["x-fp-vault-version"])
    assert fp_id_2_version == 2

    # Updating the same data should create another blob.
    resp = patch_raw(
        f"users/{fp_id_2}/vault",
        {
            "id.phone_number": FINAL_FP_ID_2_DATA["id.phone_number"],
        },
        tenant.sk.key,
    )
    expected_num_blobs += 1
    fp_id_2_version = int(resp.headers["x-fp-vault-version"])
    assert fp_id_2_version == 3

    # Upload a file.
    post(
        f"users/{fp_id_2}/vault/document.id_card.front.image/upload",
        None,
        tenant.sk.key,
        raw_data=FINAL_FP_ID_2_DATA["document.id_card.front.image"],
        addl_headers={"Content-Type": "image/png"},
    )
    # 1 for document.id_card.front.image + 1 for document.id_card.front.latest_upload
    expected_num_blobs += 2
    # FIXME: Uploads don't return vault version header.
    fp_id_2_version += 1

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
    assert resp["num_manifests"] == 2 + fp_id_1_version + fp_id_2_version

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
            # match except for the last character
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
            "version": fp_id_1_version,
            "fields": [
                "id.email",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        },
        {
            "fp_id": fp_id_2,
            "version": fp_id_2_version,
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
    records_to_decrypt = [
        {
            "fp_id": fp_id_1,
            "version": fp_id_1_version,
            "fields": [
                "id.email",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        },
        {
            "fp_id": fp_id_2,
            "version": fp_id_2_version,
            "fields": [
                "document.id_card.front.image",
                "document.id_card.front.latest_upload",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
                # Fields that don't exist are skipped.
                "custom.field_that_doesnt_exist",
            ],
        },
        {
            "fp_id": fp_id_2,
            # Decrypt an old version as well.
            "version": fp_id_2_version - 1,
            "fields": [
                "document.id_card.front.image",
                "document.id_card.front.latest_upload",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        },
    ]

    records_file = new_records_file(tmp_path_factory, records_to_decrypt)

    expected_data = {
        fp_id_1: {
            fp_id_1_version: FINAL_FP_ID_1_DATA,
        },
        fp_id_2: {
            fp_id_2_version: FINAL_FP_ID_2_DATA,
            (fp_id_2_version - 1): {
                field: value
                for field, value in FINAL_FP_ID_2_DATA.items()
                if not field.startswith("document.")
            },
        },
    }

    # Test decryption using the test API using each org identity.
    for i, org_identity in enumerate(
        [
            VDR_AGE_KEYS["1"]["private"],
            VDR_AGE_KEYS["2"]["private"],
        ]
    ):
        output_dir = new_output_dir(tmp_path_factory)
        org_identity_file = new_org_identity_file(tmp_path_factory, org_identity)

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

        validate_decrypted_data(output_dir, expected_data)

        # Check that we generated audit events for the test decryption.
        for record in expected_data:
            for fp_id, versions in expected_data.items():
                for version, fields in versions.items():
                    for field in fields.keys():
                        resp = get(
                            f"org/audit_events",
                            {
                                "names": "decrypt_user_data",
                                "search": fp_id,
                                "targets": field,
                            },
                            *tenant.db_auths,
                        )

                        vdr_events = [
                            event
                            for event in resp["data"]
                            if event["detail"]["data"]["reason"]
                            == "Disaster recovery test"
                        ]
                        # Comparing w/ >= since other VDR test events may be present.
                        assert len(vdr_events) >= i + 1

    # Testing full recovery isn't possible since there is no way to get the
    # wrapped recovery key via API (by design). We test as far as we can get
    # with an incorrect key wrapped with the correct org public keys.

    # This won't decrypt successfully, but we'll just test that we get a decrypt error.
    fake_wrapped_recovery_key = new_org_identity_file(
        tmp_path_factory,
        base64.b64decode(FAKE_WRAPPED_RECOVERY_KEY_B64).decode("utf-8"),
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

    # Attempt to decrypt for a vault version that doesn't exist.
    for bad_version in [-1, 0, 1000]:
        record_to_decrypt = {
            "fp_id": fp_id_1,
            "version": bad_version,
            "fields": [
                "id.email",
                "id.first_name",
                "id.last_name",
                "id.phone_number",
            ],
        }
        records_file = new_records_file(tmp_path_factory, [record_to_decrypt])
        output_dir = new_output_dir(tmp_path_factory)
        org_identity_file = new_org_identity_file(tmp_path_factory, org_identity)

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
            fp_id = record_to_decrypt["fp_id"]
            version = record_to_decrypt["version"]
            cmd.expect_exact(f"Vault version {version} not found for {fp_id}")
            cmd.expect(pexpect.EOF)
        assert cmd.exitstatus == 1


@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_vaults_without_data(tenant_and_live_vdr_cfg, tmp_path_factory):
    tenant, cfg = tenant_and_live_vdr_cfg

    # Create a vault with no data.
    resp = post(
        "users",
        {},
        tenant.sk.key,
    )
    fp_id = resp["id"]

    # Run the VDR batch.
    resp = post(
        "private/vault_dr/run_batch",
        {
            "tenant_id": tenant.id,
            "is_live": True,
            "blob_batch_size": 100,
            "manifest_batch_size": 100,
            "fp_ids": [fp_id],
        },
        CUSTODIAN_AUTH,
    )

    # Vaults created without data aren't present in VDR.
    # We might choose to reconsider this in the future.
    assert resp["num_blobs"] == 0
    assert resp["num_manifests"] == 0

    with footprint_dr("list-vaults", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert fp_id not in cmd.before.decode()

    # We can list records for the fp_id, but there are no record lines in the output.
    with footprint_dr("list-records", "--live", fp_id) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    assert '{"fp_id":' not in cmd.before.decode()

    # Write some data to the vault.
    patch(
        f"users/{fp_id}/vault",
        {
            "id.first_name": "first",
            "id.last_name": "last",
        },
        tenant.sk.key,
    )

    # Deactivate the data.
    delete(
        f"users/{fp_id}/vault",
        {
            "fields": ["id.first_name", "id.last_name"],
        },
        tenant.sk.key,
    )

    # Run the VDR batch again.
    # The data should be backed up even though it's no longer active.
    resp = post(
        "private/vault_dr/run_batch",
        {
            "tenant_id": tenant.id,
            "is_live": True,
            "blob_batch_size": 100,
            "manifest_batch_size": 100,
            "fp_ids": [fp_id],
        },
        CUSTODIAN_AUTH,
    )

    assert resp["num_blobs"] == 2
    assert resp["num_manifests"] == 3  # latest + 2 versions

    # The latest version (2) shows no fields.
    with footprint_dr("list-records", "--live", fp_id) as cmd:
        cmd.expect_exact('{"fp_id":"' + fp_id + '","version":2,"fields":[]}')
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Test decryption with no active fields.
    records_to_decrypt = [
        {"fp_id": fp_id, "version": 2, "fields": ["id.first_name"]},
    ]

    records_file = new_records_file(tmp_path_factory, records_to_decrypt)
    output_dir = new_output_dir(tmp_path_factory)
    org_identity_file = new_org_identity_file(
        tmp_path_factory, VDR_AGE_KEYS["1"]["private"]
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
    ) as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    expected_data = {
        fp_id: {
            2: {},
        },
    }
    validate_decrypted_data(output_dir, expected_data)
