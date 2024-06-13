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


def test_one_click_same_tenant(sandbox_tenant, ob_config2, tenant):
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)

    identify_data = dict(phone_number=FIXTURE_PHONE_NUMBER, scope="onboarding")
    body = post("hosted/identify", identify_data, ob_config2.key, sandbox_id_h)
    assert not body["user"]

    bifrost = BifrostClient.new_user(ob_config2, override_sandbox_id=sandbox_id)
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
        data = dict(**identifier, scope="onboarding")
        # We can find via global fingerprints without specifying OBC
        body = post("hosted/identify", data, sandbox_id_h)
        assert body["user"]
        # And find from another tenant (via global fingerprints)
        body = post("hosted/identify", data, tenant.default_ob_config.key, sandbox_id_h)
        assert body["user"]
        # And find at the current tenant when specifying OBC
        body = post("hosted/identify", data, ob_config2.key, sandbox_id_h)
        assert body["user"]

    bifrost2 = BifrostClient.inherit_user(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost2.run()
    assert [i["kind"] for i in bifrost2.handled_requirements] == [
        "process",
    ]
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "authorize",
        "collect_data",
    }


def test_one_click_same_tenant_no_decryption_bleeding(sandbox_tenant, ob_config2):
    # If we onboard onto sandbox_tenant.default_ob_config first, the second onboarding _must_ require authorizing
    # default_ob_config doesn't have full decryption permissions - so if we automatically authorized
    # the second workflow, it would instantly grant decryption permissions to the second workflow
    # that the user didn't already have
    ob_config = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new_user(ob_config)
    bifrost.run()

    # Now onboard onto second ob config. This ob config needs access to more data than is already
    # granted by the first ob config, so it cannot be automatically authorized
    bifrost2 = BifrostClient.inherit_user(ob_config2, bifrost.sandbox_id)
    bifrost2.run()
    assert [i["kind"] for i in bifrost2.handled_requirements] == [
        "authorize",
        "process",
    ]
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
    }


@pytest.mark.parametrize(
    "identifier",
    [
        dict(phone_number=dict(value=FIXTURE_PHONE_NUMBER)),
        dict(email=dict(value=FIXTURE_EMAIL)),
    ],
)
def test_identify_fixture_non_sandbox(sandbox_tenant, identifier, skip_phone_obc):
    if "phone_number" in identifier:
        sandbox_obc = sandbox_tenant.default_ob_config
    if "email" in identifier:
        sandbox_obc = skip_phone_obc
    # Should work with sandbox id
    sandbox_id = _gen_random_sandbox_id()
    data = dict(**identifier, scope="onboarding")
    post(
        "hosted/identify/signup_challenge", data, sandbox_obc.key, SandboxId(sandbox_id)
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
        data,
        live_obc.key,
        status_code=400,
    )
    assert (
        body["message"]
        == "Cannot use fixture email or phone number in non-sandbox mode."
    )
    body = post(
        "hosted/identify/signup_challenge",
        data,
        live_obc.key,
        SandboxId(sandbox_id),
        status_code=400,
    )
    assert (
        body["message"]
        == "Cannot use fixture email or phone number in non-sandbox mode."
    )
