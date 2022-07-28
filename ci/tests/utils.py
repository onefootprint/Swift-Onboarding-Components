import requests
import base64
import json
import random
import arrow
import time
import os 

from .types import Tenant
from .auth import (
    TenantAuth,
    TenantSecretAuth,
)
from .constants import CUSTODIAN_AUTH, EMAIL, PHONE_NUMBER

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
        assert False, f"Incorrect status code in {method.__name__.upper()} {path}. Got {response.status_code}, expected {status_code}:\n{response.content}\nPath: {path}\nData: {data}\nParams: {params}\nHeaders: {headers}\nReponse: {response.content}"
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

def create_tenant(org_data, ob_conf_data):
    body = post("private/client", org_data, CUSTODIAN_AUTH)
    client_secret_key = body["data"]["api_key"]
    print("\n======org info======")
    print(body)

    body = post("org/config", ob_conf_data, TenantSecretAuth(client_secret_key))
    client_public_key = body["data"]["publishable_key"]
    ob_config_id = body["data"]["id"]
    print("\n======org onboarding info======")
    print(body)

    return Tenant(
        pk=TenantAuth(client_public_key),
        sk=TenantSecretAuth(client_secret_key),
        configuration_id=ob_config_id,
    )



def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)
    identifier = {"email": email}
    body = post("identify", dict(identifier=identifier, preferred_challenge_kind="sms"))
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _random_sandbox_info():
    seed = _gen_random_n_digit_number(10)
    return (f"{PHONE_NUMBER}#sandbox{seed}", f"{EMAIL}#sandbox{seed}")

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