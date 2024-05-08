import requests
import csv
import click
from collections import defaultdict
from tqdm import tqdm
import sys


@click.command()
@click.option('--input-file')
@click.option('--dry-run/--no-dry-run', default=True)
@click.option('--batch-size', default=100, type=int)
@click.option('--api-base', default="http://localhost:8000")
@click.option('--custodian-key', envvar="FP_CUSTODIAN_KEY", required=True)
def main(input_file, dry_run, batch_size, api_base, custodian_key):
    with open(input_file, "r") as f:
        rows = list(csv.DictReader(f))

    assert len(rows) == len(set((row["scoped_vault_id"], row["data_identifier"], row["created_seqno"]) for row in rows)), "Input file contains duplicate seqnos for the same SV/DI"

    assert len(rows) == len(set((row["scoped_vault_id"], row["data_identifier"]) for row in rows)), "Input file contains duplicate DIs"


    i = 0
    with tqdm(total=len(rows)) as progress_bar:
        while i < len(rows):
            migrate_batch(rows[i:i+batch_size], dry_run, api_base, custodian_key)
            i += batch_size
            progress_bar.update(batch_size)


def count_expiration_dis(m):
    return len(set([(fp_id, di) for fp_id, dis in m.items() for di in dis if di.endswith(".expiration")]))


def migrate_batch(batch, dry_run, api_base, custodian_key):
    resp = requests.post(
        f"{api_base}/private/protected/fix_card_expiration_year",
        json={
            "sv_seqnos": [{
                "sv_id": row["scoped_vault_id"],
                "data_identifier": row["data_identifier"],
                "seqno": int(row["created_seqno"]),
            } for row in batch],
            "dry_run": dry_run,
        },
        headers={
            "x-fp-protected-custodian-key": custodian_key,
        },
    )
    b = resp.json()
    print(resp.text)
    sys.stdout.flush()
    resp.raise_for_status()

    updated = count_expiration_dis(b["updated"])
    would_update = count_expiration_dis(b["would_update"])
    skipped_old_seqno = count_expiration_dis(b["skipped_old_seqno"])
    skipped_already_correct = count_expiration_dis(b["skipped_already_correct"])
    assert len(batch) == updated + would_update + skipped_old_seqno + skipped_already_correct


if __name__ == "__main__":
    main()
