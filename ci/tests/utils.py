import requests
import base64
import json
import random
import arrow
import time
import os 

from .constants import EMAIL, PHONE_NUMBER

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

def _make_request(method, path, data, params, status_code, auths):
    headers = {
        auth.HEADER_NAME: auth.token
        for auth in auths
    }
    response = method(
        url(path),
        headers=headers,
        json=data,
        params=params,
    )
    if response.status_code != status_code:
        print(f"\nFailed request\nPath: {path}\nData: {data}\nParams: {params}\nHeaders: {headers}\nReponse: {response.content}")
        assert False, f"Incorrect status code in {method.__name__.upper()} {path}. Got {response.status_code}, expected {status_code}:\n{response.content}"
    return response.json()

def get(path, params=None, *auths, status_code=200):
    return _make_request(
        method=requests.get,
        path=path,
        data=None,
        params=params,
        status_code=status_code,
        auths=auths,
    )

def post(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.post,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
    )

def try_until_success(fn, timeout_s=5, retry_interval_s=1):
    start_time = arrow.now()
    last_exception = None
    while (arrow.now() - start_time).total_seconds() < timeout_s:
        try:
            return fn()
        except Exception as e:
            last_exception = e
        time.sleep(retry_interval_s)
    if last_exception:
        raise last_exception

def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _random_sandbox_phone():
    seed = _gen_random_n_digit_number(10)
    return f"{PHONE_NUMBER}#sandbox{seed}"

def _random_sandbox_email():
    seed = _gen_random_n_digit_number(10)
    email_parts= EMAIL.split("@")
    return f"{email_parts[0]}+sandbox{seed}@{email_parts[1]}"

def _gen_random_ssn():
    return _gen_random_n_digit_number(9)

def _pretty_print_json_str(o):
    print(_pretty_print_json(json.loads(o)))

def _pretty_print_json(o):
    print(json.dumps(o, indent=4, sort_keys=True))

def _b64_decode(v):
    return base64.urlsafe_b64decode(v + '=' * (-len(v) % 4))

def _b64_encode(v):
    return base64.urlsafe_b64encode(v).decode('ascii').rstrip('=')

def _override_webauthn_challenge(chal):
    chal["publicKey"]["attestation"] = 'none'
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])
    chal["publicKey"]["user"]["id"] = _b64_decode(chal["publicKey"]["user"]["id"])
    return chal

def _override_webauthn_attestation(attestation):
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"])
    attestation["response"]["attestationObject"] = _b64_encode(attestation["response"]["attestationObject"])
    return attestation