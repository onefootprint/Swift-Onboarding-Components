import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import get


@pytest.fixture(scope="session")
def sandbox_user_with_insights(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    return bifrost.run()


def test_get_users_list(sandbox_user_with_insights):
    tenant = sandbox_user_with_insights.tenant
    body = get(
        f"entities/{sandbox_user_with_insights.fp_id}/user_insights",
        None,
        *tenant.db_auths,
    )

    for insight in body:
        assert insight["name"]
        assert insight["value"]
        assert insight["scope"]
        assert len(insight["description"]) > 0
        assert insight["unit"]
