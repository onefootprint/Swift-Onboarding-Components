import arrow
import pytest
from tests.utils import post, create_ob_config, get, patch
from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.headers import FpAuth, SandboxId
from tests.constants import FIXTURE_PHONE_NUMBER, EMAIL, ENVIRONMENT


@pytest.fixture(scope="session")
def ob_config(sandbox_tenant, must_collect_data):
    ob_conf_data = {
        "name": "Acme Bank Progressive Config",
        "must_collect_data": must_collect_data,
        "can_access_data": must_collect_data,
    }
    return create_ob_config(sandbox_tenant, **ob_conf_data)


def test_onboarded_vault(ob_config, sandbox_tenant):
    """
    Test creating a token for a user who has already onboarded onto a KYC playbook.
    Run that token through bifrost onboarding onto a different playbook.
    """
    bifrost = BifrostClient.new(ob_config)
    user = bifrost.run()

    # Go through onboarding with a token made from a user that already onboarded
    obc = sandbox_tenant.default_ob_config
    data = dict(kind="onboard", key=obc.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    # Run bifrost
    bifrost2 = BifrostClient.raw_auth(obc, auth_token, user.client.sandbox_id)
    user2 = bifrost2.run()
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]
    assert user2.fp_id == user.fp_id


def test_api_vault(sandbox_tenant, ob_config):
    """
    Test creating a token for a user created via API. Run that token through bifrost.
    """
    initial_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": EMAIL,
    }
    body = post("users", initial_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    data = dict(kind="onboard", key=ob_config.key.value)
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Don't allow email challenge to log in
    data = dict(preferred_challenge_kind="email")
    body = post("hosted/identify/login_challenge", data, auth_token, status_code=400)
    assert body["error"]["message"] == "Cannot initiate a challenge of kind email"

    # Token should be unverified because this vault was made via API
    body = post("/hosted/identify", dict(identifier=None), auth_token)
    assert body["user_found"]
    assert body["is_unverified"]

    # Should require step up because auth was not implied for API vault
    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )
    # Ensure we can't edit the phone number once it's been verified
    body = patch(
        f"entities/{fp_id}/vault", initial_data, sandbox_tenant.sk.key, status_code=400
    )
    assert (
        body["error"]["message"]["id.phone_number"]
        == "Cannot replace verified contact information via API."
    )

    # Run bifrost
    bifrost = BifrostClient.raw_auth(ob_config, auth_token, sandbox_id)
    user = bifrost.run()
    assert [i["kind"] for i in bifrost.already_met_requirements] == ["authorize"]
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]
    assert user.fp_id == fp_id


def test_3p_auth(sandbox_tenant, ob_config):
    """
    Test creating a token for a user created via API with third party auth, where the tenant
    attests that the user authenticated with them.
    """
    initial_data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
    }
    body = post("users", initial_data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    data = dict(kind="onboard", key=ob_config.key.value, third_party_auth=True)
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes through 3p auth
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    # Run bifrost
    bifrost = BifrostClient.raw_auth(ob_config, auth_token, sandbox_id)
    user = bifrost.run()
    assert [i["kind"] for i in bifrost.already_met_requirements] == ["authorize"]
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]
    assert user.fp_id == fp_id

    assert all(
        i["kind"] == "third_party"
        for i in user.client.validate_response["user_auth"]["auth_events"]
    )


