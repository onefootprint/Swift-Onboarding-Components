#!/usr/bin/env python3

import functools
import hashlib
import base64
import json
import subprocess
import requests
from requests.auth import HTTPBasicAuth
import os
import tempfile
import multiprocessing as mp
import string
import tqdm

API_URL = os.environ.get("FOOTPRINT_API_ROOT", "https://api.onefootprint.com")
API_KEY = os.environ["FOOTPRINT_API_KEY"]
WRAPPED_RECOVERY_KEY_FILE = os.environ["FOOTPRINT_WRAPPED_RECOVERY_KEY_FILE"]
MODE = "--sandbox" if API_KEY.startswith("sk_test_") else "--live"

session = requests.Session()
session.auth = HTTPBasicAuth(API_KEY, "")

fp_id_alphabet = string.ascii_lowercase + string.digits


def fp_id_partitions():
    ret = []
    for prefix in ["fp_id_", "fp_id_test_", "fp_bid_", "fp_bid_test_"]:
        for c1 in fp_id_alphabet:
            for c2 in fp_id_alphabet:
                ret.append(prefix + c1 + c2)
    return ret


def partition_for_fp_id(fp_id):
    parts = fp_id.split("_")
    prefix = "_".join(parts[:-1])
    suffix = parts[-1]
    return "{}_{}".format(prefix, suffix[:2])


def footprint_dr(*args, capture=True):
    print("Running: footprint-dr", " ".join(args))
    if capture:
        return subprocess.check_output(
            ["footprint-dr", *args],
            env=os.environ,
            text=True,
        )
    else:
        subprocess.run(["footprint-dr", *args], env=os.environ)


def get_bucket_namespace():
    status = footprint_dr("status", MODE)
    print(status)

    status_lines = status.splitlines()

    bucket_line = next(line for line in status_lines if "S3 Bucket Name:" in line)
    bucket = bucket_line.split()[-1]
    namespace_line = next(line for line in status_lines if "Namespace:" in line)
    namespace = namespace_line.split()[-1]

    return (bucket, namespace)


def vdr_list_all_records(partition, bucket, namespace):
    cursor = partition + "0000"
    while True:
        cursor_args = ["--fp-id-gt", cursor] if cursor else []
        out = footprint_dr(
            "list-records",
            MODE,
            "--bucket",
            bucket,
            "--namespace",
            namespace,
            "--limit",
            "1000",
            *cursor_args,
        )

        lines = out.splitlines()
        if not lines:
            break

        for line in lines:
            record = json.loads(line)
            fp_id = record["fp_id"]
            if partition_for_fp_id(fp_id) != partition:
                return
            yield record
            cursor = fp_id


def vdr_download_all_records(args):
    partition, bucket, namespace, data_dir = args
    vdr_records_file = os.path.join(data_dir, f"vdr_records.{partition}.jsonl")
    if os.path.exists(vdr_records_file):
        print(f"VDR records already downloaded to {vdr_records_file}")
        return vdr_records_file

    vdr_records_file_tmp = os.path.join(data_dir, f"vdr_records.{partition}.jsonl.tmp")
    with open(vdr_records_file_tmp, "w") as f:
        for latest_record in vdr_list_all_records(partition, bucket, namespace):
            fp_id = latest_record["fp_id"]

            # Decrypt old versions as well.
            # We currently don't have a footprint-dr command to list old records fetch them from the API.
            all_fields = set()
            for version in range(1, latest_record["version"] + 1):
                version_fields = get_vault_fields_via_api(fp_id, version)
                all_fields = all_fields.union(version_fields)

                if version == latest_record["version"]:
                    assert sorted(version_fields) == sorted(
                        latest_record["fields"]
                    ), f"VDR claims fields for {fp_id} at version {version} are {latest_record['fields']} but API claims they are {version_fields}"
            all_fields = list(all_fields)

            for version in range(1, latest_record["version"] + 1):
                record = {
                    "fp_id": fp_id,
                    "version": version,
                    "fields": all_fields,
                }
                json.dump(record, f)
                f.write("\n")

    os.rename(vdr_records_file_tmp, vdr_records_file)
    return vdr_records_file


@functools.cache
def get_vault_fields_via_api(fp_id, version):
    resp = session.get(
        f"{API_URL}/users/{fp_id}/vault", headers={"x-fp-vault-version": str(version)}
    )
    resp.raise_for_status()
    return list(resp.json().keys())


def decrypt_via_api(fp_id, version, fields):
    resp = session.post(
        f"{API_URL}/users/{fp_id}/vault/decrypt",
        headers={
            "x-fp-vault-version": str(version),
        },
        json={"fields": fields, "reason": "VDR validation"},
    )
    if resp.status_code != 200:
        raise Exception(f"Failed to decrypt: {resp.text}")
    return resp.json()


