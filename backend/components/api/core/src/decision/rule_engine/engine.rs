use std::collections::HashMap;

use super::{
    default_rules::base_kyc_rules,
    eval::{self, Rule},
};
use crate::{
    decision::{onboarding::Decision, RuleError},
    errors::ApiResult,
};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        risk_signal::RiskSignal,
        rule_instance::RuleInstance,
        rule_result::RuleResult,
        rule_set_result::{NewRuleResultArgs, NewRuleSetResultArgs, RuleSetResult},
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{ObConfigurationId, RiskSignalGroupKind, RuleSetResultKind, ScopedVaultId, WorkflowId};

#[tracing::instrument(skip_all)]
pub fn evaluate_workflow_decision(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    obc_id: &ObConfigurationId,
    wf_id: Option<&WorkflowId>,
    kind: RuleSetResultKind,
    risk_signals: HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
    doc_collected: bool, // could maybe query for DocReq in here and not need to pass this in
) -> ApiResult<Decision> {
    if doc_collected
        && !risk_signals
            .get(&RiskSignalGroupKind::Doc)
            .map(|rs| !rs.is_empty())
            .unwrap_or(false)
    {
        return Err(crate::decision::Error::from(RuleError::MissingInputForDocRules).into());
    }

    let risk_signals: Vec<_> = risk_signals
        .iter()
        // current logic is that we do not evaluate Doc rules if a doc was not collected stricly as part of the current workflow
        // TODO: maybe we should just generally only evaluate rules on risk signals generated during the current workflow? 🤔 lots of inter-workflow/inter-playbooks/inter-play thingies to figure out
        .filter(|(k, _)| doc_collected || !matches!(k, RiskSignalGroupKind::Doc)).flat_map(|(_, v)| v.clone()).collect();

    let (rule_set_result, _rule_results) =
        evaluate_rules(conn, sv_id, obc_id, wf_id, kind, &risk_signals, doc_collected)?;

    let should_commit_rules: Vec<_> = [base_kyc_rules(), super::default_rules::ssn_rules()]
        .concat()
        .into_iter()
        .map(|(re, ra)| Rule {
            expression: re,
            action: ra,
        })
        .collect();
    let (_, should_commit_action) = eval::evaluate_rule_set(
        should_commit_rules,
        &risk_signals.iter().map(|rs| rs.reason_code.clone()).collect_vec(),
        !doc_collected,
    );

    Ok(Decision {
        decision_status: rule_set_result.action_triggered.into(),
        should_commit: should_commit_action.is_none(),
        create_manual_review: rule_set_result
            .action_triggered
            .map(|ra| ra.should_create_review())
            .unwrap_or(false),
    })
}

