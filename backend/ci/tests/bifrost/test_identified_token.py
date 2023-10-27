import arrow
import pytest
from tests.utils import (
    clean_up_user,
    post,
    create_ob_config,
    get,
    step_up_user,
    patch,
)
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth, SandboxId
from tests.constants import FIXTURE_PHONE_NUMBER, LIVE_PHONE_NUMBER, EMAIL


@pytest.fixture(scope="module", autouse="true")
def cleanup():
    # Cleanup the non-sandbox user that is used across all integration test runs
    clean_up_user(LIVE_PHONE_NUMBER, EMAIL)


@pytest.fixture(scope="session")
def ob_config(sandbox_tenant, must_collect_data):
    ob_conf_data = {
        "name": "Acme Bank Progressive Config",
        "must_collect_data": must_collect_data,
        "can_access_data": must_collect_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_onboarded_vault(twilio, ob_config, sandbox_tenant):
    bifrost = BifrostClient.new(ob_config, twilio)
    user = bifrost.run()

    # Go through onboarding with a token made from a user that already onboarded
    data = dict(key=sandbox_tenant.default_ob_config.key.value)
    body = post(f"entities/{user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    # re-run Bifrost with the token from the link we sent to user
    bifrost2 = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config,
        auth_token,
        user.client.data["id.phone_number"],
        user.client.sandbox_id,
    )
    user2 = bifrost2.run()
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]
    assert user2.fp_id == user.fp_id


def test_api_vault(twilio, sandbox_tenant, ob_config):
    initial_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
    }
    body = post("users", initial_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    data = dict(key=ob_config.key.value)
    body = post(f"entities/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should require step up because auth was not implied for API vault
    auth_token = step_up_user(twilio, auth_token, FIXTURE_PHONE_NUMBER, True)
    # Ensure we can't edit the phone number once it's been verified
    body = patch(
        f"entities/{fp_id}/vault", initial_data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]["id.phone_number"]
        == "Cannot replace verified contact information via API."
    )

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        ob_config,
        auth_token,
        FIXTURE_PHONE_NUMBER,
        sandbox_id,
    )
    user = bifrost.run()
    assert [i["kind"] for i in bifrost.already_met_requirements] == ["authorize"]
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]
    assert user.fp_id == fp_id


def test_redo_onboard(twilio, ob_config, sandbox_tenant):
    bifrost1 = BifrostClient.new(ob_config, twilio)
    user = bifrost1.run()

    # Onboard this user onto the same ob config twice. This should make two workflows and two decisions
    data = dict(key=sandbox_tenant.default_ob_config.key.value)
    body = post(f"entities/{user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    bifrost2 = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config,
        auth_token,
        FIXTURE_PHONE_NUMBER,
        bifrost1.sandbox_id,
    )
    user2 = bifrost2.run()
    assert user2.fp_id == user.fp_id
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]

    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2


def test_portablize_api_vault(twilio, sandbox_tenant, foo_sandbox_tenant, ob_config):
    data = {
        "id.phone_number": LIVE_PHONE_NUMBER,
    }
    body = post("users", data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    # Test that the user isn't visible to be identified via phone number
    identify_data = dict(identifier=dict(phone_number=LIVE_PHONE_NUMBER))
    sandbox_id_h = SandboxId(sandbox_id)
    body = post("hosted/identify", identify_data, sandbox_id_h)
    assert not body["user_found"]

    data = dict(key=ob_config.key.value)
    body = post(f"entities/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    auth_token = step_up_user(twilio, auth_token, LIVE_PHONE_NUMBER, True)

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(
        ob_config,
        auth_token,
        LIVE_PHONE_NUMBER,
        sandbox_id,
    )
    user = bifrost.run()
    assert user.fp_id == fp_id

    # And now check that the user can be identified by phone number
    # Have to use LIVE_PHONE_NUMBER for this
    body = post("hosted/identify", identify_data, sandbox_id_h)
    assert body["user_found"]
    assert not body["is_unverified"]
    assert set(body["available_challenge_kinds"]) >= {"sms"}

    # Now, one-click onboard onto another tenant!
    bifrost = BifrostClient.inherit(
        foo_sandbox_tenant.default_ob_config,
        twilio,
        LIVE_PHONE_NUMBER,
        sandbox_id,
    )
    foo_user = bifrost.run()
    assert set(r["kind"] for r in foo_user.client.handled_requirements) == {
        "authorize",
        "process",
    }
    assert [r["kind"] for r in foo_user.client.already_met_requirements] == [
        "collect_data",
    ]
    assert foo_user.fp_id != user.fp_id

    # Make sure both tenants can find this user based on the phone's fingerprint
    for t, fp_id in [
        (sandbox_tenant, user.fp_id),
        (foo_sandbox_tenant, foo_user.fp_id),
    ]:
        body = get("/entities", dict(search=LIVE_PHONE_NUMBER), *t.db_auths)
        assert any(i["id"] == fp_id for i in body["data"])


# TODO: test when we make a new vault via API that is already portable elsewhere...
