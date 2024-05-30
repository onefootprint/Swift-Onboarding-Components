import arrow
import pytest
from tests.bifrost_client import BifrostClient
from tests.dashboard.utils import update_rules
from tests.utils import (
    _gen_random_str,
    create_ob_config,
    get,
    post,
    patch,
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
                rule_action="pass_with_manual_review",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "name_does_not_match", "op": "eq", "value": True}
                ],
                rule_action="step_up.identity",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "dob_does_not_match", "op": "eq", "value": True}
                ],
                rule_action="manual_review",
            ),
            None,
        ),
        (
            dict(
                name="My awesome rule",
                rule_expression=[
                    {"field": "address_does_not_match", "op": "eq", "value": True}
                ],
                rule_action="fail",
            ),
            None,
        ),
        (
            dict(
                name=None,
                rule_expression=[
                    {"field": "ssn_does_not_match", "op": "eq", "value": True}
                ],
                rule_action="fail",
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
                rule_action="fail",
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

    res = update_rules(
        obc1["id"],
        obc1["rule_set"]["version"],
        *sandbox_tenant.db_auths,
        add=[data],
        status_code=400 if error is not None else 200,
    )
    if error is not None:
        assert res["error"]["message"] == error
        return

    rule = next(r for r in res if r["rule_expression"] == data["rule_expression"])
    # TODO: assert actor later
    assert rule["rule_id"] is not None
    assert rule["created_at"] is not None
    assert rule["name"] == data["name"]
    assert rule["rule_expression"] == data["rule_expression"]
    assert rule["is_shadow"] == False
    assert rule["action"] == data["rule_action"]
    assert rule["kind"] == "person"

    # OBC has rule_set.version and it has incremented from rule change
    obc2 = get(
        f"org/onboarding_configs/{sandbox_tenant.default_ob_config.id}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert obc2["rule_set"]["version"] == obc1["rule_set"]["version"] + 1


def test_create_business_rule(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, must_collect_data
    )
    rule = dict(
        name="My fancy business rule",
        rule_expression=[
            {"field": "business_name_match", "op": "eq", "value": True},
            {"field": "tin_not_found", "op": "eq", "value": True},
        ],
        rule_action="fail",
    )
    res = update_rules(obc.id, 1, *sandbox_tenant.db_auths, add=[rule])
    rule = next(r for r in res if r["name"] == rule["name"])
    assert rule["kind"] == "business"


def test_list(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, must_collect_data
    )
    # Note: obc will have a default set of rules it is created with
    rules = [
        dict(
            name=f"Rule {i}",
            rule_expression=[{"field": "id_flagged", "op": "eq", "value": True}],
            rule_action="fail" if i % 2 == 0 else "step_up",
        )
        for i in range(6)
    ]
    res = update_rules(obc.id, 1, *sandbox_tenant.db_auths, add=rules)

    for rule in rules:
        r = next(r for r in res if r["name"] == rule["name"])
        assert r["rule_expression"] == rule["rule_expression"]
        expected_rule_action = (
            "step_up.identity"
            if rule["rule_action"] == "step_up"
            else rule["rule_action"]
        )
        assert r["action"] == expected_rule_action
        assert not r["is_shadow"]


def test_get_rule_set_result(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Rules yo", must_collect_data, must_collect_data
    )

    rule1 = dict(
        name="My awesome rule1",
        rule_expression=[{"field": "ssn_does_not_match", "op": "eq", "value": True}],
        rule_action="manual_review",
    )
    rule2 = dict(
        name="My awesome rule2",
        rule_expression=[{"field": "id_flagged", "op": "not_eq", "value": True}],
        rule_action="fail",
    )
    res = update_rules(obc.id, 1, *sandbox_tenant.db_auths, add=[rule1, rule2])
    rule1 = next(r for r in res if r["name"] == rule1["name"])
    rule2 = next(r for r in res if r["name"] == rule2["name"])

    bifrost = BifrostClient.new_user(obc)
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
        rule1_rsr = next(
            r for r in rsr["rule_results"] if r["rule"]["name"] == rule1["name"]
        )
        assert rule1_rsr["result"] == False
        rule2_rsr = next(
            r for r in rsr["rule_results"] if r["rule"]["name"] == rule2["name"]
        )
        assert rule2_rsr["result"] == True


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


def test_vault_data_rules(sandbox_tenant, must_collect_data, can_access_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Test Vault Data Rules",
        must_collect_data,
        can_access_data,
        # These are the necessary arguments to skip KYC so the status is only
        # dependent on rules evaluation.
        skip_kyc=True,
        allow_international_residents=True,
    )

    rule_fail_amex = dict(
        name="card issuer",
        rule_expression=[
            {
                "field": "card.primary.issuer",
                "op": "eq",
                "value": "amex",
            },
        ],
        rule_action="fail",
    )
    rule_fail_not_e3_visa = dict(
        name="visa kind",
        rule_expression=[
            {
                "field": "id.visa_kind",
                "op": "not_eq",
                "value": "e3",
            },
        ],
        rule_action="fail",
    )
    update_rules(
        obc.id, 1, *sandbox_tenant.db_auths, add=[rule_fail_amex, rule_fail_not_e3_visa]
    )

    # Check the status & rule set results for each user.
    expected_rule_evals = [
        (
            "user a",
            {
                "card.primary.number": "4428680502681658",  # Visa
                "id.us_legal_status": "visa",
                "id.visa_kind": "e1",
            },
            "fail",
            {
                rule_fail_amex["name"]: False,
                rule_fail_not_e3_visa["name"]: True,
            },
        ),
        (
            "user b",
            {
                "card.primary.number": "346501315038265",  # Amex
                "id.us_legal_status": "visa",
                "id.visa_kind": "e2",
            },
            "fail",
            {
                rule_fail_amex["name"]: True,
                rule_fail_not_e3_visa["name"]: True,
            },
        ),
        (
            "user c",
            {
                "card.primary.number": "5555555555554444",  # MasterCard
                "id.us_legal_status": "visa",
                "id.visa_kind": "e3",
            },
            "pass",
            {
                rule_fail_amex["name"]: False,
                rule_fail_not_e3_visa["name"]: False,
            },
        ),
    ]

    for (
        test_name,
        vault_data,
        expected_status,
        expected_rule_results,
    ) in expected_rule_evals:
        bifrost = BifrostClient.new_user(obc)
        patch("hosted/user/vault", vault_data, bifrost.auth_token)
        user = bifrost.run()
        fp_id = user.fp_id

        # Check the overall status.
        user = get(f"entities/{fp_id}", None, *sandbox_tenant.db_auths)
        assert len(user["workflows"]) == 1, test_name
        assert user["status"] == expected_status, test_name

        # Fetch the rule set results.
        timeline = get(f"entities/{fp_id}/timeline", None, *sandbox_tenant.db_auths)
        stepup_event = [
            i for i in timeline if i["event"]["kind"] == "onboarding_decision"
        ].pop()
        rule_set_result_id = stepup_event["event"]["data"]["decision"][
            "rule_set_result_id"
        ]

        rule_set_result = get(
            f"entities/{fp_id}/rule_set_result/{rule_set_result_id}",
            None,
            *sandbox_tenant.db_auths,
        )

        # Check rule set results.
        rule_name_to_id = {}
        for rule_name, expected_result in expected_rule_results.items():
            rule_result = next(
                r
                for r in rule_set_result["rule_results"]
                if r["rule"]["name"] == rule_name
            )
            rule_name_to_id[rule_name] = rule_result["rule"]["rule_id"]
            assert rule_result["result"] == expected_result, (test_name, rule_name)

        start_timestamp = arrow.get(stepup_event["timestamp"]).shift(hours=-1)
        end_timestamp = start_timestamp.shift(hours=2)

        # Backtesting with no change yields the same result.
        resp = post(
            f"org/onboarding_configs/{obc.id}/rules/evaluate",
            {
                "start_timestamp": start_timestamp.isoformat(),
                "end_timestamp": end_timestamp.isoformat(),
            },
            *sandbox_tenant.db_auths,
        )
        backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
        assert backtest_result[
            "historical_action_triggered"
        ] == status_as_action_triggered(expected_status), test_name
        assert backtest_result[
            "backtest_action_triggered"
        ] == status_as_action_triggered(expected_status), test_name

        # Backtesting with the matching rules deleted yields a pass.
        resp = post(
            f"org/onboarding_configs/{obc.id}/rules/evaluate",
            {
                "start_timestamp": start_timestamp.isoformat(),
                "end_timestamp": end_timestamp.isoformat(),
                "delete": [
                    rule_name_to_id[rule_name]
                    for rule_name, matches in expected_rule_results.items()
                    if matches
                ],
            },
            *sandbox_tenant.db_auths,
        )
        backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
        assert backtest_result[
            "historical_action_triggered"
        ] == status_as_action_triggered(expected_status), test_name
        assert backtest_result["backtest_action_triggered"] == None

        # Backtesting with a rule added that matches all users yields a fail.
        resp = post(
            f"org/onboarding_configs/{obc.id}/rules/evaluate",
            {
                "start_timestamp": start_timestamp.isoformat(),
                "end_timestamp": end_timestamp.isoformat(),
                "delete": [
                    rule_name_to_id[rule_name]
                    for rule_name, matches in expected_rule_results.items()
                    if matches
                ],
                "add": [
                    {
                        "name": "Should fail",
                        "rule_action": "fail",
                        "rule_expression": [
                            {
                                "field": "id.visa_kind",
                                "op": "not_eq",
                                "value": "other",
                            },
                        ],
                    },
                ],
            },
            *sandbox_tenant.db_auths,
        )
        backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
        assert backtest_result[
            "historical_action_triggered"
        ] == status_as_action_triggered(expected_status)
        assert backtest_result["backtest_action_triggered"] == "fail"


def status_as_action_triggered(pass_or_fail):
    if pass_or_fail == "pass":
        return None
    elif pass_or_fail == "fail":
        return "fail"
    else:
        raise Exception(f"Unexpected status: {pass_or_fail}")


def test_ip_address_rules(sandbox_tenant, must_collect_data, can_access_data):
    # Flake note: requires a consistent client IP for the duration of the test.

    obc = create_ob_config(
        sandbox_tenant,
        "Baseline",
        must_collect_data,
        can_access_data,
    )
    bifrost = BifrostClient.new_user(obc)
    bifrost.fixture_result = (
        "document_decision"  # Misnomer, but just means we'll evaluate rules
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

    matching_rule = dict(
        name="Should match",
        rule_expression=[
            {
                "field": "ip_address",
                "op": "is_in",
                "value": ip_list_with_match["id"],
            },
        ],
        rule_action="fail",
    )
    non_matching_rule = dict(
        name="Should not match",
        rule_expression=[
            {
                "field": "ip_address",
                "op": "is_in",
                "value": ip_list_without_match["id"],
            },
        ],
        rule_action="fail",
    )
    update_rules(
        obc.id, 1, *sandbox_tenant.db_auths, add=[matching_rule, non_matching_rule]
    )

    # Rerun Bifrost in a new sandbox.
    bifrost = BifrostClient.new_user(obc)
    bifrost.fixture_result = (
        "document_decision"  # Misnomer, but just means we'll evaluate rules
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

    rule_result = next(
        r for r in rsr["rule_results"] if r["rule"]["name"] == matching_rule["name"]
    )
    matching_rule_id = rule_result["rule"]["rule_id"]
    assert rule_result["result"] == True
    rule_result = next(
        r for r in rsr["rule_results"] if r["rule"]["name"] == non_matching_rule["name"]
    )
    non_matching_rule_id = rule_result["rule"]["rule_id"]
    assert rule_result["result"] == False

    # Backtesting with no change yields the same result.
    start_timestamp = arrow.get(stepup_event["timestamp"]).shift(hours=-1)
    end_timestamp = start_timestamp.shift(hours=2)

    resp = post(
        f"org/onboarding_configs/{obc.id}/rules/evaluate",
        {
            "start_timestamp": start_timestamp.isoformat(),
            "end_timestamp": end_timestamp.isoformat(),
        },
        *sandbox_tenant.db_auths,
    )
    backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
    assert backtest_result["historical_action_triggered"] == "fail"
    assert backtest_result["backtest_action_triggered"] == "fail"

    # Backtesting with the matching rule deleted yields a pass.
    resp = post(
        f"org/onboarding_configs/{obc.id}/rules/evaluate",
        {
            "start_timestamp": start_timestamp.isoformat(),
            "end_timestamp": end_timestamp.isoformat(),
            "delete": [matching_rule_id, non_matching_rule_id],
        },
        *sandbox_tenant.db_auths,
    )
    backtest_result = next(r for r in resp["results"] if r["fp_id"] == fp_id)
    assert backtest_result["historical_action_triggered"] == "fail"
    assert backtest_result["backtest_action_triggered"] == None


def test_multi_edit(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, must_collect_data
    )
    # When OBC's are created they are given a default set of rules
    default_rules = get(
        f"/org/onboarding_configs/{obc.id}/rules", None, *sandbox_tenant.db_auths
    )

    # edit 2 rules, add 2 new ones, and delete the rest
    add = [
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
    ]
    edit = [
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
    ]
    delete = [r["rule_id"] for r in default_rules[2:]]
    rules = update_rules(
        obc.id, 1, *sandbox_tenant.db_auths, add=add, edit=edit, delete=delete
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
    invalid_expr = [
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
    ]
    edit = dict(
        rule_id=default_rules[0]["rule_id"],
        rule_expression=invalid_expr,
    )
    update_rules(obc.id, 2, *sandbox_tenant.db_auths, edit=[edit], status_code=400)

    # trying to add rules to mix business and person should error
    rule = dict(
        rule_action="manual_review",
        rule_expression=invalid_expr,
    )
    update_rules(obc.id, 2, *sandbox_tenant.db_auths, add=[rule], status_code=400)

    # however, if you edit a rule to be totally business that's fine
    edit = dict(
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
    )
    rules = update_rules(obc.id, 2, *sandbox_tenant.db_auths, edit=[edit])

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


def test_blocklist_rules(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, must_collect_data
    )
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
    rule = dict(
        rule_action="manual_review",
        rule_expression=[
            {
                "field": "id.ssn9",
                "op": "is_in",
                "value": list["id"],
            }
        ],
    )
    rules = update_rules(obc.id, 1, *sandbox_tenant.db_auths, add=[rule])

    assert rules[-1]["rule_expression"] == [
        {"field": "id.ssn9", "op": "is_in", "value": list["id"]}
    ]

    # error if an unknown list id is given
    add = [
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
    ]
    update_rules(obc.id, 1, *sandbox_tenant.db_auths, add=add, status_code=400)


def test_cannot_delete_all_rules(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, must_collect_data
    )
    default_rules = get(
        f"/org/onboarding_configs/{obc.id}/rules", None, *sandbox_tenant.db_auths
    )
    body = patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[],
            edit=[],
            delete=[r["rule_id"] for r in default_rules],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )
    assert (
        body["error"]["message"] == "Proceeding would remove all rules on your playbook"
    )
