import os
import requests
import csv
import click
import json

from util import Api
from parse_data import parse_backtest_data


@click.command()
@click.option("--input-file", default="data.csv")
@click.option("--api-base", default="https://api.onefootprint.com")
@click.option("--api-key", envvar="FP_API_KEY", required=True)
@click.option("--playbook-key", envvar="FP_PLAYBOOK_KEY", required=True)
@click.option("--ext-ids-to-run", required=False)
def main(input_file, api_base, api_key, playbook_key, ext_ids_to_run):
    api = Api(api_base, api_key)
    data = parse_backtest_data(input_file)

    ids_to_run = data.ids if ext_ids_to_run is None else ext_ids_to_run.split(",")

    for id in ids_to_run:
        fp_id = run(api, data.users[id], playbook_key)


def run(api, user, playbook_key):
    # create the vault idempotently
    vault = api.call(
        "POST",
        f"users",
        {},
        {"x-external-id": user.external_id},
    )
    fp_id = vault["id"]

    # vault the DIs
    api.call(
        "PATCH",
        f"users/{fp_id}/vault",
        {
            "id.email": user.email,
            "id.phone_number": user.phone,
            "id.first_name": user.first_name,
            "id.last_name": user.last_name,
            "id.dob": user.dob,
            "id.address_line1": user.address_line1,
            "id.city": user.city,
            "id.state": user.state,
            "id.country": user.country,
            "id.zip": user.zip,
            "id.drivers_license_number": user.drivers_license_number,
            # vault this to custom to make it visible in the dashboard
            # until we add the above field to the dash too
            "custom.drivers_license_number": user.drivers_license_number,
        },
    )

    # run kyc
    opts = {"key": playbook_key}
    if playbook_key.startswith("pb_test_"):
        opts["fixture_result"] = "pass"

    api.call("POST", f"users/{fp_id}/kyc", opts)

    return fp_id


if __name__ == "__main__":
    main()
