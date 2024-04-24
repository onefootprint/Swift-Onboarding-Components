use std::collections::HashMap;

use super::{
    data_lifetime::DataLifetime,
    risk_signal::RiskSignal,
    rule_instance::RuleInstance,
    rule_result::{NewRuleResult, RuleResult},
    scoped_vault::ScopedVault,
};
use crate::{DbResult, OptionalNonNullVec, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{
    risk_signal, rule_set_result, rule_set_result_risk_signal_junction, scoped_vault, workflow,
};
use diesel::{dsl::not, prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DataLifetimeSeqno, ObConfigurationId, RiskSignalId, RuleAction, RuleInstanceId, RuleSetResultId,
    RuleSetResultKind, ScopedVaultId, WorkflowId,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_set_result)]
pub struct RuleSetResult {
    pub id: RuleSetResultId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ob_configuration_id: ObConfigurationId, // might later one day be rule_set_id if we add an explicit rule_set table. At the moment, a playbook just have 1 implicit set of rules so for now we use obc_id here
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>, // set if the rule evaluation was done within the context of a particular Workflow decision. This would be None for other cases like adhoc rule execution via internal endpoints or backtesting
    pub kind: RuleSetResultKind, // indicates the general purpose or insertion point for this evaluation of rules. Enables us to differentiate rule evalution done as part of the Kyc waterfall vs the final workflow decision vs stuff like backtesting/adhoc evaluations
    pub action_triggered: Option<RuleAction>, // the final chosen action based on the evaluation of all rules. None would indicate that no rules evaluated to true
    // which actions were actually considered when picking the finaly `action_triggered`. eg: if we have already StepUp'd to an Identity doc for the current workflow
    // then we can't repeat that action, so triggered rules with that action wouldn't actually cause the final rsr.action_triggered to be that repeated action
    // Note: Not backfilled for all historical rules. `None` for historical non-backfilled cases.
    #[diesel(deserialize_as = OptionalNonNullVec<RuleAction>)]
    pub allowed_actions: Option<Vec<RuleAction>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_set_result)]
struct NewRuleSetResult {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub ob_configuration_id: ObConfigurationId,
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>,
    pub kind: RuleSetResultKind,
    pub action_triggered: Option<RuleAction>,
    pub allowed_actions: Option<Vec<RuleAction>>,
}

#[derive(Debug, Clone)]
pub struct NewRuleSetResultArgs<'a> {
    pub ob_configuration_id: &'a ObConfigurationId,
    pub scoped_vault_id: &'a ScopedVaultId,
    pub workflow_id: Option<&'a WorkflowId>,
    pub kind: RuleSetResultKind,
    pub action_triggered: Option<RuleAction>,
    pub rule_results: Vec<NewRuleResultArgs<'a>>,
    pub risk_signal_ids: Vec<&'a RiskSignalId>,
    pub allowed_actions: Vec<RuleAction>,
}

#[derive(Debug, Clone)]
pub struct NewRuleResultArgs<'a> {
    pub rule_instance_id: &'a RuleInstanceId,
    pub result: bool,
}

#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = rule_set_result_risk_signal_junction)]
pub struct RuleSetResultRiskSignalJunction {
    pub created_at: DateTime<Utc>,
    pub rule_set_result_id: RuleSetResultId,
    pub risk_signal_id: RiskSignalId,
}

impl RuleSetResult {
    #[tracing::instrument("RuleSetResult::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewRuleSetResultArgs) -> DbResult<(Self, Vec<RuleResult>)> {
        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_rule_set_result = NewRuleSetResult {
            created_at: now,
            created_seqno: seqno,
            ob_configuration_id: args.ob_configuration_id.clone(),
            scoped_vault_id: args.scoped_vault_id.clone(),
            workflow_id: args.workflow_id.cloned(),
            kind: args.kind,
            action_triggered: args.action_triggered,
            allowed_actions: Some(args.allowed_actions),
        };

        let rule_set_result = diesel::insert_into(rule_set_result::table)
            .values(new_rule_set_result)
            .get_result::<Self>(conn.conn())?;

        let rule_results = RuleResult::bulk_create(
            conn,
            args.rule_results
                .iter()
                .map(|r| NewRuleResult {
                    created_at: now,
                    rule_instance_id: r.rule_instance_id.clone(),
                    rule_set_result_id: rule_set_result.id.clone(),
                    result: r.result,
                })
                .collect_vec(),
        )?;

