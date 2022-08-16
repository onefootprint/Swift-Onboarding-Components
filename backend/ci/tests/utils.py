import re
import requests
import base64
import json
import random
import arrow
import time
import os 

from .types import ObConfiguration, SecretApiKey, Tenant, BasicUser
from .auth import FpAuth
from .constants import CUSTODIAN_AUTH, EMAIL, PHONE_NUMBER

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

class HttpError(Exception):
    def __init__(self, code, message):
        self.code = code
        super().__init__(message)

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
        raise HttpError(response.status_code, f"Incorrect status code in {method.__name__.upper()} {path}. Got {response.status_code}, expected {status_code}:\n{response.content}\nPath: {path}\nData: {data}\nParams: {params}\nHeaders: {headers}\nResponse: {response.content}")
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
    

def identify_verify(twilio, phone_number, challenge_token, expected_kind="user_created"):
    messages = twilio.messages.list(to=phone_number, limit=6)
    for message in messages:
        try:
            code = str(re.search("\\d{6}", message.body).group(0))
        except:
            # No code in this message, move on to the next
            continue

        try:
            data = {
                "challenge_response": code,
                "challenge_kind": "sms",
                "challenge_token": challenge_token,
            }
            body = post("hosted/identify/verify", data)
            assert body["data"]["kind"] == expected_kind
            return FpAuth(body["data"]["auth_token"])
        except HttpError as e:
            last_error = e
    if last_error:
        raise last_error
    assert False, "Didn't find correct code for identify"


def create_basic_user(twilio, suffix=None):
    sandbox_phone_number, sandbox_email = _random_sandbox_info(suffix)
    phone_number = sandbox_phone_number.split("#")[0]

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = dict(phone_number=sandbox_phone_number, identify_type="onboarding")
        body = post("hosted/identify/challenge", data)
        return body["data"]["challenge_token"]
    challenge_token = try_until_success(initiate_challenge, 20)  # Rate limiting may take a while

    # Respond to the challenge and create the sandbox user
    auth_token = try_until_success(lambda: identify_verify(twilio, phone_number, challenge_token), 5)

    user_data = {
        "email": sandbox_email,
    } 
    post("hosted/user/data", user_data, auth_token)

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


def build_user_data():
    ssn = _gen_random_ssn()
    user_data = {
        "name": {
            "first_name": "Sandbox",
            "last_name": "User",
        },
        "dob": {
            "month": 12,
            "day": 25,
            "year": 1995,
        },
        "address": {
            "address": {
                "street_address": "1 Footprint Way",
                "street_address_2": "PO Box Wallaby Way",
            },
            "city": "Enclave",
            "state": "NY",
            "zip": "10009",
            "country": "US",
        },
        "ssn": ssn,
    } 
    return user_data


def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)
    identifier = {"email": email}
    data = dict(identifier=identifier, preferred_challenge_kind="sms", identify_type="onboarding")
    body = post("hosted/identify", data)
    assert not body["data"]["user_found"]
    assert not body["data"].get("challenge_data", dict())


def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

def _random_sandbox_info(suffix=None):
    suffix = suffix or "sandbox"
    seed = _gen_random_n_digit_number(10)
    return (f"{PHONE_NUMBER}#{suffix}{seed}", f"{EMAIL}#{suffix}{seed}")

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