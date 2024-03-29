from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.utils import _gen_random_sandbox_id, _gen_random_ssn, get, post, patch
from tests.headers import FpAuth
from tests.constants import ID_DATA


def test_components_sdk(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    obc = sandbox_tenant.default_ob_config
    token = IdentifyClient(obc.key, sandbox_id).create_user()

    # Start the onboarding
    bifrost = BifrostClient.raw_auth(obc, token, sandbox_id)

    # Create a down-scoped token specifically for use by the components SDK
    data = dict(requested_scope="onboarding_components")
    body = post("hosted/user/tokens", data, token)
    downscoped_token = FpAuth(body["token"])
    assert downscoped_token.value != token.value

    # Ensure that the new token's scopes are less than the original and it expires at the same time
    token_body = get("hosted/user/token", None, token)
    downscoped_token_body = get("hosted/user/token", None, downscoped_token)
    assert set(downscoped_token_body["scopes"]) < set(token_body["scopes"])
    assert downscoped_token_body["expires_at"] == token_body["expires_at"]
    assert set(downscoped_token_body["scopes"]) == {"vault_data", "explicit_auth"}

    # Ensure that we cant use the downscoped_token to create a token with more permissions
    data = dict(requested_scope="onboarding")
    body = post("hosted/user/tokens", data, downscoped_token, status_code=400)
    assert body["error"]["message"] == "Cannot request additional scopes"

    # Vault some data using the downscoped_token and verify it was saved
    data = {
        **ID_DATA,
        "id.ssn9": _gen_random_ssn(),
    }
    patch("hosted/user/vault", data, downscoped_token)
    body = post("hosted/user/vault/decrypt", dict(fields=[k for k in ID_DATA]), token)
    assert all(body[k] == v.strip() for k, v in ID_DATA.items())

    # Make sure we can't use downscoped_token to decrypt or add login credentials
    # TODO should we make sure the downscoped token also can't be used in the identify flow?
    data = dict(fields=["id.first_name"])
    body = post("hosted/user/vault/decrypt", data, downscoped_token, status_code=401)
    assert (
        body["error"]["message"]
        == "Not allowed: required permission is missing: CanDecrypt<id.first_name>"
    )

    data = dict(kind="email", action_kind="add_primary")
    body = post("hosted/user/challenge", data, downscoped_token, status_code=401)
    assert (
        body["error"]["message"]
        == "Not allowed: required permission is missing: And<explicit_auth,Or<auth,sign_up>>"
    )

    # Then finish the rest of onboarding in normal Bifrost
    bifrost.run()
    # Should already have collect_data requirement met, from downscoped_token
    assert [i["kind"] for i in bifrost.handled_requirements] == ["liveness", "process"]
