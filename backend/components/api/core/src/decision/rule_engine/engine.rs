use super::eval;
use crate::errors::ApiResult;
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
use newtypes::{ObConfigurationId, RuleSetResultKind, ScopedVaultId, WorkflowId};

#[tracing::instrument(skip_all)]
pub fn evaluate_rules(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    obc_id: &ObConfigurationId,
    wf_id: Option<&WorkflowId>,
    kind: RuleSetResultKind,
    risk_signals: &[RiskSignal],
    allow_stepup: bool, // could maybe query for DocReq in here and not need to pass this in
) -> ApiResult<(RuleSetResult, Vec<RuleResult>)> {
    let (obc, _) = ObConfiguration::get(conn, obc_id)?;
    let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, obc_id)?;

    let (rule_results, action_triggered) = eval::evaluate_rule_set(
        rules,
        &risk_signals.iter().map(|rs| rs.reason_code.clone()).collect_vec(),
        allow_stepup,
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
    )], vec![FRC::SsnDoesNotMatch], true => Some(RA::Fail))]
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
    )], vec![FRC::SsnDoesNotMatch, FRC::NameDoesNotMatch], true => Some(RA::Fail))]
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
    )], vec![FRC::NameDoesNotMatch], true => Some(RA::StepUp))]
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
    )], vec![FRC::DocumentBarcodeContentDoesNotMatch], true => None)]
    fn test_evaluate_rules(
        conn: &mut TestPgConn,
        rules: Vec<TRule>,
        risk_signals: Vec<FRC>,
        allow_stepup: bool,
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
            allow_stepup,
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
