import arrow
import pytest
from datetime import datetime, timedelta
from tests.bifrost_client import BifrostClient
from tests.utils import (
    _gen_random_str,
    _gen_random_sandbox_id,
    create_ob_config,
    get,
    post,
    patch,
    delete,
)


@pytest.fixture(scope="function")
def obc(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )


@pytest.mark.parametrize(
    "data,error",
    [
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "id_flagged", "op": "not_eq", "value": True}
                ],
                action="pass_with_manual_review",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "name_does_not_match", "op": "eq", "value": True}
                ],
                action="step_up.identity",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "dob_does_not_match", "op": "eq", "value": True}
                ],
                action="manual_review",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "address_does_not_match", "op": "eq", "value": True}
                ],
                action="fail",
            ),
            None,
        ),
        (
            dict(
                name=None,
                rule_expression=[
                    {"field": "ssn_does_not_match", "op": "eq", "value": True}
                ],
                action="fail",
            ),
            None,
        ),
        # mixing business rules and person rules
        (
            dict(
                name=None,
                rule_expression=[
                    {"field": "ssn_does_not_match", "op": "eq", "value": True},
                    {"field": "business_name_match", "op": "eq", "value": True},
                ],
                action="fail",
            ),
            "Cannot make a rule expression that includes both Person and Business signals",
        ),
    ],
)
def test_create(sandbox_tenant, data, error):
    obc1 = get(
        f"org/onboarding_configs/{sandbox_tenant.default_ob_config.id}",
        None,
        *sandbox_tenant.db_auths,
    )

    res = post(
        f"/org/onboarding_configs/{sandbox_tenant.default_ob_config.id}/rules",
        data,
        *sandbox_tenant.db_auths,
        status_code=400 if error is not None else 200,
    )
    if error is not None:
        assert res["error"]["message"] == error
        return

    # TODO: assert actor later
    assert res["rule_id"] is not None
    assert res["created_at"] is not None
    assert res["name"] == data["name"]
    assert res["rule_expression"] == data["rule_expression"]
    assert res["is_shadow"] == False
    assert res["action"] == data["action"]
    assert res["kind"] == "person"

    # OBC has rule_set.version and it has incremented from rule change
    obc2 = get(
        f"org/onboarding_configs/{sandbox_tenant.default_ob_config.id}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert obc2["rule_set"]["version"] == obc1["rule_set"]["version"] + 1

    business_rule = post(
        f"/org/onboarding_configs/{sandbox_tenant.default_ob_config.id}/rules",
        dict(
            name=None,
            rule_expression=[
                {"field": "business_name_match", "op": "eq", "value": True},
                {"field": "tin_not_found", "op": "eq", "value": True},
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )

    assert business_rule["kind"] == "business"


def test_list(sandbox_tenant, obc):
    # Note: obc will have a default set of rules it is created with
    rules = [
        post(
            f"/org/onboarding_configs/{obc.id}/rules",
            dict(
                rule_expression=[{"field": "id_flagged", "op": "eq", "value": True}],
                action="fail" if i % 2 == 0 else "step_up",
            ),
            *sandbox_tenant.db_auths,
        )
        for i in range(6)
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

    # a patch that has mixed person and business rule instance kind should error
    patch(
        f"/org/onboarding_configs/{obc.id}/rules/{rule['rule_id']}",
        dict(
            is_shadow=True,
            rule_expression=[
                {"field": "business_name_match", "op": "eq", "value": True},
                {"field": "document_selfie_glasses", "op": "eq", "value": True},
            ],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )


def test_get_rule_set_result(sandbox_tenant, must_collect_data):
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
            action="manual_review",
        ),
        *sandbox_tenant.db_auths,
    )
    rule2 = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="My awesome rule",
            rule_expression=[{"field": "id_flagged", "op": "not_eq", "value": True}],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )

    bifrost = BifrostClient.new(obc)
    user = bifrost.run()

    timeline = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
    stepup_event = [
        i for i in timeline if i["event"]["kind"] == "onboarding_decision"
    ].pop()

    # We currently have 2 API's for retrieving rule_set_results. The latter will be deprecated in favor of the former but in the meantime we'll test both
    rsr1 = get(
        f"entities/{user.fp_id}/rule_set_result/{stepup_event['event']['data']['decision']['rule_set_result_id']}",
        None,
        *sandbox_tenant.db_auths,
    )
    rsr2 = get(f"entities/{user.fp_id}/rule_set_result", None, *sandbox_tenant.db_auths)

    for rsr in [rsr1, rsr2]:
        assert rsr["ob_configuration_id"] == obc.id
        assert rsr["action_triggered"] == "fail"
        assert rsr["rule_results"][-2]["rule"] == rule1
        assert rsr["rule_results"][-2]["result"] == False
        assert rsr["rule_results"][-1]["rule"] == rule2
        assert rsr["rule_results"][-1]["result"] == True


def new_list(kind, entries, sandbox_tenant):
    nonce = _gen_random_str(5)
    return post(
        f"/org/lists",
        dict(
            name=f"Integration Test List {nonce}",
            alias=f"integration-test-list-{nonce}",
            kind=kind,
            entries=entries,
        ),
        *sandbox_tenant.db_auths,
    )


def test_ip_address_rules(sandbox_tenant, must_collect_data, can_access_data):
    # Flake note: requires a consistent client IP for the duration of the test.

    sandbox_id = _gen_random_sandbox_id()
    obc = create_ob_config(
        sandbox_tenant,
        "Baseline",
        must_collect_data,
        can_access_data,
        # These are the necessary arguments to skip KYC so the status is only
        # dependent on rules evaluation.
        skip_kyc=True,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.create(
        obc,
        override_sandbox_id=sandbox_id,
    )
    user = bifrost.run()
    fp_id = user.fp_id

    # Get the client IP address for the integration tests.
    user = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert len(user["workflows"]) == 1
    ip_address = user["workflows"][0]["insight_event"]["ip_address"]

    # The user should pass the default rules.
    assert user["status"] == "pass"

    ip_list_with_match = new_list("ip_address", [ip_address], sandbox_tenant)
    other_ip_address = "1.2.3.4"
    assert ip_address != other_ip_address
    ip_list_without_match = new_list("ip_address", [other_ip_address], sandbox_tenant)

    matching_rule = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="Should match",
            rule_expression=[
                {
                    "field": "ip_address",
                    "op": "is_in",
                    "value": ip_list_with_match["id"],
                },
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )
    non_matching_rule = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            name="Should not match",
            rule_expression=[
                {
                    "field": "ip_address",
                    "op": "is_in",
                    "value": ip_list_without_match["id"],
                },
            ],
            action="fail",
        ),
        *sandbox_tenant.db_auths,
    )

    # Rerun Bifrost in a new sandbox.
    sandbox_id = _gen_random_sandbox_id()
    bifrost = BifrostClient.create(
        obc,
        override_sandbox_id=sandbox_id,
    )
    user = bifrost.run()
    fp_id = user.fp_id

    timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
    stepup_event = [
        i for i in timeline if i["event"]["kind"] == "onboarding_decision"
    ].pop()
    rule_set_result_id = stepup_event["event"]["data"]["decision"]["rule_set_result_id"]

    # Get the client IP address for the integration tests.
    user = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
    assert len(user["workflows"]) == 1
    ip_address = user["workflows"][0]["insight_event"]["ip_address"]

    # The user should fail now with the custom rules.
    assert user["status"] == "fail"

    # Check the result of the rule evaluation.
    rsr = get(
        f"entities/{fp_id}/rule_set_result/{rule_set_result_id}",
        None,
        *sandbox_tenant.db_auths,
    )

    assert rsr["rule_results"][-2]["rule"]["rule_id"] == matching_rule["rule_id"]
    assert rsr["rule_results"][-2]["result"] == True

    assert rsr["rule_results"][-1]["rule"]["rule_id"] == non_matching_rule["rule_id"]
    assert rsr["rule_results"][-1]["result"] == False

    # Backtesting with no change yields the same result.
    start_timestamp = arrow.get(stepup_event["timestamp"]).shift(hours=-1)
    end_timestamp = start_timestamp.shift(hours=2)

    start_timestamp = datetime.fromisoformat(stepup_event["timestamp"]) - timedelta(hours=1)
    end_timestamp = start_timestamp + timedelta(hours=2)
    resp = post(f"org/onboarding_configs/{obc.id}/rules/evaluate", {
        "start_timestamp": start_timestamp.isoformat(),
        "end_timestamp": end_timestamp.isoformat(),
    }, *sandbox_tenant.db_auths)
    backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
    assert backtest_result["current_status"] == "fail"
    assert backtest_result["historical_action_triggered"] == "fail"

    # TODO: Backtesting with the matching rule deleted yields a pass.


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


def test_multi_edit(sandbox_tenant, obc):
    # When OBC's are created they are given a default set of rules
    default_rules = get(
        f"/org/onboarding_configs/{obc.id}/rules",
        None,
        *sandbox_tenant.db_auths,
    )

    # edit 2 rules, add 2 new ones, and delete the rest
    rules = patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "address_located_is_not_standard_hospital",
                            "op": "eq",
                            "value": True,
                        }
                    ],
                ),
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "address_located_is_not_standard_college",
                            "op": "eq",
                            "value": True,
                        }
                    ],
                ),
            ],
            edit=[
                dict(
                    rule_id=default_rules[0]["rule_id"],
                    rule_expression=[
                        {
                            "field": "browser_automation",
                            "op": "eq",
                            "value": True,
                        }
                    ],
                ),
                dict(
                    rule_id=default_rules[1]["rule_id"],
                    rule_expression=[
                        {
                            "field": "browser_tampering",
                            "op": "eq",
                            "value": True,
                        }
                    ],
                ),
            ],
            delete=[r["rule_id"] for r in default_rules[2:]],
        ),
        *sandbox_tenant.db_auths,
    )

    # should have 4 rules now: 2 we edited (and did not delete) and 2 new ones we added
    assert set([r["rule_expression"][0]["field"] for r in rules]) == set(
        [
            "address_located_is_not_standard_hospital",
            "address_located_is_not_standard_college",
            "browser_automation",
            "browser_tampering",
        ]
    )

    # assert rule_set.version has incremented on OBC
    reloaded_obc = get(
        f"org/onboarding_configs/{obc.id}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert reloaded_obc["rule_set"]["version"] == 2

    # trying to edit rules to mix business and person should error
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=2,
            add=[],
            edit=[
                dict(
                    rule_id=default_rules[0]["rule_id"],
                    rule_expression=[
                        {
                            "field": "business_name_match",
                            "op": "eq",
                            "value": True,
                        },
                        {
                            "field": "browser_tampering",
                            "op": "eq",
                            "value": True,
                        },
                    ],
                ),
            ],
            delete=[],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # trying to add rules to mix business and person should error
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=2,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "business_name_match",
                            "op": "eq",
                            "value": True,
                        },
                        {
                            "field": "browser_tampering",
                            "op": "eq",
                            "value": True,
                        },
                    ],
                ),
            ],
            edit=[],
            delete=[],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # however, if you edit a rule to be totally business that's fine
    rules = patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=2,
            add=[],
            edit=[
                dict(
                    rule_id=default_rules[0]["rule_id"],
                    rule_expression=[
                        {
                            "field": "business_name_match",
                            "op": "eq",
                            "value": True,
                        },
                        {
                            "field": "tin_does_not_match",
                            "op": "eq",
                            "value": True,
                        },
                    ],
                ),
            ],
            delete=[],
        ),
        *sandbox_tenant.db_auths,
        status_code=200,
    )

    # we now have 4 rules, and 1 has 2 business related rules inside
    assert len(rules) == 4
    assert set(["person", "business"]) == set([r["kind"] for r in rules])

    all_fields = []
    for r in rules:
        for re in r["rule_expression"]:
            all_fields.append(re["field"])
    assert set(all_fields) == set(
        [
            "address_located_is_not_standard_hospital",
            "address_located_is_not_standard_college",
            "business_name_match",
            "tin_does_not_match",
            "browser_tampering",
        ]
    )

    # assert rule_set.version has incremented on OBC
    obc = get(
        f"org/onboarding_configs/{obc.id}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert obc["rule_set"]["version"] == 3


def test_blocklist_rules(sandbox_tenant, obc):
    nonce = _gen_random_str(5)
    list = post(
        f"/org/lists",
        dict(
            name=f"Some Real Baddies {nonce}",
            alias=f"some_real_baddies_{nonce}",
            kind="ssn9",
        ),
        *sandbox_tenant.db_auths,
    )

    # creating a blocklist rule using the newly created list's id works
    rules = patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.ssn9",
                            "op": "is_in",
                            "value": list["id"],
                        }
                    ],
                )
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    assert rules[-1]["rule_expression"] == [
        {"field": "id.ssn9", "op": "is_in", "value": list["id"]}
    ]

    # error if an unknown list id is given
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "ip.ssn9",
                            "op": "is_in",
                            "value": list["id"],
                        }
                    ],
                ),
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "ip.ssn9",
                            "op": "is_in",
                            "value": "lst_abc123",
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )


# TODO: add vault data rule validation tests
