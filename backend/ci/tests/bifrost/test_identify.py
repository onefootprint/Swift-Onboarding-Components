from tests.utils import _gen_random_n_digit_number, post


FIXTURE_PHONE_NUMBER = "+15555550100"


def test_identify_fixture_phone_number(sandbox_tenant):
    seed = _gen_random_n_digit_number(10)
    phone_number = f"{FIXTURE_PHONE_NUMBER}#sandbox{seed}"

    data = dict(phone_number=phone_number)
    body = post(
        "hosted/identify/signup_challenge", data, sandbox_tenant.default_ob_config.key
    )
    challenge_token = body["challenge_data"]["challenge_token"]

    data = {
        # Fixture code is always 000000 for this phone number
        "challenge_response": "000000",
        "challenge_kind": "sms",
        "challenge_token": challenge_token,
    }
    post("hosted/identify/verify", data, sandbox_tenant.default_ob_config.key)


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
