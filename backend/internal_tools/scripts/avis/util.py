import os
import requests
import datetime
import json

LOGS_PATH = "call_logs.txt"


class Api:
    def __init__(
        self,
        base_url,
        api_key,
        logs_path=LOGS_PATH,
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.logs_path = logs_path

    def call(
        self,
        method,
        path,
        json,
        headers=None,
        allow_error_fn=None,
    ):
        url = os.path.join(self.base_url, path)
        req = requests.Request(
            method, url, auth=(self.api_key, ""), json=json, headers=headers
        )
        preq = req.prepare()
        s = requests.Session()
        res = s.send(preq)
        self.log_api_call(preq, res)
        if res.status_code != 200 and (
            allow_error_fn is None or not allow_error_fn(res)
        ):
            raise Exception(f"Api Error: {res.status_code}\n{res.text}")
        return res.json()

    def log_api_call(self, req, res):
        s = f"{str(datetime.datetime.now())}\n{req.__dict__}\n{res.__dict__}\n{json.dumps(res.text)}\n"
        with open(self.logs_path, "a") as f:
            f.write(s)
