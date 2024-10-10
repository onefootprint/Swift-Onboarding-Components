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


def new_vdr_state_machine(tenant, cfg, tmp_path_factory):
    def fast_footprint_dr(*args, **kwargs):
        # Attempts to avoid extraneous validation calls.
        # Also passes the API key directly to avoid using the keychain.
        return footprint_dr(
            *args,
            f"--bucket={cfg.s3_bucket_name}",
            f"--namespace={cfg.namespace}",
            api_key=tenant.l_sk.value,
            skip_client_checks=True,
            **kwargs,
        )

    num_fp_ids = 2
    num_pii_values = 2
    num_dis = 2

    # Varying the vaulted DIs and PII isn't that interesting, so we share values for the run.
    all_pii = [f"pii_🐧_{i}" for i in range(num_pii_values)]
    all_dis = [f"custom.field_{i}" for i in range(num_dis)]

    # Add @reproduce_failure decorator here, if needed.
    class VdrStateMachine(RuleBasedStateMachine):
        all_fp_ids = Bundle("all_fp_ids")

        @initialize(target=all_fp_ids)
        def init(self):
            # Maps fp_id -> version -> di -> value
            self.expected_vault_data: dict[str, dict[int, dict[str, str]]] = {}

            self.last_state_is_vdr_run_batch = False

            fp_ids = []
            for i in range(num_fp_ids):
                create_with_data = i == 0

                initial_data = {}
                if create_with_data:
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
                fp_ids.append(fp_id)

                initial_version = int(resp.headers["x-fp-vault-version"])
                assert initial_version == (1 if create_with_data else 0)
                if initial_version == 0:
                    # Don't store empty version 0. This makes assertions a bit simpler.
                    self.expected_vault_data[fp_id] = {}
                else:
                    self.expected_vault_data[fp_id] = {
                        initial_version: initial_data,
                    }

            note(f"Initial vault data: {self.expected_vault_data}")

            return multiple(*fp_ids)

        @rule(
            fp_id=all_fp_ids,
            data=st.dictionaries(
                st.sampled_from(all_dis), st.sampled_from(all_pii), min_size=1
            ),
        )
        def update(self, fp_id, data):
            note(f"Updating {fp_id} with {data}")

            resp = patch_raw(
                f"users/{fp_id}/vault",
                data,
                tenant.sk.key,
            )
            new_version = int(resp.headers["x-fp-vault-version"])

            old_data = (
                self.expected_vault_data[fp_id][new_version - 1]
                if new_version > 1
                else {}
            )
            new_data = old_data.copy() | data
            self.expected_vault_data[fp_id][new_version] = new_data

            note(f"Post-update vault data: {self.expected_vault_data}")
            self.last_state_is_vdr_run_batch = False

        @rule(fp_id=all_fp_ids, data=st.data())
        def delete(self, fp_id, data):
            # Filter out deletes on vaults with no writes.
            assume(len(self.expected_vault_data[fp_id]) > 0)
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
            self.last_state_is_vdr_run_batch = False

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

        def run_vdr_run_batch(self, manifest_batch_size, blob_batch_size):
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
            assert resp["num_manifests"] > 0

        @rule()
        @precondition(lambda self: not self.last_state_is_vdr_run_batch)
        def run_complete_vdr_run_batch(self):
            manifest_batch_size = self.num_scoped_vault_versions()
            assume(manifest_batch_size > 0)

            blob_batch_size = self.max_num_blobs()
            assume(blob_batch_size > 0)

            self.run_vdr_run_batch(manifest_batch_size, blob_batch_size)
            self.last_state_is_vdr_run_batch = True

        @invariant()
        @precondition(lambda self: self.last_state_is_vdr_run_batch)
        def vdr_matches_ground_truth(self):
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

    return VdrStateMachine


@pytest.mark.vault_dr_acceptance
@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_vdr_properties(tenant_and_live_vdr_cfg, tmp_path_factory):
    tenant, cfg = tenant_and_live_vdr_cfg
    state = new_vdr_state_machine(tenant, cfg, tmp_path_factory)

    run_state_machine_as_test(
        state,
        settings=settings(
            max_examples=100,
            stateful_step_count=6,  # Max search depth
            print_blob=True,
        ),
    )
