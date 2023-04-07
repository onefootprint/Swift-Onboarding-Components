import pytest
from tests.dashboard.utils import latest_access_event_for
from tests.bifrost_client import BifrostClient
from tests.utils import get, post
from tests.constants import IP_DATA


@pytest.fixture(scope="session")
def sb_user_with_investor_profile(sandbox_tenant, investor_profile_ob_config, twilio):
    bifrost = BifrostClient(investor_profile_ob_config, twilio)
    user = bifrost.run(sandbox_tenant)
    body = get("entities", dict(kind="person"), sandbox_tenant.sk.key)
    entity = body["data"][0]
    assert set(entity["attributes"]) > set(IP_DATA)
    return user


def test_get_vault(sandbox_tenant, sb_user_with_investor_profile):
    body = get(
        f"entities/{sb_user_with_investor_profile.fp_id}/vault",
        None,
        sandbox_tenant.sk.key,
    )
    populated_keys = set(k for (k, v) in body.items() if v)
    assert populated_keys > set(IP_DATA)


@pytest.mark.parametrize(
    "fields_to_decrypt",
    [
        [
            "investor_profile.occupation",
            "investor_profile.brokerage_firm_employer",
            "investor_profile.annual_income",
            "investor_profile.net_worth",
        ],
        ["investor_profile.risk_tolerance", "investor_profile.declarations"],
        ["investor_profile.net_worth"],
    ],
)
def test_decrypt(sandbox_tenant, sb_user_with_investor_profile, fields_to_decrypt):
    data = dict(
        fields=fields_to_decrypt,
        reason="Doing a business hecking decrypt",
    )
    body = post(
        f"entities/{sb_user_with_investor_profile.fp_id}/vault/decrypt",
        data,
        sandbox_tenant.sk.key,
    )
    for field in fields_to_decrypt:
        assert body[field] == IP_DATA.get(field)

    access_event = latest_access_event_for(
        sb_user_with_investor_profile.fp_id, sandbox_tenant.sk
    )
    assert set(access_event["targets"]) == set(fields_to_decrypt)
