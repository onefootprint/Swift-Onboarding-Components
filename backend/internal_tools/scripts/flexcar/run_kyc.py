from util import call_endpoint
import argparse
import json

def read_ids(ids_file_path):
    with open(ids_file_path, "r") as f:
        s = f.read()
        return [tuple(r.split(",")) for r in s.split("\n") if r!=""]

def run_kyc(api_base_url, api_key, obc_key, api_log_file_path, fp_id):
    d = {"onboarding_config_key": obc_key}
    return call_endpoint(api_log_file_path, api_base_url, api_key, 'POST', f"entities/{fp_id}/kyc", d)

def log_run(kyc_res_path, order_id, fp_id, res):
    s = f"{order_id}\n{fp_id}\n{json.dumps(res)}\n"
    print(s)
    with open(kyc_res_path, "a") as f:
        f.write(s)

def run(api_base_url,
        api_key,
        obc_key,
        ids_file_path,
        start_row,
        num_rows_to_process,
        api_log_file_path,
        kyc_res_path):
    ids = read_ids(ids_file_path)
    for i in range(start_row, min(start_row+num_rows_to_process, len(ids))):
        (order_id, fp_id) = ids[i]
        print(f"Running KYC for row: {i}, Order_ID: {order_id}, fp_id: {fp_id}")
        res = run_kyc(api_base_url, api_key, obc_key, api_log_file_path, fp_id)
        log_run(kyc_res_path, order_id, fp_id, res)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("--api-base-url", help="Footprint API base url", required=True)
    parser.add_argument("--api-key", help="API Key", required=True)
    parser.add_argument("--obc-key", help="ob_configuartion key", required=True)
    parser.add_argument("--ids-file-path", help="Path of (Order_ID, fp_id)'s to read in", required=True)
    parser.add_argument("--start-row", help="Which idx in ids-file-path to begin processing at", required=True)    
    parser.add_argument("--num-rows-to-process", help="Maximum number of rows to process", required=True) 
    parser.add_argument("--api-log-file-path", help="Path to file to *append* raw log of requests and responses to", required=True)    
    parser.add_argument("--kyc-res-path", help="Path to file to *append* log of (Order_ID, fp_id, response from /kyc)", required=True)   

    args = parser.parse_args()
    config = vars(args)

    run(
        config['api_base_url'],
        config['api_key'],
        config['obc_key'],
        config['ids_file_path'],
        int(config['start_row']),
        int(config['num_rows_to_process']),
        config['api_log_file_path'],
        config['kyc_res_path']
    )

