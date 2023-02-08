import re
import requests
import base64
import json
import random
import arrow
import time
import os

from tests.types import ObConfiguration, SecretApiKey, Tenant, BasicUser
from tests.auth import DashboardAuth, FpAuth
from tests.constants import CUSTODIAN_AUTH, EMAIL, PHONE_NUMBER

url = lambda path: "{}/{}".format(os.environ.get("TEST_URL"), path)

SERVER_VERSION_HEADER = "x-footprint-server-version"


class HttpError(Exception):
    def __init__(self, code, message):
        self.code = code
        super().__init__(message)


class IncorrectServerVersion(Exception):
    def __init__(self, expected_version, actual_version):
        message = f"Expected server version {expected_version}, got {actual_version}"
        super().__init__(message)


def _make_request(method, path, data, params, status_code, auths, files):
    headers = {auth.HEADER_NAME: auth.value for auth in auths}
    response = method(url(path), headers=headers, json=data, params=params, files=files)
    if response.status_code != status_code:
        raise HttpError(
            response.status_code,
            f"Incorrect status code in {method.__name__.upper()} {path}. Got {response.status_code}, expected {status_code}:\n{response.content}\nPath: {path}\nData: {data}\nParams: {params}\nHeaders: {headers}\nResponse: {response.content}",
        )
    expected_version = os.environ.get("EXPECTED_SERVER_VERSION", None)
    actual_version = response.headers.get(SERVER_VERSION_HEADER)
    if expected_version and actual_version != expected_version:
        raise IncorrectServerVersion(expected_version, actual_version)
    return response


def get(path, params=None, *auths, status_code=200):
    return _make_request(
        method=requests.get,
        path=path,
        data=None,
        params=params,
        status_code=status_code,
        auths=auths,
        files=None,
    ).json()


def put(path, data=None, *auths, status_code=200, files=None):
    return _make_request(
        method=requests.put,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=files,
    ).json()


def post(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.post,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=None,
    ).json()


def patch(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.patch,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=None,
    ).json()


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


def inherit_user(twilio, phone_number, tenant_pk):
    identifier = dict(phone_number=phone_number)
    # Support sandbox phone numbers being passed in
    real_phone_number = phone_number.split("#")[0]

    def identify():
        data = dict(
            identifier=identifier,
        )
        body = post("hosted/identify", data)
        assert body["user_found"]
        assert body["available_challenge_kinds"]

    def challenge():
        data = dict(
            identifier=identifier,
            preferred_challenge_kind="sms",
        )
        body = post("hosted/identify/login_challenge", data)
        assert body["challenge_data"]["phone_number_last_two"] == real_phone_number[-2:]
        assert body["challenge_data"]["challenge_kind"] == "sms"
        return body["challenge_data"]["challenge_token"]

    try_until_success(identify, 5)
    challenge_token = try_until_success(challenge, 20)

    # Log in as the user
    return try_until_success(
        lambda: identify_verify(
            twilio,
            real_phone_number,
            challenge_token,
            tenant_pk=tenant_pk,
            expected_kind="user_inherited",
        ),
        5,
    )


def identify_verify(
    twilio, phone_number, challenge_token, tenant_pk=None, expected_kind="user_created"
):
    messages = twilio.messages.list(to=phone_number, limit=6)

    last_error = None
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
            args = [tenant_pk] if tenant_pk else []
            body = post("hosted/identify/verify", data, *args)
            assert body["kind"] == expected_kind
            return FpAuth(body["auth_token"])
        except HttpError as e:
            last_error = e
    if last_error:
        raise last_error
    assert False, "Didn't find correct code for identify"


