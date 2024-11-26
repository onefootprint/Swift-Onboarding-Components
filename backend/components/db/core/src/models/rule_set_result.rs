use super::data_lifetime::DataLifetime;
use super::risk_signal::RiskSignal;
use super::rule_instance::RuleInstance;
use super::rule_result::NewRuleResult;
use super::rule_result::RuleResult;
use super::scoped_vault::ScopedVault;
use super::vault::Vault;
use crate::OptionalNonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::risk_signal;
use db_schema::schema::rule_set_result;
use db_schema::schema::rule_set_result_risk_signal_junction;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault;
use db_schema::schema::workflow;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;
use newtypes::ObConfigurationId;
use newtypes::RiskSignalId;
use newtypes::RuleAction;
use newtypes::RuleActionConfig;
use newtypes::RuleInstanceId;
use newtypes::RuleSetResultId;
use newtypes::RuleSetResultKind;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Eq, PartialEq)]
#[diesel(table_name = rule_set_result)]
pub struct RuleSetResult {
    pub id: RuleSetResultId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ob_configuration_id: ObConfigurationId, /* might later one day be rule_set_id if we add an
                                                 * explicit rule_set table. At the moment, a playbook just
                                                 * have 1 implicit set of rules so for now we use obc_id
                                                 * here */
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>, /* set if the rule evaluation was done within the context of a
                                          * particular Workflow decision. This would be None for other
                                          * cases like adhoc rule execution via internal endpoints or
                                          * backtesting */
    pub kind: RuleSetResultKind, /* indicates the general purpose or insertion point for this evaluation
                                  * of rules. Enables us to differentiate rule evalution done as part of
                                  * the Kyc waterfall vs the final workflow decision vs stuff like
                                  * backtesting/adhoc evaluations */
    pub action_triggered: Option<RuleAction>, /* the final chosen action based on the evaluation of all
                                               * rules. None would indicate that no rules evaluated to
                                               * true */
    // which actions were actually considered when picking the finaly `action_triggered`. eg: if we have
    // already StepUp'd to an Identity doc for the current workflow then we can't repeat that action, so
    // triggered rules with that action wouldn't actually cause the final rsr.action_triggered to be that
    // repeated action Note: Not backfilled for all historical rules. `None` for historical
    // non-backfilled cases.
    #[diesel(deserialize_as = OptionalNonNullVec<RuleAction>)]
    pub allowed_actions: Option<Vec<RuleAction>>,
    // TODO: backfill
    pub rule_action_triggered: Option<RuleActionConfig>,
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
    pub rule_action_triggered: Option<RuleActionConfig>,
    pub allowed_actions: Option<Vec<RuleAction>>,
}

