import re
import requests
import base64
import json
import random
import arrow
import time
import os
from tests.headers import SandboxId
from tests.types import ObConfiguration, SecretApiKey, Tenant
from tests.headers import DashboardAuth, FpAuth, IsLive
from tests.constants import (
    CUSTODIAN_AUTH,
    TEST_URL,
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL_OTP_PIN,
)

url = lambda path: "{}/{}".format(TEST_URL, path.strip("/"))
from datetime import datetime, timedelta


SERVER_VERSION_HEADER = "x-footprint-server-version"
IT_DEFAULT_HEADERS = {"x-fp-integration-test": "true"}
EXPECTED_SERVER_VERSION_GIT_HASH = os.environ.get("EXPECTED_SERVER_VERSION", None)


class NotRetryableException(Exception):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class HttpError(Exception):
    def __init__(
        self,
        method,
        path,
        status_code,
        expected_status_code,
        content,
        data,
        params,
        headers,
    ):
        self.method = method
        self.path = path
        self.status_code = status_code
        self.expected_status_code = expected_status_code
        self.content = content
        self.data = data
        self.params = params
        self.headers = headers
        message = f"Incorrect status code in {method} {path}. Got {status_code}, expected {expected_status_code}:\n{content}\nPath: {path}\nData: {data}\nParams: {params}\nHeaders: {headers}\nResponse: {content}"
        super().__init__(f"HttpError {status_code}: {message}")

    def json(self):
        return json.loads(self.content)


class IncorrectServerVersion(Exception):
    def __init__(self, expected_version, actual_version):
        message = f"Expected server version {expected_version}, got {actual_version}"
        super().__init__(message)


def _make_request(
    method,
    path,
    data,
    params,
    status_code,
    auths,
    files,
    addl_headers=None,
    raw_data=None,
):
    test_name = os.environ.get("PYTEST_CURRENT_TEST")
    # A bit of an abuse, but use our own custom user-agent header that send the name of the
    # running test. Helps to debug which test caused an error log
    IT_DYNAMIC_HEADERS = {"user-agent": f"Footprint Integration Tests: {test_name}"}
    auth_headers = {auth.HEADER_NAME: auth.value for auth in auths}
    headers = {
        **auth_headers,
        **(addl_headers or {}),
        **IT_DEFAULT_HEADERS,
        **IT_DYNAMIC_HEADERS,
    }
    response = method(
        url(path), headers=headers, json=data, data=raw_data, params=params, files=files
    )
    if response.status_code != status_code:
        raise HttpError(
            method.__name__.upper(),
            path,
            response.status_code,
            status_code,
            response.content,
            data,
            params,
            headers,
        )
    expected_version = EXPECTED_SERVER_VERSION_GIT_HASH
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


def get_raw(path, status_code=200):
    return _make_request(
        method=requests.get,
        path=path,
        data=None,
        params=None,
        status_code=status_code,
        auths=[],
        files=None,
    )


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


def post(
    path,
    data=None,
    *auths,
    status_code=200,
    files=None,
    raw_response=False,
    addl_headers=None,
    raw_data=None,
):
    res = _make_request(
        method=requests.post,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=files,
        addl_headers=addl_headers,
        raw_data=raw_data,
    )
    if raw_response:
        return res
    else:
        return res.json()


def patch(path, data=None, *auths, status_code=200, addl_headers=None):
    return _make_request(
        method=requests.patch,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=None,
        addl_headers=addl_headers,
    ).json()


def delete(path, data=None, *auths, status_code=200, addl_headers=None):
    return _make_request(
        method=requests.delete,
        path=path,
        data=data,
        params=None,
        status_code=status_code,
        auths=auths,
        files=None,
        addl_headers=addl_headers,
    ).json()


def try_until_success(fn, timeout_s=5, retry_interval_s=1):
    start_time = arrow.now()
    last_exception = None
    while (arrow.now() - start_time).total_seconds() < timeout_s:
        try:
            return fn()
        except NotRetryableException as e:
            last_exception = e
            break
        except Exception as e:
            last_exception = e
        time.sleep(retry_interval_s)
    if last_exception:
        raise last_exception


