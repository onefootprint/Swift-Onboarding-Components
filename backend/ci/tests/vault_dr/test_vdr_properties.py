from collections import defaultdict
from datetime import timedelta
import json
import pexpect
import pytest
from hypothesis import (
    strategies as st,
    settings,
    assume,
    note,
    reproduce_failure,
)
from hypothesis.strategies import composite
from hypothesis.stateful import (
    RuleBasedStateMachine,
    Bundle,
    rule,
    precondition,
    invariant,
    initialize,
    run_state_machine_as_test,
    multiple,
)

from tests.utils import post, post_raw, patch_raw, delete_raw
from tests.constants import (
    CUSTODIAN_AUTH,
    ENVIRONMENT,
    VDR_AGE_KEYS,
)
from tests.vault_dr.utils import (
    footprint_dr,
    new_org_identity_file,
    new_output_dir,
    new_records_file,
    validate_decrypted_data,
)


"""
This test suite compares the behavior of Vault Disaster Recovery against the
ideal behavior of a hash map representing vault data over randomly generated
states.
"""


def new_vdr_state_machine(tenant, cfg, tmp_path_factory, enable_backfill=False):
    def fast_footprint_dr(*args, **kwargs):
        # Attempts to avoid extraneous validation calls.
        # Also passes the API key directly to avoid using the keychain.
        return footprint_dr(
            *args,
            f"--bucket={cfg.s3_bucket_name}",
            f"--namespace={cfg.namespace}",
            api_key=tenant.l_sk.value,
            skip_client_checks=True,
            # Debug is a little noisy for these tests.
            log_level="info",
            **kwargs,
        )

    num_fp_ids_initialized_with_data = 1
    num_fp_ids_initialized_without_data = 1
    num_fp_ids = num_fp_ids_initialized_with_data + num_fp_ids_initialized_without_data

    num_pii_values = 2
    num_dis = 2

    # Varying the vaulted DIs and PII isn't that interesting, so we share values for the run.
    all_pii = [f"pii_🐧_{i}" for i in range(num_pii_values)]
    all_dis = [f"custom.field_{i}" for i in range(num_dis)]

    STATE_INIT = "STATE_INIT"
    STATE_UPDATE = "STATE_UPDATE"
    STATE_DELETE = "STATE_DELETE"
    STATE_RUN_VDR_BATCH = "STATE_RUN_VDR_BATCH"
    STATE_DB_BACKFILL = "STATE_DB_BACKFILL"

    # Add @reproduce_failure decorator here, if needed.
    class VdrStateMachine(RuleBasedStateMachine):
        all_fp_ids = Bundle("all_fp_ids")
        fp_ids_with_data = Bundle("fp_ids_with_data")

        def __init__(self):
            super().__init__()

            # Maps fp_id -> version -> di -> value
            self.expected_vault_data: dict[str, dict[int, dict[str, str]]] = {}

            self.last_state = STATE_INIT
            self.has_run_vdr_batch = False

        @initialize(target=all_fp_ids)
        def init_fp_ids_without_data(self):
            fp_ids = []
            for i in range(num_fp_ids_initialized_without_data):
                fp_id = self.new_fp_id(False)
                fp_ids.append(fp_id)

            return multiple(*fp_ids)

        @initialize(targets=(all_fp_ids, fp_ids_with_data))
        def init_fp_ids_with_data(self):
            fp_ids = []
            for i in range(num_fp_ids_initialized_with_data):
                fp_id = self.new_fp_id(True)
                fp_ids.append(fp_id)

            return multiple(*fp_ids)

        def new_fp_id(self, init_with_data):
            initial_data = {}
            if init_with_data:
                initial_data = {
                    "custom.some_field": all_pii[0],
                    all_dis[0]: "def456",
                }

            resp = post_raw(
                "users",
                initial_data,
                tenant.sk.key,
            )
            fp_id = resp.json()["id"]

            initial_version = int(resp.headers["x-fp-vault-version"])

            assert initial_version == (1 if init_with_data else 0)
            if initial_version == 0:
                # Don't store empty version 0. This makes assertions a bit simpler.
                self.expected_vault_data[fp_id] = {}
            else:
                self.expected_vault_data[fp_id] = {
                    initial_version: initial_data,
                }

            note(f"Initial data for {fp_id}: {initial_data}")

            return fp_id

        @rule(
            fp_id=all_fp_ids,
            target=fp_ids_with_data,
            data=st.dictionaries(
                st.sampled_from(all_dis), st.sampled_from(all_pii), min_size=1
            ),
        )
        def update(self, fp_id, data):
            self.last_state = STATE_UPDATE

            note(f"Updating {fp_id} with {data}")

            resp = patch_raw(
                f"users/{fp_id}/vault",
                data,
                tenant.sk.key,
            )
            new_version = int(resp.headers["x-fp-vault-version"])

            new_fp_ids_with_data = []
            if new_version == 1:
                new_fp_ids_with_data.append(fp_id)

            old_data = (
                self.expected_vault_data[fp_id][new_version - 1]
                if new_version > 1
                else {}
            )
            new_data = old_data.copy() | data
            self.expected_vault_data[fp_id][new_version] = new_data

            note(f"Post-update vault data: {self.expected_vault_data}")

            return multiple(*new_fp_ids_with_data)

        @rule(fp_id=fp_ids_with_data, data=st.data())
        def delete(self, fp_id, data):
            self.last_state = STATE_DELETE

            existing_version = max(self.expected_vault_data[fp_id].keys())
            existing_dis = sorted(
                self.expected_vault_data[fp_id][existing_version].keys()
            )
            # Filter out no-op deletes, since they don't change the state.
            assume(len(existing_dis) > 0)

            dis = data.draw(
                st.lists(st.sampled_from(existing_dis), unique=True, min_size=1)
            )

            note(f"Deleting fields {dis} from {fp_id}")

            resp = delete_raw(
                f"users/{fp_id}/vault",
                {"fields": dis},
                tenant.sk.key,
            )
            new_version = int(resp.headers["x-fp-vault-version"])
            assert new_version == existing_version + 1

            new_data = self.expected_vault_data[fp_id][existing_version].copy()
            for di in dis:
                new_data.pop(di)

            self.expected_vault_data[fp_id][new_version] = new_data

            note(f"Post-delete vault data: {self.expected_vault_data}")

        @rule(fp_id=fp_ids_with_data)
        @precondition(lambda self: enable_backfill and self.has_run_vdr_batch)
        def db_backfill(self, fp_id):
            self.last_state = STATE_DB_BACKFILL

            # Delete an arbitrary vault_dr_blob and mark impacted scoped vault
            # versions as not backed up. Simulates a DB backfill that results in
            # VDR needing to backfill.
            post(
                f"private/vault_dr/test_backfill",
                [fp_id],
                CUSTODIAN_AUTH,
            )

        def num_scoped_vault_versions(self):
            return sum(
                max(fp_id_versions.keys())
                for fp_id_versions in self.expected_vault_data.values()
                if len(fp_id_versions) > 0
            )

        def max_num_blobs(self):
            return self.num_scoped_vault_versions() * len(all_dis)

        def fp_ids(self):
            return list(self.expected_vault_data.keys())

        def vdr_run_batch(self, manifest_batch_size, blob_batch_size):
            req = {
                "tenant_id": tenant.id,
                "is_live": True,
                "manifest_batch_size": manifest_batch_size,
                "blob_batch_size": blob_batch_size,
                "fp_ids": self.fp_ids(),
                "skip_client_validation": True,
            }
            note(f"Batch request: {req}")

            resp = post(
                "private/vault_dr/run_batch",
                req,
                CUSTODIAN_AUTH,
            )
            note(f"Batch result: {resp}")
            return resp

        @rule()
        @precondition(
            lambda self: self.last_state not in (STATE_INIT, STATE_RUN_VDR_BATCH)
        )
        def run_vdr_batch(self):
            self.last_state = STATE_RUN_VDR_BATCH

            manifest_batch_size = self.num_scoped_vault_versions()
            assume(manifest_batch_size > 0)

            blob_batch_size = self.max_num_blobs()
            assume(blob_batch_size > 0)

            resp = self.vdr_run_batch(manifest_batch_size, blob_batch_size)
            assert resp["num_manifests"] > 0

            self.has_run_vdr_batch = True

        @invariant()
        @precondition(lambda self: self.last_state == STATE_RUN_VDR_BATCH)
        def check_vdr_matches_ground_truth(self):
            # list-vaults is not super interesting for this test since it has
            # relaxed consistency guarantees compared to listing records and
            # decrypting data. Also, it requires a lot of S3 calls for
            # partition iteration.

            with fast_footprint_dr(
                "list-records",
                "--live",
                *self.fp_ids(),
            ) as cmd:
                cmd.expect(pexpect.EOF)
            output = cmd.before.decode("utf-8")
            note(output)
            assert cmd.exitstatus == 0

            first_record_start = output.index('{"fp_id":')
            lines = output[first_record_start:].strip().split("\n")
            records = [
                json.loads(line) for line in lines if line.startswith('{"fp_id":')
            ]

            # Check that list-records returns the latest records for each fp_id.
            for record in records:
                fp_id = record["fp_id"]
                version = record["version"]

                assert (
                    record["fp_id"] in self.expected_vault_data
                ), "fp_id in footprint-dr list-records not found in ground truth"
                assert (
                    version in self.expected_vault_data[fp_id]
                ), "vault version in footprint-dr list-records not found in ground truth"
                assert sorted(record["fields"]) == sorted(
                    self.expected_vault_data[fp_id][version].keys()
                )

                # This is only true if the VDR batch runs to completion.
                assert version == max(
                    self.expected_vault_data[fp_id].keys()
                ), "vault version from footprint-dr list-records is not the latest version"

            # Decrypt all past versions of the data.
            records_to_decrypt = []
            for fp_id, versions in self.expected_vault_data.items():
                for version, data in versions.items():
                    records_to_decrypt.append(
                        {
                            "fp_id": fp_id,
                            "version": version,
                            "fields": list(data.keys()),
                        }
                    )

            note(f"Decrypting {records_to_decrypt}")

            records_file = new_records_file(tmp_path_factory, records_to_decrypt)
            org_identity_file = new_org_identity_file(
                tmp_path_factory, VDR_AGE_KEYS["1"]["private"]
            )
            output_dir = new_output_dir(tmp_path_factory)

            with fast_footprint_dr(
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

            validate_decrypted_data(output_dir, self.expected_vault_data)

        def teardown(self):
            # Ensure we finish with a VDR batch run & check.
            if self.last_state not in (STATE_INIT, STATE_RUN_VDR_BATCH):
                manifest_batch_size = self.num_scoped_vault_versions()
                blob_batch_size = self.max_num_blobs()
                self.vdr_run_batch(manifest_batch_size, blob_batch_size)
                self.check_vdr_matches_ground_truth()

    return VdrStateMachine


@pytest.mark.vault_dr_acceptance
@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_vdr_properties(tenant_and_live_vdr_cfg, tmp_path_factory):
    tenant, cfg = tenant_and_live_vdr_cfg
    state_machine = new_vdr_state_machine(
        tenant, cfg, tmp_path_factory, enable_backfill=True
    )

    run_state_machine_as_test(
        state_machine,
        settings=settings(
            max_examples=200,
            # Max search depth.
            # Note that both @initialize and @rule count toward this limit.
            stateful_step_count=10,
            deadline=timedelta(seconds=5),
            print_blob=True,
        ),
    )
