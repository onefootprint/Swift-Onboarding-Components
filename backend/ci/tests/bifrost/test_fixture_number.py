import pytest
from tests.utils import _gen_random_sandbox_id, post, create_ob_config
from tests.headers import SandboxId
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
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    ob_config = sandbox_tenant.default_ob_config

    identify_data = dict(identifier=dict(phone_number=FIXTURE_PHONE_NUMBER))
    body = post("hosted/identify", identify_data, ob_config.key, sandbox_id_h)
    assert not body["user_found"]

    bifrost = BifrostClient.create(ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id)
    bifrost.run()
    assert bifrost.handled_requirements

    # User exists now, but shouldn't be able to find it without exact tenant auth
    if use_phone:
        identifier = dict(phone_number=bifrost.data["id.phone_number"])
    else:
        identifier = dict(email=bifrost.data["id.email"])

    data = dict(identifier=identifier)
    body = post("hosted/identify", data, sandbox_id_h)
    assert not body["user_found"]
    body = post("hosted/identify", data, tenant.default_ob_config.key, sandbox_id_h)
    assert not body["user_found"]
    body = post("hosted/identify", data, ob_config.key, sandbox_id_h)
    assert body["user_found"]

    bifrost2 = BifrostClient.inherit(
        ob_config2, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost2.run()
    assert [i["kind"] for i in bifrost2.handled_requirements] == [
        "authorize",
        "process",
    ]
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {"collect_data"}


def test_identify_fixture_phone_number_non_sandbox(sandbox_tenant):
    # Should work with sandbox id
    sandbox_id = _gen_random_sandbox_id()
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER),
        sandbox_tenant.default_ob_config.key,
        SandboxId(sandbox_id),
    )

    # Fixture number shouldn't even work in prod
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER),
        sandbox_tenant.default_ob_config.key,
        status_code=400,
    )
