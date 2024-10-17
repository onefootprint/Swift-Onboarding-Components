import pytest
from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.utils import (
    HttpError,
    _gen_random_sandbox_id,
    _gen_random_ssn,
    get,
    post,
    patch,
)
from tests.headers import FpAuth, IsComponentsSdk
from tests.constants import BUSINESS_DATA, CDO_TO_DIS, ID_DATA, FIXTURE_EMAIL


def create_user_with_components_token(tenant, obc=None):
    sandbox_id = _gen_random_sandbox_id()

    if obc is None:
        obc = tenant.default_ob_config

    token = (
        IdentifyClient(obc, sandbox_id)
        .with_headers(IsComponentsSdk("true"))
        .create_user()
    )

    # Start the onboarding
    bifrost = BifrostClient.raw_auth(obc, token, sandbox_id)

    # Create a down-scoped token specifically for use by the components SDK
    data = dict(requested_scope="onboarding_components")
    body = post("hosted/user/tokens", data, token)
    components_token = FpAuth(body["token"])
    assert components_token.value != token.value

    # Ensure that the new token's scopes are less than the original and it expires at the same time
    token_body = get("hosted/user/token", None, token)
    downscoped_token_body = get("hosted/user/token", None, components_token)
    assert set(downscoped_token_body["scopes"]) < set(token_body["scopes"])
    assert downscoped_token_body["expires_at"] == token_body["expires_at"]
    assert set(downscoped_token_body["scopes"]) == {"vault_data", "explicit_auth"}

    # Ensure that we cant use the components_token to create a token with more permissions
    data = dict(requested_scope="onboarding")
    body = post("hosted/user/tokens", data, components_token, status_code=400)
    assert body["message"] == "Cannot request additional scopes"

    return (components_token, token, bifrost)


def test_components_sdk(sandbox_tenant):
    (components_token, token, bifrost) = create_user_with_components_token(
        sandbox_tenant
    )

    # Vault some data using the components_token and verify it was saved
    vault_data = {
        **ID_DATA,
        "id.ssn9": _gen_random_ssn(),
    }
    patch("hosted/user/vault", vault_data, components_token)
    body = post("hosted/user/vault/decrypt", dict(fields=[k for k in ID_DATA]), token)
    assert all(body[k] == v.strip() for k, v in ID_DATA.items())

    # Make sure we can't use components_token to decrypt or add login credentials
    data = dict(fields=["id.first_name"])
    body = post("hosted/user/vault/decrypt", data, components_token, status_code=403)
    assert (
        body["message"]
        == "Not allowed: required permission is missing: CanDecrypt<id.first_name>"
    )

    # Make sure we can't use components_token in the identify flow
    with pytest.raises(
        HttpError,
        match="Cannot create a new token from one issued for the components SDK",
    ) as e:
        IdentifyClient.from_token(components_token).login()

    data = dict(kind="email", action_kind="add_primary")
    body = post("hosted/user/challenge", data, components_token, status_code=403)
    assert (
        body["message"]
        == "Not allowed: required permission is missing: And<explicit_auth,Or<auth,sign_up>>"
    )

    # Then finish the rest of onboarding in normal Bifrost
    user = bifrost.run()
    # Should already have collect_data requirement met, from components_token
    assert [i["kind"] for i in bifrost.handled_requirements] == ["liveness", "process"]

    # Ensure that the source of the saved data is components, including phone and email
    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert all(
        d["source"] == "components_sdk"
        for d in body["data"]
        if d["identifier"] != "id.verified_phone_number"
    )
    verified_phone = next(
        d for d in body["data"] if d["identifier"] == "id.verified_phone_number"
    )
    assert verified_phone["source"] == "hosted"

    # Ensure that we can log into the user we just created
    IdentifyClient.from_user(user).login()


def test_components_sdk_cannot_add_auth_methods(sandbox_tenant):
    (components_token, token, _) = create_user_with_components_token(sandbox_tenant)

    # We should be able to log in via unverified email
    body = post("hosted/identify", dict(scope="onboarding"), token)
    assert any(i["kind"] == "email" for i in body["user"]["auth_methods"])

    # Add a new email using the components SDK and then verify we can't use it to log in
    data = {"id.email": FIXTURE_EMAIL}
    body = patch("hosted/user/vault", data, components_token, status_code=400)
    assert body["code"] == "T120"
    assert body["context"]["id.email"] == "Not allowed to add this piece of data here"


def test_components_sdk_business(sandbox_tenant, kyb_sandbox_ob_config):
    (components_token, _, bifrost) = create_user_with_components_token(
        sandbox_tenant, kyb_sandbox_ob_config
    )
    data = {
        di: BUSINESS_DATA.get(di)
        for cdo in kyb_sandbox_ob_config.must_collect_data
        for di in CDO_TO_DIS[cdo]
        if di in BUSINESS_DATA
    }
    patch("hosted/business/vault", data, components_token)
    bifrost.run()
