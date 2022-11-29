import re
import requests
import base64
import json
import random
import arrow
import time
import os

from .types import ObConfiguration, SecretApiKey, Tenant, BasicUser, User
from .webauthn_simulator import SoftWebauthnDevice
from .auth import DashboardAuth, FpAuth
from .constants import CUSTODIAN_AUTH, EMAIL, PHONE_NUMBER

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


def _make_request(method, path, data, params, status_code, auths):
    headers = {auth.HEADER_NAME: auth.value for auth in auths}
    response = method(
        url(path),
        headers=headers,
        json=data,
        params=params,
    )
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
    ).json()


def put(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.put,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
    ).json()


def post(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.post,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
    ).json()


def patch(path, data=None, *auths, status_code=200):
    return _make_request(
        method=requests.patch,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
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


def identify_verify(
    twilio, phone_number, challenge_token, expected_kind="user_created"
):
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
            assert body["kind"] == expected_kind
            return FpAuth(body["auth_token"])
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
        body = post("hosted/identify/signup_challenge", data)
        return body["challenge_data"]["challenge_token"]

    challenge_token = try_until_success(
        initiate_challenge, 20
    )  # Rate limiting may take a while

    # Respond to the challenge and create the sandbox user
    auth_token = try_until_success(
        lambda: identify_verify(twilio, phone_number, challenge_token), 5
    )

    user_data = {
        "email": sandbox_email,
    }
    post(
        "hosted/user/email",
        user_data,
        auth_token,
    )

    return BasicUser(
        auth_token=auth_token,
        email=sandbox_email,
        phone_number=sandbox_phone_number,
        real_phone_number=phone_number,
    )

def onboard_user_onto_tenant(tenant, basic_user, user_data, document_data=None):
    # Initialize the onboarding
    post(
        "hosted/onboarding",
        None,
        tenant.ob_config().key,
        basic_user.auth_token,
    )

    # Populate the user's data
    post("hosted/user/data/identity", user_data, basic_user.auth_token)

    # Register the biometric credential
    webauthn_device = SoftWebauthnDevice()
    body = post("hosted/user/biometric/init", None, basic_user.auth_token)
    chal_token = body["challenge_token"]
    chal = _override_webauthn_challenge(json.loads(body["challenge_json"]))
    attestation = webauthn_device.create(chal, os.environ.get("TEST_URL"))
    attestation = _override_webauthn_attestation(attestation)
    data = dict(
        challenge_token=chal_token, device_response_json=json.dumps(attestation)
    )
    post("hosted/user/biometric", data, basic_user.auth_token)

    if document_data is not None:
        from .image_fixtures import test_image

        body = get(
            "hosted/onboarding/status",
            None,
            tenant.ob_config().key,
            basic_user.auth_token,
        )

        # We have a requirement
        req = get_requirement_from_requirements(
            "collect_document", body["requirements"]
        )
        # stash the request id
        document_request_id = req["document_request_id"]

        if document_data == "front_only":
            data =  {
            "front_image": test_image,
            "back_image": None,
            "document_type": "passport",
            "country_code": "USA",
        }
        else:
            data = {
                "front_image": test_image,
                "back_image": test_image,
                "document_type": "passport",
                "country_code": "USA",
            }
        post(
            f"hosted/user/document/{document_request_id}",
            data,
            basic_user.auth_token,
            tenant.ob_config().key,
        )


    # Run the KYC check
    post(
        "hosted/onboarding/submit",
        None,
        tenant.ob_config().key,
        basic_user.auth_token,
    )

    # Authorize and complete the onboarding
    body = post(
        "hosted/onboarding/authorize",
        None,
        tenant.ob_config().key,
        basic_user.auth_token,
    )
    validation_token = body["validation_token"]

    # Get the fp_user_id
    body = post(
        "onboarding/session/validate",
        dict(validation_token=validation_token),
        tenant.sk.key,
    )
    fp_user_id = body["footprint_user_id"]
    return User(
        auth_token=basic_user.auth_token,
        fp_user_id=fp_user_id,
        first_name=user_data["name"]["first_name"],
        last_name=user_data["name"]["last_name"],
        address_line1=user_data["address"]["line1"],
        address_line2=user_data["address"]["line2"],
        zip=user_data["address"]["zip"],
        country=user_data["address"]["country"],
        ssn=user_data["ssn9"],
        phone_number=basic_user.phone_number,
        real_phone_number=basic_user.real_phone_number,
        email=basic_user.email,
        tenant=tenant,
    )

def create_inherited_non_sandbox_user(twilio):
    identifier = {"email": EMAIL}

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
            identify_type="onboarding",
        )
        body = post("hosted/identify/login_challenge", data)
        assert body["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
        assert body["challenge_data"]["challenge_kind"] == "sms"
        return body["challenge_data"]["challenge_token"]

    try_until_success(identify, 20)
    challenge_token = try_until_success(challenge, 20)

    # Log in as the user
    return try_until_success(
        lambda: identify_verify(
            twilio, PHONE_NUMBER, challenge_token, expected_kind="user_inherited"
        ),
        5,
    )


def create_tenant(org_data, ob_conf_data):
    body = post("private/tenant", org_data, CUSTODIAN_AUTH)
    sk = SecretApiKey.from_response(body["key"])
    auth_token = DashboardAuth(body["auth_token"])
    print("\n======org info======")
    print(body)
    tenant = Tenant(
        ob_configs={},
        sk=sk,
        auth_token=auth_token,
    )
    create_ob_config_for_tenant(tenant, ob_conf_data)

    return tenant


def create_ob_config_for_tenant(tenant, ob_conf_data):
    body = post("org/onboarding_configs", ob_conf_data, tenant.sk.key)
    ob_config = ObConfiguration.from_response(body)
    print("\n======org onboarding info======")
    print(body)

    tenant.ob_configs[ob_conf_data["name"]] = ob_config

    return tenant


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
            "line1": "1 Footprint Way",
            "line2": "PO Box Wallaby Way",
            "city": "Enclave",
            "state": "NY",
            "zip": "10009",
            "country": "US",
        },
        "ssn9": ssn,
    }
    return user_data


def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)
    identifier = {"email": email}
    data = dict(
        identifier=identifier,
        preferred_challenge_kind="sms",
        identify_type="onboarding",
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
    return base64.urlsafe_b64decode(v + "=" * (-len(v) % 4))


def _b64_encode(v):
    return base64.urlsafe_b64encode(v).decode("ascii").rstrip("=")


def _override_webauthn_challenge(chal):
    chal["publicKey"]["attestation"] = "none"
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])
    chal["publicKey"]["user"]["id"] = _b64_decode(chal["publicKey"]["user"]["id"])
    return chal


def _override_webauthn_attestation(attestation):
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["clientDataJSON"] = _b64_encode(
        attestation["response"]["clientDataJSON"]
    )
    attestation["response"]["attestationObject"] = _b64_encode(
        attestation["response"]["attestationObject"]
    )
    return attestation