#[derive(Debug, Clone)]
pub struct NewRuleSetResultArgs<'a> {
    pub ob_configuration_id: &'a ObConfigurationId,
    pub scoped_vault_id: &'a ScopedVaultId,
    pub workflow_id: Option<&'a WorkflowId>,
    pub kind: RuleSetResultKind,
    pub action_triggered: Option<RuleAction>,
    pub rule_action_triggered: Option<RuleActionConfig>,
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
    pub fn create(conn: &mut TxnPgConn, args: NewRuleSetResultArgs) -> FpResult<(Self, Vec<RuleResult>)> {
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
            rule_action_triggered: args.rule_action_triggered,
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
    ) -> FpResult<Option<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)>> {
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

    #[tracing::instrument("RuleSetResult::bulk_get_for_workflows", skip(conn))]
    pub fn bulk_get_for_workflows(
        conn: &mut PgConn,
        workflow_ids: Vec<WorkflowId>,
    ) -> FpResult<HashMap<WorkflowId, Vec<Self>>> {
        let results = rule_set_result::table
            .filter(rule_set_result::workflow_id.eq_any(workflow_ids))
            .filter(rule_set_result::kind.eq(RuleSetResultKind::WorkflowDecision))
            .order_by(rule_set_result::created_seqno.desc())
            .then_order_by(rule_set_result::_created_at.desc())
            .get_results::<Self>(conn)?
            .into_iter()
            .filter_map(|rsr| rsr.workflow_id.clone().map(|wf_id| (wf_id, rsr)))
            .into_group_map();

        Ok(results)
    }

    #[tracing::instrument("RuleSetResult::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        rsr_id: &RuleSetResultId,
    ) -> FpResult<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)> {
        let rsr: RuleSetResult = rule_set_result::table
            .filter(rule_set_result::id.eq(rsr_id))
            .get_result(conn)?;

        let rule_results = RuleResult::list(conn, &rsr.id)?;
        Ok((rsr, rule_results))
    }

    /// Queries a sample of rule_set_results for use in a backtest
    /// Takes the first rule_set_result (ie if 2 exist because step-up occured) from the latest
    /// workflow (that is complete/has a rule_set_result and part of the passed in playbook) per
    /// vault Takes up to `limit` rows from the past 8 weeks
    #[tracing::instrument("RuleSetResult::sample_for_eval", skip_all)]
    pub fn sample_for_eval(
        conn: &mut PgConn,
        obc_id: &ObConfigurationId,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        limit: i64,
    ) -> FpResult<Vec<RuleSetResultSample>> {
        let res: Vec<(ScopedVault, Vault, RuleSetResult)> = workflow::table
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .inner_join(rule_set_result::table)
            .filter(workflow::ob_configuration_id.eq(obc_id))
            .filter(scoped_vault::is_active)
            .filter(not(workflow::completed_at.is_null()))
            .filter(workflow::completed_at.ge(start))
            .filter(workflow::completed_at.le(end))
            .distinct_on(workflow::scoped_vault_id)
            .order((
                workflow::scoped_vault_id,
                workflow::completed_at.desc(),
                rule_set_result::created_at.asc(),
            ))
            .select((
                scoped_vault::all_columns,
                vault::all_columns,
                rule_set_result::all_columns,
            ))
            .limit(limit)
            .get_results(conn)?;

        let rule_set_result_ids = res.iter().map(|(_, _, rsr)| rsr.id.clone()).collect_vec();

        let risk_signals: Vec<(RuleSetResultId, RiskSignal)> = rule_set_result::table
            .filter(rule_set_result::id.eq_any(rule_set_result_ids))
            .inner_join(rule_set_result_risk_signal_junction::table)
            .inner_join(
                risk_signal::table
                    .on(rule_set_result_risk_signal_junction::risk_signal_id.eq(risk_signal::id)),
            )
            .select((rule_set_result::id, risk_signal::all_columns))
            .get_results(conn)?;

        let mut risk_signals_by_rsr = risk_signals.into_iter().into_group_map();

        let res = res
            .into_iter()
            .map(|(scoped_vault, vault, rule_set_result)| {
                let risk_signals = risk_signals_by_rsr
                    .remove(&rule_set_result.id)
                    .unwrap_or_default();
                RuleSetResultSample {
                    scoped_vault,
                    vault,
                    rule_set_result,
                    risk_signals,
                }
            })
            .collect();

        Ok(res)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct RuleSetResultSample {
    pub scoped_vault: ScopedVault,
    pub vault: Vault,
    pub rule_set_result: RuleSetResult,
    pub risk_signals: Vec<RiskSignal>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::onboarding_decision::OnboardingDecision;
    use crate::models::risk_signal::RiskSignal;
    use crate::models::risk_signal_group::RiskSignalGroupScope;
    use crate::models::rule_instance::NewRule;
    use crate::models::rule_instance::RuleInstance;
    use crate::models::scoped_vault::ScopedVault;
    use crate::models::workflow::Workflow;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::prelude::*;
    use chrono::Duration;
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;
    use newtypes::DbActor;
    use newtypes::DecisionIntentKind;
    use newtypes::DecisionStatus;
    use newtypes::FootprintReasonCode as FRC;
    use newtypes::KycState;
    use newtypes::Locked;
    use newtypes::RiskSignalGroupKind;
    use newtypes::TenantId;
    use newtypes::VendorAPI;
    use newtypes::WorkflowState;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let (playbook, obc) = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );

        let uv = tests::fixtures::vault::create_person(conn, playbook.is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, &playbook.tenant_id);

        let action = RuleAction::Fail;
        let rules = vec![
            NewRule {
                name: None,
                rule_expression: tests::fixtures::rule::example_rule_expression(),
                action,
                rule_action: action.to_rule_action(),
                is_shadow: false,
            },
            NewRule {
                name: None,
                rule_expression: tests::fixtures::rule::example_rule_expression(),
                action,
                rule_action: action.to_rule_action(),
                is_shadow: false,
            },
            NewRule {
                name: None,
                rule_expression: tests::fixtures::rule::example_rule_expression(),
                action,
                rule_action: action.to_rule_action(),
                is_shadow: false,
            },
        ];
        let rules = RuleInstance::bulk_create(conn, &playbook, &obc.id, &DbActor::Footprint, rules).unwrap();

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
        let scope = RiskSignalGroupScope::ScopedVaultId { id: &sv.id };
        let risk_signals = RiskSignal::bulk_create(
            conn,
            scope,
            vec![(FRC::NameDoesNotMatch, vreq.vendor_api, vres.id.clone())],
            RiskSignalGroupKind::Kyc,
            false,
        )
        .unwrap();

        let new_rule_results = rules
            .iter()
            .enumerate()
            .map(|(i, r)| NewRuleResultArgs {
                rule_instance_id: &r.id,
                result: i % 2 == 0,
            })
            .collect_vec();
        let action = RuleAction::ManualReview;
        let (rule_set_result, rule_results) = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: &obc.id,
                scoped_vault_id: &sv.id,
                workflow_id: None,
                kind: RuleSetResultKind::Adhoc,
                action_triggered: Some(action),
                rule_action_triggered: Some(action.to_rule_action()),
                rule_results: new_rule_results.clone(),
                risk_signal_ids: risk_signals.iter().map(|rs| &rs.id).collect_vec(),
                allowed_actions: vec![],
            },
        )
        .unwrap();

        assert_eq!(obc.id, rule_set_result.ob_configuration_id);
        assert_eq!(sv.id, rule_set_result.scoped_vault_id);
        assert_eq!(None, rule_set_result.workflow_id);
        assert_eq!(RuleSetResultKind::Adhoc, rule_set_result.kind);
        assert_eq!(Some(RuleAction::ManualReview), rule_set_result.action_triggered);

        assert_have_same_elements(
            new_rule_results
                .into_iter()
                .map(|r| (r.rule_instance_id.clone(), r.result))
                .collect_vec(),
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

    fn create_vault(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> (Locked<ScopedVault>, Vault, Vec<RiskSignal>) {
        let uv = tests::fixtures::vault::create_person(conn, is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, tenant_id);

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
        let scope = RiskSignalGroupScope::ScopedVaultId { id: &sv.id };
        let risk_signals = RiskSignal::bulk_create(
            conn,
            scope,
            vec![(FRC::NameDoesNotMatch, vreq.vendor_api, vres.id.clone())],
            RiskSignalGroupKind::Kyc,
            false,
        )
        .unwrap();
        (sv, uv.into_inner(), risk_signals)
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
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno: DataLifetimeSeqno::from(0),
                manual_reviews: vec![],
                rule_set_result_id: None,
                failed_for_doc_review: false,
            };
            let wf = Workflow::lock(conn, &wf.id).unwrap();
            let (obd, _) = OnboardingDecision::create_decision_and_mrs(conn, &wf, decision).unwrap();
            let (wf, _, _) = Workflow::update_status_if_valid(wf, conn, obd.status.into()).unwrap();
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
        let action = RuleAction::Fail;
        let (rule_set_result, _) = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: obc_id,
                scoped_vault_id: sv_id,
                workflow_id: Some(wf_id),
                kind: RuleSetResultKind::WorkflowDecision,
                action_triggered: Some(action),
                rule_action_triggered: Some(action.to_rule_action()),
                rule_results: vec![],
                risk_signal_ids: risk_signals.iter().map(|rs| &rs.id).collect_vec(),
                allowed_actions: vec![],
            },
        )
        .unwrap();
        rule_set_result
    }

    #[db_test]
    fn test_sample_for_eval(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let is_live = true;
        let (_, obc) = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts {
                is_live,
                ..Default::default()
            },
        );

        // Vault with 1 WF
        let (sv1, uv1, risk_signals_1) = create_vault(conn, &t.id, is_live);
        let wf = create_wf(conn, &sv1, &obc.id, Some(DecisionStatus::Pass));
        let rsr1 = create_rule_set_result(conn, &obc.id, &sv1.id, &wf.id, &risk_signals_1);

        // Vault with multiple WF
        let (sv2, uv2, risk_signals_2) = create_vault(conn, &t.id, is_live);
        let wf2a = create_wf(conn, &sv2, &obc.id, Some(DecisionStatus::Pass));
        let _rsr2a = create_rule_set_result(conn, &obc.id, &sv2.id, &wf2a.id, &risk_signals_2);
        let wf2b = create_wf(conn, &sv2, &obc.id, Some(DecisionStatus::Pass));
        let rsr2b = create_rule_set_result(conn, &obc.id, &sv2.id, &wf2b.id, &risk_signals_2);

        // Vault with multiple WF but some incomplete
        let (sv3, uv3, risk_signals_3) = create_vault(conn, &t.id, is_live);
        let wf3a = create_wf(conn, &sv3, &obc.id, None);
        let _rsr3a = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3a.id, &risk_signals_3);
        let wf3b = create_wf(conn, &sv3, &obc.id, Some(DecisionStatus::Pass));
        let rsr3b = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3b.id, &risk_signals_3);
        let wf3c = create_wf(conn, &sv3, &obc.id, None);
        let _rsr3c = create_rule_set_result(conn, &obc.id, &sv3.id, &wf3c.id, &risk_signals_3);

        // Vault with 1 WF but multiple rule_set_result's
        let (sv4, uv4, risk_signals_4) = create_vault(conn, &t.id, is_live);
        let wf4 = create_wf(conn, &sv4, &obc.id, Some(DecisionStatus::Pass));
        let rsr4a = create_rule_set_result(conn, &obc.id, &sv4.id, &wf4.id, &risk_signals_4);
        let _rsr4b = create_rule_set_result(conn, &obc.id, &sv4.id, &wf4.id, &risk_signals_4);

        // Vault with just 1 incomplete WF
        let (sv5, _uv5, risk_signals_5) = create_vault(conn, &t.id, is_live);
        let wf5 = create_wf(conn, &sv5, &obc.id, None);
        let _rsr5 = create_rule_set_result(conn, &obc.id, &sv5.id, &wf5.id, &risk_signals_5);

        let results =
            RuleSetResult::sample_for_eval(conn, &obc.id, Utc::now() - Duration::hours(1), Utc::now(), 10)
                .unwrap();
        assert_have_same_elements(
            vec![
                (sv1.into_inner().id, uv1, rsr1, sort_risk_signals(risk_signals_1)),
                (sv2.into_inner().id, uv2, rsr2b, sort_risk_signals(risk_signals_2)),
                (sv3.into_inner().id, uv3, rsr3b, sort_risk_signals(risk_signals_3)),
                (sv4.into_inner().id, uv4, rsr4a, sort_risk_signals(risk_signals_4)),
            ],
            results
                .into_iter()
                .map(|sample| {
                    (
                        sample.scoped_vault.id,
                        sample.vault,
                        sample.rule_set_result,
                        sort_risk_signals(sample.risk_signals),
                    )
                })
                .collect_vec(),
        );
    }

    fn sort_risk_signals(rs: Vec<RiskSignal>) -> Vec<RiskSignal> {
        rs.into_iter().sorted_by_key(|r| r.id.clone()).collect()
    }
}