def get_org_identity():
    with open("../../../.env", "r") as env_file:
        lines = env_file.readlines()
        private_key_line = next(
            line for line in lines if line.startswith("VDR_AGE_PRIVATE_KEY_1=")
        )
        private_key = private_key_line.split("=")[1].strip()
        return private_key


def listdir(path):
    out = []
    for f in os.listdir(path):
        if not f.startswith("."):
            out.append(f)
    return out


def validate_fp_id(args):
    fp_id, decrypt_dir, data_dir = args

    vdr_data_for_version = {}
    di_is_document = {}

    version_dir = os.path.join(decrypt_dir, fp_id)
    for version in listdir(version_dir):
        vdr_data = {}

        field_dir = os.path.join(version_dir, version)
        for field in listdir(field_dir):
            version_data_dir = os.path.join(field_dir, field)
            data_filename = listdir(version_data_dir)[0]
            data_file = os.path.join(version_data_dir, data_filename)

            is_document = data_filename != "value.txt"
            di_is_document[(field, version)] = is_document

            open_mode = "rb" if is_document else "r"
            with open(data_file, open_mode) as f:
                data = f.read()
                if is_document:
                    vdr_data[field] = hashlib.sha256(data).hexdigest()
                else:
                    vdr_data[field] = data

        vdr_data_for_version[version] = vdr_data

    for version, vdr_data in vdr_data_for_version.items():
        validate_checkpoint = os.path.join(data_dir, f"{fp_id}.{version}.validated")
        if os.path.exists(validate_checkpoint):
            continue

        fields = get_vault_fields_via_api(fp_id, version)

        api_data = decrypt_via_api(fp_id, version, fields)
        # Hash document values for easier comparison.
        # Convert JSON values from the API to strings.
        api_data = dict(
            [
                (
                    di,
                    (
                        hashlib.sha256(base64.b64decode(data)).hexdigest()
                        if di_is_document[(di, version)] and data is not None
                        else (
                            json.dumps(data, separators=(",", ":"))
                            if isinstance(data, list) or isinstance(data, dict)
                            else data
                        )
                    ),
                )
                for di, data in api_data.items()
            ]
        )

        api_fields = set(api_data.items())
        vdr_fields = set(vdr_data.items())
        common_fields = api_fields.intersection(vdr_fields)
        api_mismatch = sorted(api_fields - common_fields)
        vdr_mismatch = sorted(vdr_fields - common_fields)

        if api_data != vdr_data:
            mismatch_api_dis = set(di for di, _ in api_mismatch)
            mismatch_vdr_dis = set(di for di, _ in vdr_mismatch)
            if mismatch_api_dis == mismatch_vdr_dis and all(
                v is None for di, v in api_mismatch
            ):
                print(
                    "Assuming mismatch due to OBC can_access_data restriction:", fp_id
                )
                with open(validate_checkpoint, "w") as f:
                    f.write("done: can_access_data caveat")
                continue

            print(
                f"VDR data and API data mismatch for {fp_id} at version {version}\nMismatch in API Data: {api_mismatch}\nMismatch in VDR Data: {vdr_mismatch}"
            )
        else:
            with open(validate_checkpoint, "w") as f:
                f.write("done")


def main():
    bucket, namespace = get_bucket_namespace()

    org_identity_file = tempfile.NamedTemporaryFile()
    org_identity_file.write(get_org_identity().encode())
    org_identity_file.flush()

    data_dir = "data"
    decrypt_dir = os.path.join(data_dir, "vdr_decrypt")
    os.makedirs(decrypt_dir, exist_ok=True)

    pool = mp.Pool()

    print("Downloading all VDR records")
    partitions = fp_id_partitions()

    records_files = []
    for file in tqdm.tqdm(
        pool.imap_unordered(
            vdr_download_all_records,
            [(p, bucket, namespace, data_dir) for p in partitions],
        ),
        total=len(partitions),
        desc="Downloading",
    ):
        print("Downloaded records to", file)
        records_files.append(file)

    for records_file in tqdm.tqdm(records_files, desc="Decrypting"):
        decrypt_checkpoint = f"{records_file}.decrypted.checkpoint"
        if os.path.exists(decrypt_checkpoint):
            print("Already decrypted records in", records_file)
        else:
            footprint_dr(
                "decrypt",
                MODE,
                "--org-identity",
                org_identity_file.name,
                "--output-dir",
                decrypt_dir,
                "--records",
                records_file,
                "--wrapped-recovery-key",
                WRAPPED_RECOVERY_KEY_FILE,
                capture=False,
            )
            with open(decrypt_checkpoint, "w") as f:
                f.write("done")

    fp_ids = listdir(decrypt_dir)
    for _ in tqdm.tqdm(
        pool.imap_unordered(
            validate_fp_id, [(fp_id, decrypt_dir, data_dir) for fp_id in fp_ids]
        ),
        total=len(fp_ids),
        desc="Validating",
    ):
        pass


if __name__ == "__main__":
    main()
