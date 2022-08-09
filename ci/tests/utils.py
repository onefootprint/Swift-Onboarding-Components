import re
import requests
import base64
import json
import random
import arrow
import time
import os 

from .types import ObConfiguration, SecretApiKey, Tenant, BasicUser
from .auth import (
    OnboardingAuth,
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

def patch(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.patch,
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


def create_basic_user(twilio):
    sandbox_phone_number, sandbox_email = _random_sandbox_info()
    phone_number = sandbox_phone_number.split("#")[0]

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = dict(phone_number=sandbox_phone_number, identify_type="onboarding")
        body = post("internal/identify/challenge", data)
        return body["data"]["challenge_token"]
    challenge_token = try_until_success(initiate_challenge, 20)  # Rate limiting may take a while

    # Respond to the challenge and create the sandbox user
    def identify_verify():
        message = twilio.messages.list(to=phone_number, limit=1)[0]
        code = str(re.search("\\d{6}", message.body).group(0))
        data = {
            "challenge_response": code,
            "challenge_kind": "sms",
            "challenge_token": challenge_token,
        }
        body = post("internal/identify/verify", data)
        assert body["data"]["kind"] == "user_created"
        return body["data"]["auth_token"]
    auth_token = try_until_success(identify_verify, 5)
    auth_token = OnboardingAuth(auth_token)

    user_data = {
        "email": sandbox_email,
    } 
    post("internal/user/data", user_data, auth_token)

    return BasicUser(
        auth_token=auth_token,
        email=sandbox_email,
        phone_number=sandbox_phone_number,
        real_phone_number=phone_number,
    )


def create_tenant(org_data, ob_conf_data):
    body = post("private/client", org_data, CUSTODIAN_AUTH)
    sk = SecretApiKey.from_response(body["data"]["key"])
    print("\n======org info======")
    print(body)

    body = post("org/onboarding_configs", ob_conf_data, sk.key)
    ob_config = ObConfiguration.from_response(body["data"])
    print("\n======org onboarding info======")
    print(body)

    return Tenant(
        ob_config=ob_config,
        sk=sk,
    )



def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)
    identifier = {"email": email}
    data = dict(identifier=identifier, preferred_challenge_kind="sms", identify_type="onboarding")
    body = post("internal/identify", data)
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