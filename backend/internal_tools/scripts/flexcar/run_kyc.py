from util import call_endpoint
import argparse
import json


def read_ids(ids_file_path):
    with open(ids_file_path, "r") as f:
        s = f.read()
        return [tuple(r.split(",")) for r in s.split("\n") if r != ""]


EXPECTED_ERROR_MESSAGES = [
    "Unmet onboarding requirements: CollectData",
    "something went wrong",
]


def run_kyc(api_base_url, api_key, obc_key, api_log_file_path, fp_id):
    d = {"onboarding_config_key": obc_key}
    res = call_endpoint(
        api_log_file_path,
        api_base_url,
        api_key,
        "POST",
        f"entities/{fp_id}/kyc",
        d,
        allow_error_fn=lambda res: res.json()["error"]
        and res.json()["error"]["message"] in EXPECTED_ERROR_MESSAGES,
    )
    return res


def log_run(kyc_res_path, order_id, fp_id, res):
    s = f"{order_id}\n{fp_id}\n{json.dumps(res)}\n"
    print(s)
    with open(kyc_res_path, "a") as f:
        f.write(s)


ORDER_IDS_WITH_SINGULAR_FIRST_OR_LAST_NAMES = [
    "8526cd71-7aec-4d07-9559-e31934681db1",
    "25a31f80-856f-4b1f-941d-00073e2f38ff",
    "3c491c38-7eee-49d9-a5c5-d5b1db1a27b5",
    "bd946fa1-5efa-4818-b0c2-b51bfad8036b",
    "6d653542-dc98-481c-9403-e2ff87a0dab5",
    "fb024aa4-cbde-4ddb-9e69-b1ce77c7d2eb",
    "f052a992-081b-44a3-82dd-ca294755dc78",
    "0e678b9a-255c-4ed1-bd6e-7f1aa7c7405d",
    "29b91626-fe4c-4585-969a-43994e264374",
    "9df6c1eb-8236-4807-8cc9-4d0abaaf6215",
    "99aca5d6-6e83-4f0e-96e1-92119f553b6d",
    "74c91eee-3a3e-4805-9e41-8925aa9d9497",
    "88dd02f9-fecb-444c-bb44-b26cf694e6ef",
    "0e7962ba-ef6e-4714-8d12-50887f8a2417",
    "122e8ccc-3509-4fad-8a3e-263c51c68ed7",
    "8f5c4e4d-7bc3-4b50-b53d-af00a3102201",
    "2b60f485-c4b9-4af4-8a2f-654404b3bba8",
    "dbe6f313-55b9-44ff-b235-e949cc2d747d",
    "1fae8189-1524-49bb-b1e6-fc7a5c750033",
    "f50b850f-2d0e-4af4-be99-953ed57cfb3b",
    "75f9dec5-83ff-47b2-8d73-1148b9c36678",
    "ed1f59df-16a4-413a-997c-544939f5e3c9",
    "1902b8a4-02bc-44c9-8ea1-51719e576f73",
    "d6afc2ba-5b61-40e1-b5a8-acc9c9a3f1ab",
    "989fcdc0-4cd9-45de-ae6b-c9e192e397bf",
    "5f7635ab-dec7-40b8-b68e-fdeb0004be46",
]


def run(
    api_base_url,
    api_key,
    obc_key,
    ids_file_path,
    start_row,
    num_rows_to_process,
    api_log_file_path,
    kyc_res_path,
):
    ids = read_ids(ids_file_path)
    for i in range(start_row, min(start_row + num_rows_to_process, len(ids))):
        (order_id, fp_id) = ids[i]
        print(f"Running KYC for row: {i}, Order_ID: {order_id}, fp_id: {fp_id}")
        if order_id in ORDER_IDS_WITH_SINGULAR_FIRST_OR_LAST_NAMES:
            res = {"error": {"message": "First or last name is a single letter"}}
        else:
            res = run_kyc(api_base_url, api_key, obc_key, api_log_file_path, fp_id)
        log_run(kyc_res_path, order_id, fp_id, res)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("--api-base-url", help="Footprint API base url", required=True)
    parser.add_argument("--api-key", help="API Key", required=True)
    parser.add_argument("--obc-key", help="ob_configuartion key", required=True)
    parser.add_argument(
        "--ids-file-path", help="Path of (Order_ID, fp_id)'s to read in", required=True
    )
    parser.add_argument(
        "--start-row",
        help="Which idx in ids-file-path to begin processing at",
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
        "--kyc-res-path",
        help="Path to file to *append* log of (Order_ID, fp_id, response from /kyc)",
        required=True,
    )

    args = parser.parse_args()
    config = vars(args)

    run(
        config["api_base_url"],
        config["api_key"],
        config["obc_key"],
        config["ids_file_path"],
        int(config["start_row"]),
        int(config["num_rows_to_process"]),
        config["api_log_file_path"],
        config["kyc_res_path"],
    )