def create_basic_sandbox_user(twilio, tenant_pk=None, suffix=None) -> BasicUser:
    sandbox_phone_number = _random_sandbox_phone(suffix)
    phone_number = sandbox_phone_number.split("#")[0]

    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = dict(phone_number=sandbox_phone_number)
        body = post("hosted/identify/signup_challenge", data)
        return body["challenge_data"]["challenge_token"]

    challenge_token = try_until_success(
        initiate_challenge, 20
    )  # Rate limiting may take a while

    # Respond to the challenge and create the sandbox user
    auth_token = try_until_success(
        lambda: identify_verify(
            twilio, phone_number, challenge_token, tenant_pk=tenant_pk
        ),
        5,
    )

    return BasicUser(
        auth_token=auth_token,
        phone_number=sandbox_phone_number,
    )


def create_sandbox_user(sandbox_tenant, twilio):
    from tests.bifrost_client import BifrostClient

    bifrost_client = BifrostClient(sandbox_tenant.default_ob_config)
    bifrost_client.init_user_for_onboarding(twilio)
    return bifrost_client.onboard_user_onto_tenant(sandbox_tenant)


def create_tenant(org_data, ob_conf_data):
    body = post("private/test_tenant", org_data, CUSTODIAN_AUTH)
    sk = SecretApiKey.from_response(body["key"])
    auth_token = DashboardAuth(body["auth_token"])
    ob_config = create_ob_config(sk, ob_conf_data)
    print("\n======org info======")
    print(body)
    tenant = Tenant(
        id=body["org_id"],
        default_ob_config=ob_config,
        sk=sk,
        name=org_data["name"],
        auth_token=auth_token,
        rolebinding_id=body["tenant_rolebinding_id"],
    )
    return tenant


def create_ob_config(sk, ob_conf_data):
    # TODO also make this get or create?
    body = post("org/onboarding_configs", ob_conf_data, sk.key)
    ob_config = ObConfiguration.from_response(body)
    print("\n======org onboarding info======")
    print(body)
    return ob_config


def build_user_data():
    ssn = _gen_random_ssn()
    user_data = {
        "id.first_name": "Sandbox",
        "id.last_name": "User",
        "id.dob": "1995-12-25",
        "id.address_line1": "1 Footprint Way",
        "id.address_line2": "PO Box Wallaby Way",
        "id.city": "Enclave",
        "id.state": "NY",
        "id.zip": "10009",
        "id.country": "US",
        "id.ssn9": ssn,
    }
    return user_data


def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)
    identifier = {"email": email}
    data = dict(
        identifier=identifier,
        preferred_challenge_kind="sms",
    )
    body = post("hosted/identify", data)
    assert not body["user_found"]
    assert not body["available_challenge_kinds"]


def get_requirement_from_requirements(kind, requirements):
    f = lambda kind, requirements: next(r for r in requirements if r["kind"] == kind)
    try:
        return f(kind, requirements)
    except StopIteration:
        return None


def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])


def _random_sandbox_phone(suffix=None):
    suffix = suffix or "sandbox"
    seed = _gen_random_n_digit_number(10)
    return f"{PHONE_NUMBER}#{suffix}{seed}"


def _sandbox_email(phone_number):
    # Extract the suffix from an already generated sandbox phone number
    suffix = phone_number.split("#")[-1]
    return f"{EMAIL}#{suffix}"


def _gen_random_ssn():
    return _gen_random_n_digit_number(9)


def _pretty_print_json(o):
    print(json.dumps(o, indent=4, sort_keys=True))


def _b64_decode(v):
    return base64.urlsafe_b64decode(v + "=" * (-len(v) % 4))


def _b64_encode(v):
    return base64.urlsafe_b64encode(v).decode("ascii").rstrip("=")


def override_webauthn_challenge(chal):
    chal["publicKey"]["attestation"] = "none"
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])
    chal["publicKey"]["user"]["id"] = _b64_decode(chal["publicKey"]["user"]["id"])
    return chal


def override_webauthn_attestation(attestation):
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["clientDataJSON"] = _b64_encode(
        attestation["response"]["clientDataJSON"]
    )
    attestation["response"]["attestationObject"] = _b64_encode(
        attestation["response"]["attestationObject"]
    )
    return attestation
