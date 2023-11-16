import pytest
from tests.utils import create_ob_config, get, post, patch


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
            rule_expression=[{"field": "id_flagged", "op": "not_eq", "value": True}],
            action="pass_with_manual_review",
        ),
        dict(
            name="My awesome rule",
            rule_expression=[
                {"field": "name_does_not_match", "op": "eq", "value": True}
            ],
            action="step_up",
        ),
        dict(
            name="My awesome rule",
            rule_expression=[
                {"field": "dob_does_not_match", "op": "eq", "value": True}
            ],
            action="manual_review",
        ),
        dict(
            name="My awesome rule",
            rule_expression=[
                {"field": "address_does_not_match", "op": "eq", "value": True}
            ],
            action="fail",
        ),
        dict(
            name=None,
            rule_expression=[
                {"field": "ssn_does_not_match", "op": "eq", "value": True}
            ],
            action="fail",
        ),
    ],
)
def test_create(sandbox_tenant, data):
    res = post(
        f"/org/onboarding_configs/{sandbox_tenant.default_ob_config.id}/rules",
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
            f"/org/onboarding_configs/{obc.id}/rules",
            dict(
                rule_expression=[{"field": "id_flagged", "op": "eq", "value": True}],
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


def test_patch(sandbox_tenant, obc):
    rule = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="Cool Rule",
            rule_expression=[
                {"field": "document_selfie_mask", "op": "eq", "value": True}
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )

    update1 = patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule['rule_id']}",
        dict(name="New Name"),
        *sandbox_tenant.db_auths,
    )

    assert update1["rule_id"] == rule["rule_id"]
    assert update1["name"] == "New Name"

    update2 = patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule['rule_id']}",
        dict(
            is_shadow=False,
            rule_expression=[
                {"field": "document_selfie_glasses", "op": "eq", "value": True}
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    assert update2["name"] == "New Name"
    assert update2["is_shadow"] == False
    assert update2["rule_expression"] == [
        {"field": "document_selfie_glasses", "op": "eq", "value": True}
    ]

    rules = get(
        f"/org/onboarding_configs/{obc.id}/rules",
        None,
        *sandbox_tenant.db_auths,
    )
    assert len(rules) == 1
    assert rules[0]["rule_expression"] == [
        {"field": "document_selfie_glasses", "op": "eq", "value": True}
    ]
