import arrow
from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient
from tests.utils import get, post, patch
from tests.headers import FpAuth


def test_historical_decrypt_by_timestamp(sandbox_tenant):
    # Shift a little for clock skew
    start_time = arrow.now().shift(minutes=-1).isoformat()

    # Onboard onto a playbook as a fail - should show up
    bifrost1 = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost1.run()

    # Make a second onboarding
    data = dict(kind="onboard", key=sandbox_tenant.default_ob_config.key.value)
    body = post(f"users/{user.fp_id}/token", data, sandbox_tenant.s_sk)
    token = FpAuth(body["token"])
    token = IdentifyClient.from_token(token).inherit()
    bifrost2 = BifrostClient.raw_auth(
        sandbox_tenant.default_ob_config, token, bifrost1.sandbox_id
    )
    # Add new data during second onboarding
    new_data = {
        "id.first_name": "New name",
        "id.last_name": "New last name",
        "id.ssn9": "123431234",
    }
    patch("hosted/user/vault", new_data, bifrost2.auth_token)
    user = bifrost2.run()

    # Fetch the timestamps of each decision
    body = get(f"users/{user.fp_id}/decisions", None, sandbox_tenant.s_sk)
    decisions = body["data"]

    end_time = arrow.now().shift(minutes=1).isoformat()

    TESTS = [
        (None, new_data),
        (end_time, new_data),
        (decisions[0]["timestamp"], new_data),
        (decisions[1]["timestamp"], bifrost1.data),
        (start_time, {}),
    ]
    for i, (timestamp, expected_data) in enumerate(TESTS):
        fields = ["id.first_name", "id.last_name", "id.ssn9"]
        data = dict(version_at=timestamp, fields=fields, reason="Historical decrypt")
        body = post(f"users/{user.fp_id}/vault/decrypt", data, sandbox_tenant.s_sk)
        for k in fields:
            assert body[k] == expected_data.get(k, None)


def test_historical_decrypt_validation(sandbox_tenant, sandbox_user):
    data = dict(
        version_at=arrow.now().isoformat(),
        fields=["id.first_name", "id.last_name:1234"],
        reason="Historical decrypt",
    )
    body = post(
        f"users/{sandbox_user.fp_id}/vault/decrypt",
        data,
        sandbox_tenant.s_sk,
        status_code=400,
    )
    assert (
        body["message"]
        == "Cannot provide both `version_at` and inline per-field versions."
    )
