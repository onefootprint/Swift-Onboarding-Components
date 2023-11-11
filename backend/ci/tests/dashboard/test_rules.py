import pytest
from tests.utils import (
    create_ob_config,
    get,
    post,
)


@pytest.fixture(scope="function")
def obc(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )


@pytest.mark.parametrize(
    "data",
    [
        dict(
            name="My awesome rule",
            rule_expression="A or B",
            action="pass_with_manual_review",
        ),
        dict(
            name="My awesome rule",
            rule_expression="B or C",
            action="step_up",
        ),
        dict(
            name="My awesome rule",
            rule_expression="D and E",
            action="manual_review",
        ),
        dict(
            name="My awesome rule",
            rule_expression="F",
            action="fail",
        ),
        dict(
            name=None,
            rule_expression="",
            action="fail",
        ),
    ],
)
def test_create(sandbox_tenant, data):
    res = post(
        f"/org/onboarding_configs/{sandbox_tenant.default_ob_config.id}/rule",
        data,
        *sandbox_tenant.db_auths,
    )

    # TODO: assert actor later
    assert res["rule_id"] is not None
    assert res["created_at"] is not None
    assert res["name"] == data["name"]
    assert res["rule_expression"] == data["rule_expression"]
    assert res["action"] == data["action"]
    assert res["is_shadow"] == True


def test_list(sandbox_tenant, obc):
    rules = [
        post(
            f"/org/onboarding_configs/{obc.id}/rule",
            dict(
                rule_expression="",
                action="fail",
            ),
            *sandbox_tenant.db_auths,
        )
        for _ in range(6)
    ]

    res = get(
        f"/org/onboarding_configs/{obc.id}/rules",
        None,
        *sandbox_tenant.db_auths,
    )
    for i in range(len(rules)):
        assert res[i]["rule_id"] == rules[i]["rule_id"]
        assert res[i]["created_at"] == rules[i]["created_at"]
        assert res[i]["name"] == rules[i]["name"]
        assert res[i]["rule_expression"] == rules[i]["rule_expression"]
        assert res[i]["action"] == rules[i]["action"]
        assert res[i]["is_shadow"] == rules[i]["is_shadow"]
