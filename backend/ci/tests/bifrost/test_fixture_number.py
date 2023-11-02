import pytest
from tests.utils import _gen_random_sandbox_id, post, create_ob_config
from tests.headers import SandboxId, IsLive
from tests.bifrost_client import BifrostClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL


@pytest.fixture(scope="session")
def ob_config2(sandbox_tenant, must_collect_data):
    ob_conf_data = {
        "name": "Acme Bank Card 2",
        "must_collect_data": must_collect_data,
        "can_access_data": must_collect_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_one_click_same_tenant(sandbox_tenant, ob_config2, tenant, twilio):
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)

    identify_data = dict(identifier=dict(phone_number=FIXTURE_PHONE_NUMBER))
    body = post("hosted/identify", identify_data, ob_config2.key, sandbox_id_h)
    assert not body["user_found"]

    bifrost = BifrostClient.create(ob_config2, twilio, FIXTURE_PHONE_NUMBER, sandbox_id)
    bifrost.run()
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]

    # User exists now, but shouldn't be able to find it without exact tenant auth
    identifiers = [
        dict(phone_number=bifrost.data["id.phone_number"]),
        dict(email=bifrost.data["id.email"]),
    ]
    for identifier in identifiers:
        print(identifier)
        data = dict(identifier=identifier)
        # We're finding here. We make a global fingerprint earlier now? but it shouldn't be portablized
        # Ahhhh, we shouldn't be making global fingerprint for fixture number vault!
        body = post("hosted/identify", data, sandbox_id_h)
        assert not body["user_found"]
        body = post("hosted/identify", data, tenant.default_ob_config.key, sandbox_id_h)
        assert not body["user_found"]
        body = post("hosted/identify", data, ob_config2.key, sandbox_id_h)
        assert body["user_found"]

    bifrost2 = BifrostClient.inherit(
        sandbox_tenant.default_ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost2.run()
    assert [i["kind"] for i in bifrost2.handled_requirements] == [
        "process",
    ]
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "authorize",
        "collect_data",
    }


def test_one_click_same_tenant_no_decryption_bleeding(
    sandbox_tenant, ob_config2, twilio
):
    # If we onboard onto sandbox_tenant.default_ob_config first, the second onboarding _must_ require authorizing
    # default_ob_config doesn't have full decryption permissions - so if we automatically authorized
    # the second workflow, it would instantly grant decryption permissions to the second workflow
    # that the user didn't already have
    sandbox_id = _gen_random_sandbox_id()
    ob_config = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.create(ob_config, twilio, FIXTURE_PHONE_NUMBER, sandbox_id)
    bifrost.run()

    # Now onboard onto second ob config. This ob config needs access to more data than is already
    # granted by the first ob config, so it cannot be automatically authorized
    bifrost2 = BifrostClient.inherit(
        ob_config2, twilio, FIXTURE_PHONE_NUMBER, sandbox_id
    )
    bifrost2.run()
    assert [i["kind"] for i in bifrost2.handled_requirements] == [
        "authorize",
        "process",
    ]
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
    }


@pytest.mark.parametrize(
    "identifier", [dict(phone_number=FIXTURE_PHONE_NUMBER), dict(email=FIXTURE_EMAIL)]
)
def test_identify_fixture_non_sandbox(sandbox_tenant, identifier, skip_phone_obc):
    if "phone_number" in identifier:
        sandbox_obc = sandbox_tenant.default_ob_config
    if "email" in identifier:
        sandbox_obc = skip_phone_obc
    # Should work with sandbox id
    sandbox_id = _gen_random_sandbox_id()
    post(
        "hosted/identify/signup_challenge",
        identifier,
        sandbox_obc.key,
        SandboxId(sandbox_id),
    )

    # Have to make a live OBC to test using the fixture numebr in live mode
    live_obc = create_ob_config(
        sandbox_tenant,
        "skip phone",
        must_collect_data=["full_address", "name", "email"],
        can_access_data=["full_address", "name", "email"],
        optional_data=[],
        is_no_phone_flow=True,
        override_auths=[sandbox_tenant.auth_token, IsLive("true")],
    )
    # Fixture number shouldn't even work in prod
    body = post(
        "hosted/identify/signup_challenge",
        identifier,
        live_obc.key,
        status_code=400,
    )
    assert (
        body["error"]["message"]
        == "Cannot use fixture email or phone number in non-sandbox mode."
    )
