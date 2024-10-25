#!/usr/bin/env python3

import modal
import asyncio
import functools
import hashlib
import base64
import json
import subprocess
import os
import tempfile
import multiprocessing as mp
import string
import random

FP_ID_ALPHABET = string.ascii_lowercase + string.digits

app = modal.App("vault-dr-validation")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("tqdm==4.66.4", "requests==2.31.0", "boto3==1.34.126")
    .apt_install("wget")
    .run_commands(
        "wget -O /tmp/footprint-dr.tar.gz https://github.com/onefootprint/footprint-dr-releases/releases/download/0.3.0/footprint-dr-0.3.0-x86_64-unknown-linux-musl.tar.gz",
        "tar -xvf /tmp/footprint-dr.tar.gz -C /usr/local/bin",
    )
)

secrets = [
    modal.Secret.from_name("vdr-validation-dev"),
]

with image.imports():
    import boto3
    import tqdm.asyncio
    import requests
    from requests.auth import HTTPBasicAuth


def fp_id_partitions():
    ret = []
    for prefix in ["fp_id_", "fp_id_test_", "fp_bid_", "fp_bid_test_"]:
        for c1 in FP_ID_ALPHABET:
            for c2 in FP_ID_ALPHABET:
                ret.append(prefix + c1 + c2)
    return ret


def partition_for_fp_id(fp_id):
    parts = fp_id.split("_")
    prefix = "_".join(parts[:-1])
    suffix = parts[-1]
    return "{}_{}".format(prefix, suffix[:2])


def footprint_dr(*args, capture=True):
    sts_client = boto3.client("sts")
    creds = sts_client.assume_role(
        RoleArn="arn:aws:iam::992382496642:role/fp-vault-data-read-only",
        RoleSessionName="modal_vault_dr_validation",
    )["Credentials"]
    creds_env = {
        "AWS_ACCESS_KEY_ID": creds["AccessKeyId"],
        "AWS_SECRET_ACCESS_KEY": creds["SecretAccessKey"],
        "AWS_SESSION_TOKEN": creds["SessionToken"],
    }

    print("Running: footprint-dr", " ".join(args))
    if capture:
        return subprocess.check_output(
            ["footprint-dr", *args],
            env=os.environ | creds_env,
            text=True,
        )
    else:
        subprocess.run(["footprint-dr", *args], env=os.environ | creds_env, check=True)


def mode_flag():
    api_key = os.environ["FOOTPRINT_API_KEY"]
    return "--sandbox" if api_key.startswith("sk_test_") else "--live"


@app.function(image=image, secrets=secrets)
def get_bucket_namespace():
    status = footprint_dr("status", mode_flag())
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
            mode_flag(),
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


def api_root():
    return os.environ["FOOTPRINT_API_ROOT"]


@functools.cache
def get_vault_fields_via_api(fp_id, version):
    resp = requests.get(
        f"{api_root()}/users/{fp_id}/vault",
        headers={"x-fp-vault-version": str(version)},
        auth=HTTPBasicAuth(os.environ["FOOTPRINT_API_KEY"], ""),
    )
    resp.raise_for_status()
    return list(resp.json().keys())


def decrypt_via_api(fp_id, version, fields):
    resp = requests.post(
        f"{api_root()}/users/{fp_id}/vault/decrypt",
        headers={
            "x-fp-vault-version": str(version),
        },
        json={"fields": fields, "reason": "VDR validation"},
        auth=HTTPBasicAuth(os.environ["FOOTPRINT_API_KEY"], ""),
    )
    if resp.status_code != 200:
        raise Exception(f"Failed to decrypt: {resp.text}")
    return resp.json()


def vdr_download_all_records(partition, bucket, namespace):
    vdr_records_file = os.path.join(f"/tmp/vdr_records.{partition}.jsonl")
    with open(vdr_records_file, "w") as f:
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
    return vdr_records_file


def listdir(path):
    out = []
    for f in os.listdir(path):
        if not f.startswith("."):
            out.append(f)
    return out


def validate_fp_id(fp_id, data_dir):
    vdr_data_for_version = {}
    di_is_document = {}

    version_dir = os.path.join(data_dir, fp_id)
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
                # Assuming mismatch due to OBC can_access_data restriction
                continue

            return f"VDR data and API data mismatch for {fp_id} at version {version}. Mismatch in API Data: {api_mismatch}. Mismatch in VDR Data: {vdr_mismatch}"

    return None


@app.function(
    image=image,
    secrets=secrets,
    cpu=4,
    memory=1024,
    timeout=3600,
)
def validate_partition(partition, bucket, namespace):
    org_identity_file = f"/tmp/org_identity_{partition}"
    with open(org_identity_file, "w") as f:
        f.write(os.environ["VDR_ORG_IDENTITY"])

    wrapped_recovery_key_file = f"/tmp/wrapped_recovery_key_{partition}"
    with open(wrapped_recovery_key_file, "w") as f:
        f.write(os.environ["FOOTPRINT_WRAPPED_RECOVERY_KEY"])

    data_dir = f"/tmp/data_{partition}"
    os.makedirs(data_dir)

    records_file = vdr_download_all_records(partition, bucket, namespace)

    footprint_dr(
        "decrypt",
        mode_flag(),
        "--org-identity",
        org_identity_file,
        "--output-dir",
        data_dir,
        "--records",
        records_file,
        "--wrapped-recovery-key",
        wrapped_recovery_key_file,
        "--bucket",
        bucket,
        "--namespace",
        namespace,
        capture=False,
    )

    fp_ids = listdir(data_dir)
    for fp_id in fp_ids:
        error = validate_fp_id(fp_id, data_dir)
        if error:
            return (partition, error)

    return (partition, "OKAY")


@app.local_entrypoint()
async def main():
    bucket, namespace = get_bucket_namespace.remote()

    partitions = fp_id_partitions()

    validation_results_file = "validation_results.json"

    if os.path.exists(validation_results_file):
        with open(validation_results_file, "r") as f:
            validation_results = json.load(f)
    else:
        validation_results = {}

    for partition, result in validation_results.items():
        print(partition, "=>", result)

    partitions = [p for p in partitions if p not in validation_results]

    # Modal limits the number of enqueued function calls, so to avoid hitting
    # resource exhaustion errors, we have to limit our own calling concurrency.
    semaphore = asyncio.Semaphore(64)

    async def limited_task(partition):
        async with semaphore:
            try:
                return await validate_partition.remote.aio(partition, bucket, namespace)
            except subprocess.CalledProcessError as e:
                print(e)
                return (partition, None)

    tasks = [limited_task(p) for p in partitions]
    for result in tqdm.asyncio.tqdm.as_completed(
        tasks,
        total=len(partitions),
        desc="Validating partitions",
    ):
        partition, result = await result
        print(partition, "=>", result)
        if result is None:
            # Transient error
            continue

        validation_results[partition] = result

        tmp_file = "validation_results.tmp.json"
        with open(tmp_file, "w") as f:
            f.write(json.dumps(validation_results))
        os.rename(tmp_file, validation_results_file)
