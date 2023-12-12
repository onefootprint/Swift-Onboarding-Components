import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config, get, post, patch, delete


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
    assert res["is_shadow"] == False


def test_list(sandbox_tenant, obc):
    # Note: obc will have a default set of rules it is created with
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
    num_default_rules = len(res) - len(rules)
    for i in range(len(rules)):
        assert res[num_default_rules + i]["rule_id"] == rules[i]["rule_id"]
        assert res[num_default_rules + i]["created_at"] == rules[i]["created_at"]
        assert res[num_default_rules + i]["name"] == rules[i]["name"]
        assert (
            res[num_default_rules + i]["rule_expression"] == rules[i]["rule_expression"]
        )
        assert res[num_default_rules + i]["action"] == rules[i]["action"]
        assert res[num_default_rules + i]["is_shadow"] == rules[i]["is_shadow"]


def test_patch(sandbox_tenant, obc):
    # Note: obc will have a default set of rules it is created with
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
            is_shadow=True,
            rule_expression=[
                {"field": "document_selfie_glasses", "op": "eq", "value": True}
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    assert update2["name"] == "New Name"
    assert update2["is_shadow"] == True
    assert update2["rule_expression"] == [
        {"field": "document_selfie_glasses", "op": "eq", "value": True}
    ]

    rules = get(
        f"/org/onboarding_configs/{obc.id}/rules",
        None,
        *sandbox_tenant.db_auths,
    )
    assert rules[-1]["rule_expression"] == [
        {"field": "document_selfie_glasses", "op": "eq", "value": True}
    ]

    # a patch that contains no field to update should error
    patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule['rule_id']}",
        dict(),
        *sandbox_tenant.db_auths,
        status_code=400,
    )


def test_get_rule_set_result(
    sandbox_tenant, twilio, must_collect_data, live_phone_number
):
    obc = create_ob_config(
        sandbox_tenant, "Rules yo", must_collect_data, must_collect_data
    )

    rule1 = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="My awesome rule",
            rule_expression=[
                {"field": "ssn_does_not_match", "op": "eq", "value": True}
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )
    rule2 = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="My awesome rule",
            rule_expression=[{"field": "id_flagged", "op": "not_eq", "value": True}],
            action="manual_review",
        ),
        *sandbox_tenant.db_auths,
    )

    bifrost = BifrostClient.new(obc, twilio)
    user = bifrost.run()

    rule_set_result = get(
        f"entities/{user.fp_id}/rule_set_result", None, *sandbox_tenant.db_auths
    )

    assert rule_set_result["ob_configuration_id"] == obc.id
    assert rule_set_result["action_triggered"] == "manual_review"
    assert rule_set_result["rule_results"][-2]["rule"] == rule1
    assert rule_set_result["rule_results"][-2]["result"] == False
    assert rule_set_result["rule_results"][-1]["rule"] == rule2
    assert rule_set_result["rule_results"][-1]["result"] == True


def test_delete(sandbox_tenant, obc):
    # Setup a few rules
    rule1 = post(
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
    rule2 = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="Cool Rule",
            rule_expression=[
                {"field": "ssn_does_not_match", "op": "eq", "value": True}
            ],
            action="manual_review",
        ),
        *sandbox_tenant.db_auths,
    )
    rule3 = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="Cool Rule",
            rule_expression=[
                {"field": "name_does_not_match", "op": "eq", "value": True}
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )
    # also update rule3 just exercise updates + deletes together
    patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule3['rule_id']}",
        dict(name="New Name"),
        *sandbox_tenant.db_auths,
    )

    # Test DELETE

    # delete rule2
    delete(
        f"/org/onboarding_configs/{obc.id}/rules/{rule2['rule_id']}",
        dict(name="New Name"),
        *sandbox_tenant.db_auths,
    )

    rules = [
        r["rule_id"]
        for r in get(
            f"/org/onboarding_configs/{obc.id}/rules",
            None,
            *sandbox_tenant.db_auths,
        )
    ]
    assert len([r for r in rules if r in [rule1["rule_id"], rule3["rule_id"]]]) == 2

    # attempt to patch now deleted rule2 should error
    patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule2['rule_id']}",
        dict(name="uhoh"),
        *sandbox_tenant.db_auths,
        status_code=404,
    )

    # delete rule1
    delete(
        f"/org/onboarding_configs/{obc.id}/rules/{rule1['rule_id']}",
        dict(name="New Name"),
        *sandbox_tenant.db_auths,
    )

    # delete rule3
    delete(
        f"/org/onboarding_configs/{obc.id}/rules/{rule3['rule_id']}",
        dict(name="New Name"),
        *sandbox_tenant.db_auths,
    )

    assert (
        len(
            [
                r
                for r in get(
                    f"/org/onboarding_configs/{obc.id}/rules",
                    None,
                    *sandbox_tenant.db_auths,
                )
                if r["rule_id"]
                in [rule1["rule_id"], rule2["rule_id"], rule3["rule_id"]]
            ]
        )
        == 0
    )
