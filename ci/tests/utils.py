import base64
import json
import random
import arrow
import time
import os 

from .constants import D2P_AUTH_HEADER, FPUSER_AUTH_HEADER, MY1FP_AUTH_HEADER, TENANT_AUTH_HEADER, TENANT_SECRET_HEADER

url = lambda path: "{}/{}".format(os.environ.get('TEST_URL'), path)

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

def _gen_random_ssn():
    return _gen_random_n_digit_number(9)

def _client_pub_key_headers(client_public_key):
    return {
        TENANT_AUTH_HEADER: client_public_key,
    }

def _client_priv_key_headers(client_priv_key):
    return {
        TENANT_SECRET_HEADER: client_priv_key,
    }

def _fpuser_auth_headers(request):
    return _fpuser_auth_header_raw(request.config.cache.get("fpuser_auth_token", None))

def _my1fp_auth_headers(request):
    return _my1fp_auth_header_raw(request.config.cache.get("my1fp_auth_token", None))

def _fpuser_auth_header_raw(value):
    return {
        FPUSER_AUTH_HEADER: value
    }
def _my1fp_auth_header_raw(value):
    return {
        MY1FP_AUTH_HEADER: value
    }

def _d2p_auth_header_raw(value):
    return {
        D2P_AUTH_HEADER: value
    }

def _assert_response(response, status_code=200, msg="Incorrect status code"):
    if response.status_code != status_code:
        print(response.content)
        assert False, msg
    return response.json()

def _pretty_print_json_str(o):
    print(_pretty_print_json(json.loads(o)))

def _pretty_print_json(o):
    print(json.dumps(o, indent=4, sort_keys=True))

def _b64_decode(v):
    return base64.urlsafe_b64decode(v + '=' * (-len(v) % 4))

def _b64_encode(v):
    return base64.urlsafe_b64encode(v).decode('ascii').rstrip('=')