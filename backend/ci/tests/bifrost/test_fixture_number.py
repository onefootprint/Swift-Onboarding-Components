from tests.utils import _gen_random_n_digit_number, post
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER


def test_one_click(sandbox_tenant, tenant, twilio):
    seed = _gen_random_n_digit_number(10)
    phone_number = f"{FIXTURE_PHONE_NUMBER}#sandbox{seed}"
    ob_config = sandbox_tenant.default_ob_config

    identify_data = dict(identifier=dict(phone_number=phone_number))
    body = post("hosted/identify", identify_data, ob_config.key)
    assert not body["user_found"]

    bifrost = BifrostClient(ob_config, twilio, override_create_phone=phone_number)
    bifrost.run()
    assert bifrost.handled_requirements

    # User exists now, but shouldn't be able to find it without exact tenant auth
    body = post("hosted/identify", identify_data)
    assert not body["user_found"]
    body = post("hosted/identify", identify_data, tenant.default_ob_config.key)
    assert not body["user_found"]
    body = post("hosted/identify", identify_data, ob_config.key)
    assert body["user_found"]

    bifrost2 = BifrostClient(ob_config, twilio, override_inherit_phone=phone_number)
    bifrost2.run()
    assert not bifrost2.handled_requirements


def test_identify_fixture_phone_number_non_sandbox(sandbox_tenant):
    data = dict(phone_number=FIXTURE_PHONE_NUMBER)
    body = post(
        "hosted/identify/signup_challenge", data, sandbox_tenant.default_ob_config.key
    )
    challenge_token = body["challenge_data"]["challenge_token"]

    # Fixture code of 000000 shouldn't work in prod
    data = {
        "challenge_response": "000000",
        "challenge_kind": "sms",
        "challenge_token": challenge_token,
    }
    post(
        "hosted/identify/verify",
        data,
        sandbox_tenant.default_ob_config.key,
        status_code=400,
    )