def step_up_user(twilio, token, recipient_phone_number, expect_unverified):
    """
    Step up a token from unauthed, "identified" to authed with onboarding scope
    """
    # Token should start with no scopes
    body = get("hosted/user/token", None, token)
    assert not body["scopes"]

    body = identify_user(None, token)
    assert "sms" in body["available_challenge_kinds"]
    assert body["is_unverified"] == expect_unverified
    challenge_data = challenge_user(recipient_phone_number, "sms", token)

    # Log in as the user
    new_token = identify_verify(
        twilio,
        recipient_phone_number,
        challenge_data["challenge_token"],
        "onboarding",
        token,
    )

    # Now, token should have scopes
    body = get("hosted/user/token", None, new_token)
    assert set(body["scopes"]) >= {"sign_up"}
    assert (
        new_token.value != token.value
    ), "Verify should give us a new token with permissions"
    # TODO eventually, enforce that the old token's scopes did not increase

    return new_token


# TODO we're probably pretty close to needing an IdentifyClient like bifrost client to orchestrate
# all of this logic :P
def inherit_user(twilio, phone_number, scope, *headers):
    body = identify_user(dict(phone_number=phone_number), *headers)
    assert "sms" in body["available_challenge_kinds"]
    challenge_data = challenge_user(phone_number, "sms", *headers)

    # Log in as the user
    return identify_verify(
        twilio,
        phone_number,
        challenge_data["challenge_token"],
        scope,
        *headers,
    )


def inherit_user_biometric(user, token_kind, *headers):
    phone_number = user.client.data["id.phone_number"]
    sandbox_id = user.client.sandbox_id
    sandbox_id_h = [SandboxId(sandbox_id)] if sandbox_id else []

    body = identify_user(
        dict(phone_number=phone_number),
        user.client.ob_config.key,
        *sandbox_id_h,
        *headers,
    )
    assert "biometric" in body["available_challenge_kinds"]
    challenge_data = challenge_user(
        phone_number, "biometric", user.client.ob_config.key, *sandbox_id_h, *headers
    )
    body = biometric_challenge_response(
        challenge_data,
        user,
        token_kind,
        user.client.ob_config.key,
        *sandbox_id_h,
        *headers,
    )
    return FpAuth(body["auth_token"])


def inherit_user_email(user):
    email = user.client.data["id.email"]
    sandbox_id = user.client.sandbox_id
    sandbox_id_h = [SandboxId(sandbox_id)] if sandbox_id else []

    body = identify_user(dict(email=email), user.client.ob_config.key, *sandbox_id_h)
    assert "email" in body["available_challenge_kinds"]
    body = post(
        "hosted/identify/login_challenge",
        dict(
            identifier=dict(email=email),
            preferred_challenge_kind="email",
        ),
        user.client.ob_config.key,
        *sandbox_id_h,
    )

    verify_res = post(
        "hosted/identify/verify",
        dict(
            challenge_response=FIXTURE_EMAIL_OTP_PIN,
            challenge_token=body["challenge_data"]["challenge_token"],
            scope="onboarding",
        ),
        user.client.ob_config.key,
        *sandbox_id_h,
    )

    return FpAuth(verify_res["auth_token"])


def step_up_user_biometric(auth_token, user, scope):
    # Don't technically need to pass in the phone number to step up, but the util takes it in
    phone_number = user.client.data["id.phone_number"]
    sandbox_id = user.client.sandbox_id
    sandbox_id_h = [SandboxId(sandbox_id)] if sandbox_id else []
    challenge_data = challenge_user(
        phone_number, "biometric", auth_token, *sandbox_id_h
    )
    body = biometric_challenge_response(
        challenge_data, user, scope, auth_token, *sandbox_id_h
    )
    assert body["auth_token"] != auth_token.value
    return FpAuth(body["auth_token"])


