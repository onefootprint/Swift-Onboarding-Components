from tests.identify_client import IdentifyClient
from tests.bifrost_client import BifrostClient
from tests.utils import _gen_random_sandbox_id, post, get


def test_in_progress_onboardings(sandbox_tenant, foo_sandbox_tenant):
    body = get("org/member", None, *sandbox_tenant.db_auths)
    email = body["email"]

    # Create an API-only vault with the same email as the logged-in dashboard user
    body = post("users", {"id.email": email}, sandbox_tenant.s_sk)
    fp_id1 = body["id"]

    # Create a fully-onboarded user with the same email as the logged-in dashboard user
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(
        sandbox_tenant.default_ob_config, sandbox_id, email=email
    ).create_user()
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )
    user = bifrost.run()
    fp_id2 = user.fp_id

    # Create a user with the same email as the logged-in dashboard user that is _not_ fully onboarded
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(
        sandbox_tenant.default_ob_config, sandbox_id, email=email
    ).create_user()
    bifrost = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, auth_token, sandbox_id
    )
    fp_id3 = get("hosted/user/private_info", None, bifrost.auth_token)["fp_id"]

    # Only fp_id3 should show in in-progress onboardings
    data = dict(is_live="false")
    body = get("org/member/in_progress_onboardings", data, *sandbox_tenant.db_auths)
    assert not any(i["fp_id"] == fp_id1 for i in body)
    assert not any(i["fp_id"] == fp_id2 for i in body)
    ob = next(i for i in body if i["fp_id"] == fp_id3)
    assert ob["status"] == "incomplete"
    assert ob["tenant"]["name"] == sandbox_tenant.name
