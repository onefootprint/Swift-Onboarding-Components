import os
import requests
import datetime
import json


def log_api_call(api_log_file_path, req, res):
    s = f"{str(datetime.datetime.now())}\n{req.__dict__}\n{res.__dict__}\n{json.dumps(res.json())}\n"
    print(s)
    with open(api_log_file_path, "a") as f:
        f.write(s)

def call_endpoint(api_log_file_path, base_url, api_key, method, path, json, headers=None, allow_error_fn=None):
    url = os.path.join(base_url, path)
    req = requests.Request(method, url, auth=(api_key, ""), json=json, headers=headers)
    preq = req.prepare()
    s = requests.Session()
    res = s.send(preq)
    log_api_call(api_log_file_path, preq, res)
    if res.status_code!= 200 and (allow_error_fn is None or not allow_error_fn(res)):
        raise Exception(f"Api Error: {res.status_code}\n{res.json()}\n{res.__dict__}")
    return res.json()