def biometric_challenge_response(challenge_data, user, scope, *headers):
    # do webauthn
    chal = json.loads(challenge_data["biometric_challenge_json"])
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

    attestation = user.client.webauthn_device.get(chal, TEST_URL)
    attestation["rawId"] = _b64_encode(attestation["rawId"])
    attestation["id"] = _b64_encode(attestation["id"])
    attestation["response"]["authenticatorData"] = _b64_encode(
        attestation["response"]["authenticatorData"]
    )
    attestation["response"]["signature"] = _b64_encode(
        attestation["response"]["signature"]
    )
    attestation["response"]["userHandle"] = _b64_encode(
        attestation["response"]["userHandle"]
    )
    attestation["response"]["clientDataJSON"] = _b64_encode(
        attestation["response"]["clientDataJSON"]
    )

    # Log in as the user
    data = {
        "challenge_response": json.dumps(attestation),
        "challenge_kind": "biometric",
        "challenge_token": challenge_data["challenge_token"],
        "scope": scope,
    }
    body = post("hosted/identify/verify", data, *headers)
    return body


def identify_user(identifier, *headers):
    def identify():
        data = dict(identifier=identifier)
        body = post("hosted/identify", data, *headers)
        assert body["user_found"]
        assert body["available_challenge_kinds"]
        return body

    return try_until_success(identify, 5)


def challenge_user(phone_number, challenge_kind, *headers):
    # Some challenges may be invoked via token instead of phone_number
    identifier = dict(phone_number=phone_number) if phone_number else None

    def challenge():
        data = dict(
            identifier=identifier,
            preferred_challenge_kind=challenge_kind,
        )

        if any(isinstance(h, FpAuth) for h in headers):
            # Hacky - if we are challenging for step up, don't provide an identifier
            data.pop("identifier")

        body = post("hosted/identify/login_challenge", data, *headers)
        if challenge_kind == "sms":
            last_two = phone_number[-2:]
            assert (
                body["challenge_data"]["scrubbed_phone_number"]
                == f"+1 (***) ***-**{last_two}"
            )
        assert body["challenge_data"]["challenge_kind"] == challenge_kind
        return body["challenge_data"]

    return try_until_success(challenge, 20)


def identify_verify(
    twilio,
    phone_number,
    challenge_token,
    scope,
    *headers,
    expected_error=None,
):
    def verify(code):
        data = {
            "challenge_response": code,
            "challenge_kind": "sms",
            "challenge_token": challenge_token,
            "scope": scope,
        }
        body = post("hosted/identify/verify", data, *headers)
        return FpAuth(body["auth_token"])

    result = None
    if phone_number == FIXTURE_PHONE_NUMBER:
        # The code for the fixture number in sandbox is fixed
        try:
            result = verify("000000")
        except HttpError as e:
            if expected_error and expected_error in str(e):
                # The specific error we expected to see was returned from verify - we can exit
                return
            raise e
        if result and expected_error:
            raise NotRetryableException(
                "Expected error in identify verify but got result:", result
            )
        return result

    tried_codes = {}

    def inner():
        messages = twilio.messages.list(to=phone_number, limit=25)
        last_error = None
        for message in messages:
            try:
                code = str(re.search("\\d{6}", message.body).group(0))
                if code in tried_codes:
                    continue
                tried_codes[code] = True
            except Exception as e:
                # No code in this message, move on to the next
                continue

            try:
                result = verify(code)
            except HttpError as e:
                if expected_error and expected_error in str(e):
                    # The specific error we expected to see was returned from verify - we can exit
                    return
                last_error = e

            if result and expected_error:
                raise NotRetryableException(
                    "Expected error in identify verify but got result:", result
                )
            return result

        if last_error:
            raise last_error
        else:
            raise Exception(
                f"SMS 2fac code is not present",
                phone_number,
                arrow.now().isoformat()
            )

    return try_until_success(inner, 60)


def create_user(twilio, phone_number, email, token_kind, *headers) -> str:
    # Initiate the challenge to a sandbox phone number
    def initiate_challenge():
        data = dict(phone_number=phone_number, email=email)
        body = post("hosted/identify/signup_challenge", data, *headers)
        return body["challenge_data"]["challenge_token"]

    # Rate limiting may take a while
    challenge_token = try_until_success(initiate_challenge, 20)

    # Respond to the challenge and create the user
    return identify_verify(twilio, phone_number, challenge_token, token_kind, *headers)


