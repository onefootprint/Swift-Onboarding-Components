import argparse
import csv
from util import call_endpoint
from dataclasses import dataclass
import re


def read_seed_data(seed_file_path):
    with open(seed_file_path, "r") as f:
        return list(csv.DictReader(f))


SEED_FILE_PII_FIELD_TO_FP_DI = {
    "Address2": "id.address_line2",
    "City": "id.city",
    "State": "id.state",
    "Zip": "id.zip",
    "Phone": "id.phone_number",
    "Email_Address": "id.email",
    "SSN": "id.ssn9",  # always null anyway tho
    "DOB": "id.dob",
}

SEED_FILE_NAME_FIELDS = [
    "First_Name",
    "MiddleAndSurName",
    "Last_Name",
]

NAME_SUFFIXES = ["jr", "jr.", "sr", "sr.", "i", "i.", "ii", "ii.", "iii", "iii."]


@dataclass
class Name:
    first: str
    middle_names: str
    last: str
    suffix: str


def parse_name(first_name, middle_and_sur_name, last_name):
    middle_name_parts = middle_and_sur_name.split(" ")
    if middle_name_parts[-1].lower() in NAME_SUFFIXES:
        suffix = middle_name_parts.pop()
        last = middle_name_parts.pop()
    else:
        suffix = None
        last = last_name

    if first_name is None or first_name == "":
        if len(middle_name_parts) > 1:
            first = middle_name_parts[0]
            last = middle_name_parts[-1]
            if len(middle_name_parts) > 2:
                middle_names = " ".join(middle_name_parts[1:-1])
            else:
                middle_names = None
        else:
            first = middle_name_parts[0]
            middle_names = None
            last = None
    else:
        first = first_name

        if len(middle_name_parts) > 1:  # have middle name(s)
            middle_names = " ".join(middle_name_parts[:-1])
        elif len(middle_name_parts) == 1:
            if middle_name_parts[0] != last:
                middle_names = middle_name_parts[0]
            else:
                middle_names = None
        else:
            middle_names = None

    return Name(first=first, middle_names=middle_names, last=last, suffix=suffix)


EXPERIAN_ADDRES1_REGEX = r"([a-zA-Z0-9# \\\-'$ / \\\.]{1,60}){1}"


def parse_address1(address1):
    if address1 is None:
        return address1
    comps = re.findall(EXPERIAN_ADDRES1_REGEX, address1)
    if len(address1) < 2:
        return address1
    else:
        fixed_address1 = " ".join([s.strip() for s in comps])
        fixed_address1 = re.findall(EXPERIAN_ADDRES1_REGEX, fixed_address1)[0]
        return fixed_address1


def vault_blob_for_seed_file_row(row):
    vault_data = {}
    for k, v in row.items():
        if (
            k in SEED_FILE_NAME_FIELDS or k == "Address1"
        ):  # handle name parsing separately
            continue
        if (
            v is not None and v != ""
        ):  # dont try and vault fields that are blank in seed file
            v = v.strip()
            if k in SEED_FILE_PII_FIELD_TO_FP_DI:
                vault_data[SEED_FILE_PII_FIELD_TO_FP_DI[k]] = v
            elif k == "Chargeback_$":  # we error on symbols in key name
                vault_data["custom.Chargeback_usd"] = v
            else:
                vault_data[f"custom.{k}"] = v
    vault_data["id.country"] = "US"  # not in seed file, but inferred

    name = parse_name(row["First_Name"], row["MiddleAndSurName"], row["Last_Name"])
    vault_data["id.first_name"] = name.first.strip()
    vault_data["id.last_name"] = name.last.strip()
    # vault_data['id.middle_name'] = name.middle_names.strip() # not supported yet

    address1 = row["Address1"]
    if address1:
        vault_data["id.address_line1"] = parse_address1(address1)

    return vault_data


def create_user(api_log_file_path, api_base_url, api_key, row):
    order_id = row["Order_ID"]
    assert order_id is not None
    return call_endpoint(
        api_log_file_path,
        api_base_url,
        api_key,
        "POST",
        "users",
        None,
        headers={"x-idempotency-id": order_id},
    )


def vault_data(api_log_file_path, api_base_url, api_key, fp_id, row):
    vault_data = vault_blob_for_seed_file_row(row)
    return call_endpoint(
        api_log_file_path,
        api_base_url,
        api_key,
        "PATCH",
        f"users/{fp_id}/vault",
        vault_data,
    )


def upsert_into_footprint(api_log_file_path, api_base_url, api_key, row):
    fp_id = create_user(api_log_file_path, api_base_url, api_key, row)["id"]
    vault_data(api_log_file_path, api_base_url, api_key, fp_id, row)
    return fp_id


def log_id(ids_file_path, order_id, fp_id):
    s = f"{order_id},{fp_id}\n"
    print(s)
    with open(ids_file_path, "a") as f:
        f.write(s)


def run(
    api_base_url,
    api_key,
    seed_file_path,
    start_row,
    num_rows_to_process,
    api_log_file_path,
    ids_file_path,
):
    seed_data = read_seed_data(seed_file_path)
    for i in range(start_row, min(start_row + num_rows_to_process, len(seed_data))):
        row = seed_data[i]
        order_id = row["Order_ID"]
        print(f"\nUpserting row: {i}, Order_ID: {order_id}")
        fp_id = upsert_into_footprint(api_log_file_path, api_base_url, api_key, row)
        log_id(ids_file_path, order_id, fp_id)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("--api-base-url", help="Footprint API base url", required=True)
    parser.add_argument("--api-key", help="API Key", required=True)
    parser.add_argument("--seed-file-path", help="Path to csv seed file", required=True)
    parser.add_argument(
        "--start-row",
        help="Which idx in the seed file to begin processing at",
        required=True,
    )
    parser.add_argument(
        "--num-rows-to-process", help="Maximum number of rows to process", required=True
    )
    parser.add_argument(
        "--api-log-file-path",
        help="Path to file to *append* raw log of requests and responses to",
        required=True,
    )
    parser.add_argument(
        "--ids-file-path",
        help="Path to file to *append* log of (Order_ID, fp_id)",
        required=True,
    )

    args = parser.parse_args()
    config = vars(args)

    run(
        config["api_base_url"],
        config["api_key"],
        config["seed_file_path"],
        int(config["start_row"]),
        int(config["num_rows_to_process"]),
        config["api_log_file_path"],
        config["ids_file_path"],
    )