@pytest.mark.parametrize("operation_kind", ["onboard", "reonboard"])
def test_reonboard(ob_config, sandbox_tenant, operation_kind):
    """
    Test creating a token to onboard a user onto the same KYC playbook they already onboarded onto.
    Once with the reonboard convenience operation alias and again with the onboard operation
    """
    bifrost1 = BifrostClient.new(ob_config)
    user = bifrost1.run()

    # Onboard this user onto the same ob config twice. This should make two workflows and two decisions
    data = dict(kind=operation_kind)
    if operation_kind == "onboard":
        data["key"] = ob_config.key.value
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    bifrost2 = BifrostClient.raw_auth(ob_config, auth_token, bifrost1.sandbox_id)
    user2 = bifrost2.run()
    assert user2.fp_id == user.fp_id
    assert set(i["kind"] for i in bifrost2.already_met_requirements) == {
        "collect_data",
        "authorize",
    }
    assert [i["kind"] for i in bifrost2.handled_requirements] == ["process"]

    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    obds = [i["event"] for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 2
    assert all(
        i["data"]["decision"]["ob_configuration"]["id"] == ob_config.id for i in obds
    )


def test_provide_publishable_key_on_client(sandbox_tenant, ob_config):
    """
    Test omitting the publishable key when creating the user-specific token.
    Add the publishable key via POST /hosted/onboarding
    """
    bifrost1 = BifrostClient.new(ob_config)
    user = bifrost1.run()

    # Create a token not linked to an OBC
    data = dict(kind="user")
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    # TODO we should probably update this test to not inherit auth and instead require going through
    # the verify flow to make sure the logic there works
    body = get("hosted/user/token", None, auth_token)
    assert set(body["scopes"]) >= {"sign_up"}

    # Should require passing obc key
    body = post("hosted/onboarding", None, auth_token, status_code=400)
    assert body["error"]["message"] == "No playbook key provided"
    body = post(
        "hosted/onboarding", None, auth_token, sandbox_tenant.default_ob_config.key
    )

    # Run bifrost
    bifrost = BifrostClient.raw_auth(ob_config, auth_token, user.client.sandbox_id)
    bifrost.run()


def test_portablize_api_vault(sandbox_tenant, foo_sandbox_tenant, ob_config):
    """
    Test that we can portablize data on a vault initially created via API. We test this by
    one-click authing onto the user via another tenant
    """
    data = {
        "id.phone_number": FIXTURE_PHONE_NUMBER,
    }
    body = post("users", data, sandbox_tenant.sk.key)
    fp_id = body["id"]
    sandbox_id = body["sandbox_id"]

    # Test that the user isn't visible to be identified via phone number
    identify_data = dict(identifier=dict(phone_number=FIXTURE_PHONE_NUMBER))
    sandbox_id_h = SandboxId(sandbox_id)
    body = post("hosted/identify", identify_data, sandbox_id_h)
    assert not body["user_found"]

    data = dict(kind="onboard", key=ob_config.key.value)
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Token should be unverified because this vault was made via API
    body = post("/hosted/identify", dict(identifier=None), auth_token)
    assert body["user_found"]
    assert body["is_unverified"]

    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )

    # re-run Bifrost with the token from the link we sent to user
    bifrost = BifrostClient.raw_auth(ob_config, auth_token, sandbox_id)
    user = bifrost.run()
    assert user.fp_id == fp_id

    # And now check that the user can be identified by phone number
    body = post("hosted/identify", identify_data, sandbox_id_h)
    assert body["user_found"]
    assert not body["is_unverified"]
    assert set(body["available_challenge_kinds"]) >= {"sms"}

    # Now, one-click onboard onto another tenant!
    bifrost = BifrostClient.inherit(foo_sandbox_tenant.default_ob_config, sandbox_id)
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
        body = post("entities/search", dict(search=FIXTURE_PHONE_NUMBER), *t.db_auths)
        assert any(i["id"] == fp_id for i in body["data"])


@pytest.mark.skipif(
    ENVIRONMENT == "ci" or ENVIRONMENT == "ephemeral",
    reason="Cannot expect historical users in ci",
)
def test_no_implied_auth_for_stale(sandbox_tenant):
    """
    Here, we check that auth cannot be implied if the user hasn't logged in recently.
    NOTE: this is an inherently flaky test, but is very necessary to test a critical auth functionality.
    It will probably be fine in CI for dev/prod but could be problematic locally.
    There's probably a better, less-flaky way to test this.
    But, please don't remove this test without getting coverage for this elsewhere.
    """
    # Get an old user, who probably hasn't had any auths recently
    filters = dict(
        timestamp_lte=arrow.now().shift(hours=-1, minutes=-5).isoformat(),
        is_created_via_api=False,
        kind="person",
    )
    body = post("entities/search", filters, *sandbox_tenant.db_auths)
    assert all([not i["is_created_via_api"] for i in body["data"]])
    if not body["data"]:
        assert (
            False
        ), "No old user to use to test implied auth timeout. If you get this error running tests locally, it's likely safe to ignore. See the comment in this test"

    # Create a token and make sure it does not have implied auth
    fp_id = body["data"][0]["id"]
    obc = sandbox_tenant.default_ob_config
    data = dict(dict(kind="onboard", key=obc.key.value))
    body = post(f"users/{fp_id}/token", data, sandbox_tenant.sk.key)
    auth_token = FpAuth(body["token"])

    # Should immediately have onboarding scopes because auth was implied
    body = get("hosted/user/token", None, auth_token)
    assert not body["scopes"]


@pytest.mark.parametrize("operation_kind", ["inherit", "user", "reonboard"])
def test_error_with_key(sandbox_tenant, sandbox_user, operation_kind):
    """
    Ensure that we can't try to generate a token with operation including a playbook key AND
    an operation kind other than onboard
    """
    data = dict(kind=operation_kind, key=sandbox_tenant.default_ob_config.key.value)
    body = post(
        f"users/{sandbox_user.fp_id}/token",
        data,
        sandbox_tenant.sk.key,
        status_code=400,
    )
    assert body["error"]["message"] == f"Cannot provide playbook key for this operation"


def test_inherit_error_with_no_workflow_request(sandbox_tenant, sandbox_user):
    """
    Ensure that we return an HTTP 400 if you try to make a token with operation inherit and there
    is no outstanding WorkflowRequest
    """
    data = dict(kind="inherit")
    body = post(
        f"users/{sandbox_user.fp_id}/token",
        data,
        sandbox_tenant.sk.key,
        status_code=400,
    )
    assert body["error"]["message"] == "No outstanding info is requested from this user"


# TODO: test when we make a new vault via API that is already portable elsewhere...
