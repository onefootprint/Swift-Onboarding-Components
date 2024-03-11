import string
import requests
import base64
import json
import random
import arrow
import time
import os
from tests.headers import SandboxId, TenantSecretAuth
from tests.types import ObConfiguration, PartnerTenant, SecretApiKey, Tenant
from tests.headers import DashboardAuth, FpAuth, IsLive
from tests.constants import (
    CUSTODIAN_AUTH,
    TEST_URL,
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL_OTP_PIN,
    FIXTURE_EMAIL,
)

url = lambda path: "{}/{}".format(TEST_URL, path.strip("/"))


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


def get(path, params=None, *auths, body=None, status_code=200):
    return _make_request(
        method=requests.get,
        path=path,
        data=body,
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
            print("Got exception in try_until_success", e)
            last_exception = e
        time.sleep(retry_interval_s)
    if last_exception:
        raise last_exception


def create_tenant(org_data, ob_conf_data):
    is_live = org_data.pop("is_live", False)
    h_is_live = IsLive("true" if is_live else "false")

    def inner():
        body = post("private/test_tenant", org_data, CUSTODIAN_AUTH)
        print("\n======org info======")
        print(body)

        matching_sk = next(k for k in body["keys"] if k["is_live"] == is_live)
        live_key = next(k for k in body["keys"] if k["is_live"])
        sandbox_key = next(k for k in body["keys"] if not k["is_live"])
        sk = SecretApiKey.from_response(matching_sk)
        auth_token = DashboardAuth(body["auth_token"])
        ro_auth_token = DashboardAuth(body["ro_auth_token"])
        tenant = Tenant(
            id=body["org_id"],
            sk=sk,
            l_sk=TenantSecretAuth(live_key["key"]),
            s_sk=TenantSecretAuth(sandbox_key["key"]),
            name=org_data["name"],
            db_auths=[auth_token, h_is_live],
            auth_token=auth_token,
            ro_db_auths=[ro_auth_token, h_is_live],
            ro_auth_token=ro_auth_token,
            default_ob_config=None,  # Will populate this after making OB config
        )
        ob_config = create_ob_config(tenant, **ob_conf_data)
        # Circular reference, but worth it for simplicity of writing tests
        tenant = tenant._replace(default_ob_config=ob_config)
        return tenant

    return try_until_success(inner, 10)

def create_partner_tenant(org_data):
    def inner():
        body = post("private/test_partner_tenant", org_data, CUSTODIAN_AUTH)
        print("\n======partner org info======")
        print(body)

        auth_token = DashboardAuth(body["auth_token"])
        ro_auth_token = DashboardAuth(body["ro_auth_token"])
        return PartnerTenant(
            id=body["partner_tenant_id"],
            name=org_data["name"],
            db_auths=[auth_token],
            auth_token=auth_token,
            ro_db_auths=[ro_auth_token],
            ro_auth_token=ro_auth_token,
        )

    return try_until_success(inner, 10)


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
    document_types_and_countries=None
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
        "document_types_and_countries": document_types_and_countries,
    }
    # TODO also make this get or create?
    auths = override_auths if override_auths else tenant.db_auths
    body = post("org/onboarding_configs", ob_conf_data, *auths)
    ob_config = ObConfiguration.from_response(body, tenant)
    print("\n======org onboarding info======")
    print(body)
    return ob_config


def clean_up_user(phone_number, email):
    # The cleanup API is picky about spaces...
    phone_number = phone_number.replace(" ", "")
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
    return f"footprint_it_{seed}"


def _gen_random_ssn():
    return _gen_random_n_digit_number(9)


def _gen_random_str(length):
    return "".join(random.choice(string.ascii_letters) for _ in range(length))


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