def create_tenant(org_data, ob_conf_data):
    body = post("private/test_tenant", org_data, CUSTODIAN_AUTH)
    print("\n======org info======")
    print(body)
    sk = SecretApiKey.from_response(body["key"])
    auth_token = DashboardAuth(body["auth_token"])
    ro_auth_token = DashboardAuth(body["ro_auth_token"])
    is_live = IsLive("true" if org_data.get("is_live", False) else "false")
    tenant = Tenant(
        id=body["org_id"],
        sk=sk,
        name=org_data["name"],
        db_auths=[auth_token, is_live],
        auth_token=auth_token,
        ro_db_auths=[ro_auth_token, is_live],
        ro_auth_token=ro_auth_token,
        default_ob_config=None,  # Will populate this after making OB config
    )
    ob_config = create_ob_config(tenant, **ob_conf_data)
    # Circular reference, but worth it for simplicity of writing tests
    tenant = tenant._replace(default_ob_config=ob_config)
    return tenant


def create_ob_config(
    tenant,
    name,
    must_collect_data,
    can_access_data,
    cip_kind=None,
    optional_data=None,
    is_no_phone_flow=False,
    is_doc_first_flow=False,
    allow_international_residents=False,
    international_country_restrictions=None,
    doc_scan_for_optional_ssn=None,
    kind=None,
    override_auths=None,
    skip_confirm=None,
    enhanced_aml=None,
):
    ob_conf_data = {
        "name": name,
        "must_collect_data": must_collect_data,
        "optional_data": optional_data,
        "can_access_data": can_access_data,
        "cip_kind": cip_kind,
        "is_no_phone_flow": is_no_phone_flow,
        "is_doc_first_flow": is_doc_first_flow,
        "allow_international_residents": allow_international_residents,
        "international_country_restrictions": international_country_restrictions,
        "doc_scan_for_optional_ssn": doc_scan_for_optional_ssn,
        "kind": kind,
        "skip_confirm": skip_confirm,
        "enhanced_aml": enhanced_aml,
    }
    # TODO also make this get or create?
    auths = override_auths if override_auths else tenant.db_auths
    body = post("org/onboarding_configs", ob_conf_data, *auths)
    ob_config = ObConfiguration.from_response(body, tenant)
    print("\n======org onboarding info======")
    print(body)
    return ob_config


def clean_up_user(phone_number, email):
    # cleanup live user
    post("private/cleanup", dict(phone_number=phone_number), CUSTODIAN_AUTH)

    # Make sure the user doesn't exist after cleanup
    for identifier in [dict(email=email), dict(phone_number=phone_number)]:
        data = dict(identifier=identifier)
        body = post("hosted/identify", data)
        assert not body["user_found"]
        assert not body["available_challenge_kinds"]


def get_requirement_from_requirements(kind, requirements, is_met=False):
    f = lambda kind, requirements: next(
        r for r in requirements if r["kind"] == kind and r["is_met"] == is_met
    )
    try:
        return f(kind, requirements)
    except StopIteration:
        return None


def _gen_random_n_digit_number(n):
    return "".join([str(random.randint(0, 9)) for _ in range(n)])


def _gen_random_sandbox_id():
    seed = _gen_random_n_digit_number(10)
    return f"sandbox{seed}"


def _gen_random_ssn():
    return _gen_random_n_digit_number(9)


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


def file_path(filename):
    return os.path.join(os.path.dirname(__file__), "resources/", filename)


def multipart_file(filename, mime_type):
    return {"upload_file": (filename, open(file_path(filename), "rb"), mime_type)}


def file_contents(filename):
    with open(file_path(filename), "rb") as f:
        return f.read()


def compare_b64_contents(base64_encoded, file_name):
    return file_contents(file_name) == base64.b64decode(base64_encoded)


def compare_contents(value, file_name):
    return file_contents(file_name) == value
