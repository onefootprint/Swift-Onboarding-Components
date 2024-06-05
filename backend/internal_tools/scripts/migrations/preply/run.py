import os
import requests
import csv
import click
from tqdm import tqdm
import json


@click.command()
@click.option("--input-file", default="classified.json")
@click.option("--dry-run/--no-dry-run", default=True)
@click.option("--batch-size", default=100, type=int)
@click.option("--api-base", default="https://api.onefootprint.com")
@click.option("--api-key", envvar="FP_API_KEY", required=True)
@click.option("--tenant-id", envvar="FP_TENANT_ID", required=True)
@click.option("--playbook-key", envvar="FP_PLAYBOOK_KEY", required=True)
@click.option("--custodian-key", envvar="FP_CUSTODIAN_KEY", required=True)
def main(
    input_file,
    dry_run,
    batch_size,
    api_base,
    api_key,
    tenant_id,
    playbook_key,
    custodian_key,
):
    with open(input_file, "r") as f:
        data = list(json.load(f))

    sessions_to_rerun = [
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        65,
        67,
        70,
        71,
        72,
        73,
        74,
        75,
        78,
        80,
        82,
        84,
        88,
        92,
        93,
        95,
        99,
    ]
    for i in sessions_to_rerun:
        run(data[i - 1], tenant_id, playbook_key, api_base, api_key, custodian_key)


def run(session, tenant_id, playbook_key, api_base, api_key, custodian_key):
    session_id = session["session_id"]
    document_type = session["document_kind"]

    # first create the vault
    resp = requests.post(
        f"{api_base}/users",
        headers={
            "X-Footprint-Secret-Key": api_key,
            "x-external-id": f"id-session-{session_id}",
        },
    )
    b = resp.json()
    resp.raise_for_status()
    fp_id = b["id"]

    print("created fp_id", fp_id)

    # write the session id
    resp = requests.patch(
        f"{api_base}/users/{fp_id}/vault",
        json={
            "custom.session": f"{session_id}",
        },
        headers={
            "X-Footprint-Secret-Key": api_key,
        },
    )
    resp.raise_for_status()

    # create the document request
    body = {
        "playbook_key": playbook_key,
        "tenant_id": tenant_id,
        "is_live": True,
        "fp_id": fp_id,
        "document_type": document_type,
        "country_code": session["country_code"],
        "perform_ocr_comparison": False,
    }
    resp = requests.post(
        f"{api_base}/private/incode/adhoc/documents",
        json=body,
        headers={"X-Fp-Protected-Custodian-Key": custodian_key},
    )
    b = resp.json()
    print(resp.text)
    resp.raise_for_status()
    document_id = b["id"]
    print(f"created document request {document_id}")

    def upload_file(doc_id, side, file_path):
        files = {
            "upload_file": (
                f"{session_id}_{side}",
                open(file_path, "rb"),
                "image/jpeg",
            )
        }
        resp = requests.post(
            f"{api_base}/private/incode/adhoc/{doc_id}/upload/{side}",
            files=files,
            headers={"X-Fp-Protected-Custodian-Key": custodian_key},
        )
        print(resp.text)
        resp.raise_for_status()
        print(f"uploaded file {file_path}")

    # upload front
    upload_file(document_id, "front", session["front"])

    # upload back
    if (
        document_type != "passport"
        and "back" in session
        and os.path.exists(session["back"])
    ):
        upload_file(document_id, "back", session["back"])

    # upload selfie
    if "selfie" in session:
        upload_file(document_id, "selfie", session["selfie"])

    # finish and process
    resp = requests.post(
        f"{api_base}/private/incode/adhoc/{document_id}/process",
        headers={"X-Fp-Protected-Custodian-Key": custodian_key},
    )
    print(f"Process document {resp.text}")

    # fetch ocr data and then vault it
    attr = lambda x: f"document.{document_type}.{x}"

    resp = requests.post(
        f"{api_base}/users/{fp_id}/vault/decrypt",
        json={
            "fields": [attr("full_name"), attr("dob"), attr("full_address")],
            "reason": "Fetch OCR data",
        },
        headers={
            "X-Footprint-Secret-Key": api_key,
        },
    )
    print(resp.text)
    resp.raise_for_status()

    b = resp.json()
    full_name = b[attr("full_name")]
    dob = b[attr("dob")]
    address = b[attr("full_address")]

    if full_name is not None:
        resp = requests.patch(
            f"{api_base}/users/{fp_id}/vault",
            json={
                "id.first_name": full_name.split(" ")[0],
                "id.last_name": " ".join(full_name.split(" ")[1:]),
            },
            headers={
                "X-Footprint-Secret-Key": api_key,
            },
        )
        print(resp.text)

    if dob is not None:
        resp = requests.patch(
            f"{api_base}/users/{fp_id}/vault",
            json={
                "id.dob": dob,
            },
            headers={
                "X-Footprint-Secret-Key": api_key,
            },
        )
        print(resp.text)


if __name__ == "__main__":
    main()