#[tracing::instrument(skip_all)]
pub fn evaluate_rules(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    obc_id: &ObConfigurationId,
    wf_id: Option<&WorkflowId>,
    kind: RuleSetResultKind,
    risk_signals: &[RiskSignal],
    doc_collected: bool, // could maybe query for DocReq in here and not need to pass this in
) -> ApiResult<(RuleSetResult, Vec<RuleResult>)> {
    let (obc, _) = ObConfiguration::get(conn, obc_id)?;
    let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, obc_id)?;
    if rules.is_empty() {
        return Err(crate::decision::Error::from(RuleError::NoRulesForPlaybook(obc.id)).into());
    }

    let (rule_results, action_triggered) = eval::evaluate_rule_set(
        rules,
        &risk_signals.iter().map(|rs| rs.reason_code.clone()).collect_vec(),
        !doc_collected,
    );

    let rule_set_result = RuleSetResult::create(
        conn,
        NewRuleSetResultArgs {
            ob_configuration_id: obc_id,
            scoped_vault_id: sv_id,
            workflow_id: wf_id,
            kind,
            action_triggered,
            rule_results: rule_results
                .iter()
                .map(|(ri, e)| NewRuleResultArgs {
                    rule_instance_id: &ri.id,
                    result: *e,
                })
                .collect_vec(),
            risk_signal_ids: risk_signals.iter().map(|rs| &rs.id).collect_vec(),
        },
    )?;

    Ok(rule_set_result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::{
        models::scoped_vault::ScopedVault,
        test_helpers::assert_have_same_elements,
        tests::{fixtures::ob_configuration::ObConfigurationOpts, prelude::*},
    };
    use diesel::prelude::*;
    use eval::tests::TRule;
    use macros::db_test_case;
    use newtypes::{
        BooleanOperator as BO, DbActor, DecisionIntentKind, FootprintReasonCode as FRC, RiskSignalGroupKind,
        RiskSignalId, RuleAction, RuleAction as RA, RuleExpression as RE, RuleExpressionCondition as REC,
        VendorAPI,
    };

    #[db_test_case(vec![TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::SsnDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::Fail,
    )], vec![FRC::SsnDoesNotMatch], false => Some(RA::Fail))]
    #[db_test_case(vec![TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::SsnDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::Fail,
    ), TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::NameDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::StepUp,
    )], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], false => Some(RA::Fail))]
    #[db_test_case(vec![TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::SsnDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::Fail,
    ), TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::NameDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::StepUp,
    )], vec![FRC::NameDoesNotMatch], false => Some(RA::StepUp))]
    #[db_test_case(vec![TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::SsnDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::Fail,
    ), TRule(
        RE(vec![REC::RiskSignal {
            field: FRC::NameDoesNotMatch,
            op: BO::Equals,
            value: true,
        }]),
        RA::StepUp,
    )], vec![FRC::DocumentBarcodeContentDoesNotMatch], false => None)]
    fn test_evaluate_rules(
        conn: &mut TestPgConn,
        rules: Vec<TRule>,
        risk_signals: Vec<FRC>,
        doc_collected: bool,
    ) -> Option<RuleAction> {
        // Setup
        let (sv, obc) = make_user(conn);
        let rules = rules
            .into_iter()
            .map(|r| RuleInstance::create(conn, obc.id.clone(), DbActor::Footprint, None, r.0, r.1).unwrap())
            .collect_vec();
        let risk_signals = make_risk_signals(conn, &sv.id, risk_signals);

        // Eval
        let (rule_set_result, rule_results) = evaluate_rules(
            conn,
            &sv.id,
            &obc.id,
            None,
            RuleSetResultKind::Adhoc,
            &risk_signals,
            doc_collected,
        )
        .unwrap();

        // Assertions
        assert_eq!(rules.len(), rule_results.len());
        assert_eq!(obc.id, rule_set_result.ob_configuration_id);
        assert_eq!(sv.id, rule_set_result.scoped_vault_id);
        assert_eq!(None, rule_set_result.workflow_id);
        assert_eq!(RuleSetResultKind::Adhoc, rule_set_result.kind);

        let risk_signal_junctions: Vec<RiskSignalId> =
            db_schema::schema::rule_set_result_risk_signal_junction::table
                .filter(
                    db_schema::schema::rule_set_result_risk_signal_junction::rule_set_result_id
                        .eq(rule_set_result.id),
                )
                .select(db_schema::schema::rule_set_result_risk_signal_junction::risk_signal_id)
                .get_results(conn.conn())
                .unwrap();
        assert_have_same_elements(
            risk_signals.iter().map(|rs| rs.id.clone()).collect_vec(),
            risk_signal_junctions,
        );

        rule_set_result.action_triggered
    }

    fn make_user(conn: &mut TestPgConn) -> (ScopedVault, ObConfiguration) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let uv = tests::fixtures::vault::create_person(conn, obc.is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, &obc.id);

        (sv, obc)
    }

    fn make_risk_signals(conn: &mut TestPgConn, sv_id: &ScopedVaultId, frcs: Vec<FRC>) -> Vec<RiskSignal> {
        let di = db::models::decision_intent::DecisionIntent::create(
            conn,
            DecisionIntentKind::OnboardingKyc,
            sv_id,
            None,
        )
        .unwrap();
        let vreq =
            tests::fixtures::verification_request::create(conn, sv_id, &di.id, VendorAPI::IdologyExpectId);
        let vres = tests::fixtures::verification_result::create(conn, &vreq.id, false);
        RiskSignal::bulk_create(
            conn,
            sv_id,
            frcs.into_iter()
                .map(|frc| (frc, vreq.vendor_api, vres.id.clone()))
                .collect_vec(),
            RiskSignalGroupKind::Kyc,
            false,
        )
        .unwrap()
    }
}
