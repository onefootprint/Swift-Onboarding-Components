import pytest
from tests.utils import _gen_random_n_digit_number, post, create_ob_config
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER


@pytest.fixture(scope="session")
def ob_config2(sandbox_tenant, must_collect_data, can_access_data):
    ob_conf_data = {
        "name": "Acme Bank Card 2",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


@pytest.mark.parametrize("use_phone", [True, False])
def test_one_click(sandbox_tenant, ob_config2, tenant, twilio, use_phone):
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
    if use_phone:
        identifier = dict(phone_number=bifrost.data["id.phone_number"])
    else:
        identifier = dict(email=bifrost.data["id.email"])
    print(identifier)
    data = dict(identifier=identifier)
    body = post("hosted/identify", data)
    assert not body["user_found"]
    body = post("hosted/identify", data, tenant.default_ob_config.key)
    assert not body["user_found"]
    body = post("hosted/identify", data, ob_config.key)
    assert body["user_found"]

    bifrost2 = BifrostClient(ob_config2, twilio, override_inherit_phone=phone_number)
    bifrost2.run()
    assert set(i["kind"] for i in bifrost2.handled_requirements) == {
        "authorize",
        "process",
    }
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {"collect_data"}


def test_identify_fixture_phone_number_non_sandbox(sandbox_tenant):
    # Fixture number shouldn't even work in prod
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER),
        sandbox_tenant.default_ob_config.key,
        status_code=400,
    )