        let risk_signal_junction_rows = args
            .risk_signal_ids
            .into_iter()
            .map(|rs| RuleSetResultRiskSignalJunction {
                created_at: now,
                rule_set_result_id: rule_set_result.id.clone(),
                risk_signal_id: rs.clone(),
            })
            .collect_vec();
        diesel::insert_into(rule_set_result_risk_signal_junction::table)
            .values(risk_signal_junction_rows)
            .execute(conn.conn())?;

        Ok((rule_set_result, rule_results))
    }

    #[allow(clippy::type_complexity)]
    #[tracing::instrument("RuleSetResult::latest_workflow_decision", skip_all)]
    pub fn latest_workflow_decision(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
    ) -> DbResult<Option<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)>> {
        let rule_set_result: Option<RuleSetResult> = rule_set_result::table
            .filter(rule_set_result::scoped_vault_id.eq(sv_id))
            .filter(rule_set_result::kind.eq(RuleSetResultKind::WorkflowDecision))
            .order_by(rule_set_result::created_seqno.desc())
            .then_order_by(rule_set_result::_created_at.desc())
            .first(conn)
            .optional()?;

        let Some(rule_set_result) = rule_set_result else {
            return Ok(None);
        };

        let rule_results = RuleResult::list(conn, &rule_set_result.id)?;

        Ok(Some((rule_set_result, rule_results)))
    }

    #[tracing::instrument("RuleSetResult::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        rsr_id: &RuleSetResultId,
    ) -> DbResult<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)> {
        let rsr: RuleSetResult = rule_set_result::table
            .filter(rule_set_result::id.eq(rsr_id))
            .get_result(conn)?;

        let rule_results = RuleResult::list(conn, &rsr.id)?;
        Ok((rsr, rule_results))
    }

    /// Queries a sample of rule_set_results for use in a backtest
    /// Takes the first rule_set_result (ie if 2 exist because step-up occured) from the latest
    /// workflow (that is complete/has a rule_set_result and part of the passed in playbook) per vault
    /// Takes up to `limit` rows from the past 8 weeks
    #[tracing::instrument("RuleSetResult::sample_for_eval", skip_all)]
    pub fn sample_for_eval(
        conn: &mut PgConn,
        obc_id: &ObConfigurationId,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        limit: i64,
    ) -> DbResult<Vec<(ScopedVault, RuleSetResult, Vec<RiskSignal>)>> {
        let res: Vec<(ScopedVault, RuleSetResult)> = workflow::table
            .inner_join(scoped_vault::table)
            .inner_join(rule_set_result::table)
            .filter(scoped_vault::deactivated_at.is_null())
            .filter(workflow::ob_configuration_id.eq(obc_id))
            .filter(not(workflow::completed_at.is_null()))
            .filter(workflow::completed_at.ge(start))
            .filter(workflow::completed_at.le(end))
            .distinct_on(workflow::scoped_vault_id)
            .order((
                workflow::scoped_vault_id,
                workflow::completed_at.desc(),
                rule_set_result::created_at.asc(),
            ))
            .select((scoped_vault::all_columns, rule_set_result::all_columns))
            .limit(limit)
            .get_results(conn)?;

        let rule_set_result_ids = res.iter().map(|(_, rsr)| rsr.id.clone()).collect_vec();

        let risk_signals: Vec<(RuleSetResultId, RiskSignal)> = rule_set_result::table
            .filter(rule_set_result::id.eq_any(rule_set_result_ids))
            .inner_join(rule_set_result_risk_signal_junction::table)
            .inner_join(
                risk_signal::table
                    .on(rule_set_result_risk_signal_junction::risk_signal_id.eq(risk_signal::id)),
            )
            .select((rule_set_result::id, risk_signal::all_columns))
            .get_results(conn)?;
        let mut risk_signals: HashMap<RuleSetResultId, Vec<RiskSignal>> =
            risk_signals
                .into_iter()
                .fold(HashMap::new(), |mut hm, (rsr_id, rs)| {
                    hm.entry(rsr_id).or_default().push(rs);
                    hm
                });

        let res = res
            .into_iter()
            .map(|(sv, rsr)| {
                let rs = risk_signals.remove(&rsr.id).unwrap_or_default();
                (sv, rsr, rs)
            })
            .collect();

        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        models::{
            ob_configuration::ObConfiguration,
            risk_signal::RiskSignal,
            rule_instance::RuleInstance,
            scoped_vault::ScopedVault,
            workflow::{Workflow, WorkflowUpdate},
        },
        test_helpers::assert_have_same_elements,
        tests::prelude::*,
    };
    use chrono::Duration;
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;
    use newtypes::{
        DbActor, DecisionIntentKind, DecisionStatus, FootprintReasonCode as FRC, KycState, Locked,
        RiskSignalGroupKind, VendorAPI, WorkflowState,
    };

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let uv = tests::fixtures::vault::create_person(conn, obc.is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, &obc.id);

        let rule1 = RuleInstance::create(
            conn,
            &obc,
            &DbActor::Footprint,
            None,
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();

        let rule2 = RuleInstance::create(
            conn,
            &obc,
            &DbActor::Footprint,
            None,
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();

        let rule3 = RuleInstance::create(
            conn,
            &obc,
            &DbActor::Footprint,
            None,
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();

        let di = crate::models::decision_intent::DecisionIntent::create(
            conn,
            DecisionIntentKind::OnboardingKyc,
            &sv.id,
            None,
        )
        .unwrap();
        let vreq =
            tests::fixtures::verification_request::create(conn, &sv.id, &di.id, VendorAPI::IdologyExpectId);
        let vres = tests::fixtures::verification_result::create(conn, &vreq.id, false);
        let risk_signals = RiskSignal::bulk_create(
            conn,
            &sv.id,
            vec![(FRC::NameDoesNotMatch, vreq.vendor_api, vres.id.clone())],
            RiskSignalGroupKind::Kyc,
            false,
        )
        .unwrap();

        let (rule_set_result, rule_results) = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: &obc.id,
                scoped_vault_id: &sv.id,
                workflow_id: None,
                kind: RuleSetResultKind::Adhoc,
                action_triggered: Some(RuleAction::ManualReview),
                rule_results: vec![
                    NewRuleResultArgs {
                        rule_instance_id: &rule1.id,
                        result: true,
                    },
                    NewRuleResultArgs {
                        rule_instance_id: &rule2.id,
                        result: false,
                    },
                    NewRuleResultArgs {
                        rule_instance_id: &rule3.id,
                        result: true,
                    },
                ],
                risk_signal_ids: risk_signals.iter().map(|rs| &rs.id).collect_vec(),
                allowed_actions: RuleAction::all_rule_actions(),
            },
        )
        .unwrap();

        assert_eq!(obc.id, rule_set_result.ob_configuration_id);
        assert_eq!(sv.id, rule_set_result.scoped_vault_id);
        assert_eq!(None, rule_set_result.workflow_id);
        assert_eq!(RuleSetResultKind::Adhoc, rule_set_result.kind);
        assert_eq!(Some(RuleAction::ManualReview), rule_set_result.action_triggered);
        assert!(!rule_set_result.allowed_actions.unwrap().is_empty());

        assert_have_same_elements(
            vec![(rule1.id, true), (rule2.id, false), (rule3.id, true)],
            rule_results
                .into_iter()
                .map(|r| (r.rule_instance_id, r.result))
                .collect_vec(),
        );

        let risk_signal_junctions: Vec<RiskSignalId> = rule_set_result_risk_signal_junction::table
            .filter(rule_set_result_risk_signal_junction::rule_set_result_id.eq(rule_set_result.id))
            .select(rule_set_result_risk_signal_junction::risk_signal_id)
            .get_results(conn.conn())
            .unwrap();
        assert_have_same_elements(
            risk_signals.iter().map(|rs| rs.id.clone()).collect_vec(),
            risk_signal_junctions,
        );
    }

    fn create_vault(conn: &mut TxnPgConn, obc: &ObConfiguration) -> (ScopedVault, Vec<RiskSignal>) {
        let uv = tests::fixtures::vault::create_person(conn, obc.is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, &obc.id);

        let di = crate::models::decision_intent::DecisionIntent::create(
            conn,
            DecisionIntentKind::OnboardingKyc,
            &sv.id,
            None,
        )
        .unwrap();
        let vreq =
            tests::fixtures::verification_request::create(conn, &sv.id, &di.id, VendorAPI::IdologyExpectId);
        let vres = tests::fixtures::verification_result::create(conn, &vreq.id, false);
        let risk_signals = RiskSignal::bulk_create(
            conn,
            &sv.id,
            vec![(FRC::NameDoesNotMatch, vreq.vendor_api, vres.id.clone())],
            RiskSignalGroupKind::Kyc,
            false,
        )
        .unwrap();
        (sv, risk_signals)
    }

    fn create_wf(
        conn: &mut TxnPgConn,
        sv: &ScopedVault,
        obc_id: &ObConfigurationId,
        decision_status: Option<DecisionStatus>,
    ) -> Workflow {
        let wf = tests::fixtures::workflow::create(conn, &sv.id, obc_id, None);
        if let Some(decision_status) = decision_status {
            let decision = crate::models::onboarding_decision::NewDecisionArgs {
                vault_id: sv.vault_id.clone(),
                logic_git_hash: "".to_string(),
                status: decision_status,
                result_ids: vec![],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno: None,
                create_manual_review: None,
                rule_set_result_id: None,
            };
            let wf = Workflow::lock(conn, &wf.id).unwrap();
            let update = WorkflowUpdate::set_decision(&wf, decision);
            let wf = Workflow::update(wf, conn, update).unwrap();
            Workflow::update_state(
                conn,
                Locked::new(wf.id.clone()),
                wf.state,
                WorkflowState::Kyc(KycState::Complete),
            )
            .unwrap()
        } else {
            wf
        }
    }

    fn create_rule_set_result(
        conn: &mut TxnPgConn,
        obc_id: &ObConfigurationId,
        sv_id: &ScopedVaultId,
        wf_id: &WorkflowId,
        risk_signals: &[RiskSignal],
    ) -> RuleSetResult {
        let (rule_set_result, _) = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: obc_id,
                scoped_vault_id: sv_id,
                workflow_id: Some(wf_id),
                kind: RuleSetResultKind::WorkflowDecision,
                action_triggered: Some(RuleAction::Fail),
                rule_results: vec![],
                risk_signal_ids: risk_signals.iter().map(|rs| &rs.id).collect_vec(),
                allowed_actions: RuleAction::all_rule_actions(),
            },
        )
        .unwrap();
        rule_set_result
    }

    #[db_test]
    fn test_sample_for_eval(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts {
                is_live: true,
                ..Default::default()
            },
        );

        // Vault with 1 WF
        let (sv, risk_signals) = create_vault(conn, &obc);
        let wf = create_wf(conn, &sv, &obc.id, Some(DecisionStatus::Pass));
        let rsr = create_rule_set_result(conn, &obc.id, &sv.id, &wf.id, &risk_signals);

        // Vault with multiple WF
        let (sv2, risk_signals2) = create_vault(conn, &obc);
        let wf2a = create_wf(conn, &sv2, &obc.id, Some(DecisionStatus::Pass));
        let _rsr2a = create_rule_set_result(conn, &obc.id, &sv2.id, &wf2a.id, &risk_signals2);
        let wf2b = create_wf(conn, &sv2, &obc.id, Some(DecisionStatus::Pass));
        let rsr2b = create_rule_set_result(conn, &obc.id, &sv2.id, &wf2b.id, &risk_signals2);

        // Vault with multiple WF but some incomplete
        let (sv3, risk_signals3) = create_vault(conn, &obc);
        let wf3a = create_wf(conn, &sv3, &obc.id, None);
        let _rsr3a = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3a.id, &risk_signals3);
        let wf3b = create_wf(conn, &sv3, &obc.id, Some(DecisionStatus::Pass));
        let rsr3b = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3b.id, &risk_signals3);
        let wf3c = create_wf(conn, &sv3, &obc.id, None);
        let _rsr3c = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3c.id, &risk_signals3);

        // Vault with 1 WF but multiple rule_set_result's
        let (sv4, risk_signals4) = create_vault(conn, &obc);
        let wf4 = create_wf(conn, &sv4, &obc.id, Some(DecisionStatus::Pass));
        let rsr4a = create_rule_set_result(conn, &obc.id, &sv4.id, &wf4.id, &risk_signals4);
        let _rsr4b = create_rule_set_result(conn, &obc.id, &sv4.id, &wf4.id, &risk_signals4);

        // Vault with just 1 incomplete WF
        let (sv5, risk_signals5) = create_vault(conn, &obc);
        let wf5 = create_wf(conn, &sv5, &obc.id, None);
        let _rsr5 = create_rule_set_result(conn, &obc.id, &sv5.id, &wf5.id, &risk_signals5);

        let results =
            RuleSetResult::sample_for_eval(conn, &obc.id, Utc::now() - Duration::hours(1), Utc::now(), 10)
                .unwrap();
        assert_have_same_elements(
            vec![
                (sv.id, rsr.id, rs_ids(risk_signals)),
                (sv2.id, rsr2b.id, rs_ids(risk_signals2)),
                (sv3.id, rsr3b.id, rs_ids(risk_signals3)),
                (sv4.id, rsr4a.id, rs_ids(risk_signals4)),
            ],
            results
                .into_iter()
                .map(|(sv, rsr, rs)| (sv.id, rsr.id, rs_ids(rs)))
                .collect_vec(),
        );
    }

    fn rs_ids(rs: Vec<RiskSignal>) -> Vec<RiskSignalId> {
        rs.into_iter().map(|r| r.id).sorted().collect()
    }
}
