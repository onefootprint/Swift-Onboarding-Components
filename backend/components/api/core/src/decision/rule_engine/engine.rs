use super::default_rules::base_kyc_rules;
use super::eval::Rule;
use super::eval::RuleEvalConfig;
use super::eval::{
    self,
};
use crate::decision::onboarding::RulesOutcome;
use crate::decision::RuleError;
use crate::utils::vault_wrapper::bulk_decrypt;
use crate::utils::vault_wrapper::BulkDecryptReq;
use crate::utils::vault_wrapper::DecryptAuditEventInfo;
use crate::utils::vault_wrapper::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::TenantVw;
use crate::FpResult;
use crate::State;
use db::models::document_request::DocumentRequest;
use db::models::insight_event::InsightEvent;
use db::models::list_entry::ListWithDecryptedEntries;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::RiskSignal;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_result::RuleResult;
use db::models::rule_set_result::NewRuleResultArgs;
use db::models::rule_set_result::NewRuleSetResultArgs;
use db::models::rule_set_result::RuleSetResult;
use db::models::vault::Vault;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DocumentRequestKind;
use newtypes::ListId;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKind;
use newtypes::PiiJsonValue;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleExpression;
use newtypes::RuleSetResultId;
use newtypes::RuleSetResultKind;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowId;
use std::collections::HashMap;

pub struct EvaluateWorkflowDecisionArgs<'a> {
    pub sv_id: &'a ScopedVaultId,
    pub obc_id: &'a ObConfigurationId,
    pub wf_id: &'a WorkflowId,
    pub kind: RuleSetResultKind,
    pub risk_signals: HashMap<RiskSignalGroupKind, Vec<RiskSignal>>,
    pub vault_data: &'a VaultDataForRules,
    pub lists: &'a HashMap<ListId, ListWithDecryptedEntries>,
    pub is_fixture: bool,
    pub include_rules: IncludeRules,
}

#[tracing::instrument(skip_all)]
pub fn evaluate_workflow_decision<'a>(
    conn: &mut TxnPgConn,
    args: EvaluateWorkflowDecisionArgs<'a>,
) -> FpResult<(RulesOutcome, Option<RuleSetResultId>)> {
    let EvaluateWorkflowDecisionArgs {
        sv_id,
        obc_id,
        wf_id,
        kind,
        risk_signals,
        vault_data,
        lists,
        is_fixture,
        include_rules,
    } = args;
    let doc_reqs = DocumentRequest::get_all(conn, wf_id)?;
    let doc_collected = doc_reqs
        .iter()
        .any(|dr| matches!(dr.kind, DocumentRequestKind::Identity));
    let rule_eval_config = RuleEvalConfig::new(doc_reqs.into_iter().map(|dr| dr.kind).collect());

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

    // TODO: Consider pulling in additional insight events?
    let insight_events: Vec<InsightEvent> =
        InsightEvent::get_for_workflow(conn, wf_id)?.into_iter().collect();

    let (obc, _) = ObConfiguration::get(conn, obc_id)?;
    let rules_output = evaluate_rules(
        conn,
        sv_id,
        &obc,
        Some(wf_id),
        kind,
        &risk_signals,
        vault_data,
        &insight_events,
        lists,
        &rule_eval_config,
        include_rules,
    )?;

    let Some((rule_set_result, _)) = rules_output else {
        return Ok((RulesOutcome::RulesNotExecuted, None));
    };
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
        vault_data,
        &insight_events,
        lists,
        &rule_eval_config,
    );
    let is_kyc_playbook = obc.kind == ObConfigurationKind::Kyc || obc.kind == ObConfigurationKind::Kyb;
    let decision = RulesOutcome::RulesExecuted {
        should_commit: !is_fixture && is_kyc_playbook && should_commit_action.is_none(),
        create_manual_review: rule_set_result
            .action_triggered
            .map(|ra| ra.should_create_review())
            .unwrap_or(false),
        action: rule_set_result.action_triggered,
    };
    Ok((decision, Some(rule_set_result.id)))
}

#[derive(Default, derive_more::Deref)]
pub struct VaultDataForRules(HashMap<DataIdentifier, PiiJsonValue>);

impl VaultDataForRules {
    pub async fn decrypt_for_rules<T>(
        state: &State,
        vw: TenantVw<T>,
        rule_expressions: &[&RuleExpression],
    ) -> FpResult<Self> {
        let key = ();
        let result =
            Self::bulk_decrypt_for_rules(state, HashMap::from([(key, vw)]), rule_expressions).await?;
        Ok(result
            .into_values()
            .next()
            .unwrap_or_else(VaultDataForRules::empty))
    }

    pub async fn bulk_decrypt_for_rules<K, T>(
        state: &State,
        vws: HashMap<K, TenantVw<T>>,
        rule_expressions: &[&RuleExpression],
    ) -> FpResult<HashMap<K, Self>>
    where
        K: Eq + std::hash::Hash + 'static + Clone,
    {
        let dis = rule_expressions
            .iter()
            .flat_map(|expr| expr.data_identifiers())
            .unique()
            .collect_vec();

        let targets = dis
            .iter()
            .map(|di| EnclaveDecryptOperation {
                identifier: di.clone(),
                transforms: vec![],
            })
            .collect_vec();

        let reqs = vws
            .iter()
            .map(|(k, vw)| {
                let req = BulkDecryptReq {
                    vw,
                    targets: targets.clone(),
                };
                (k.clone(), req)
            })
            .collect();

        let ret = bulk_decrypt(state, reqs, DecryptAuditEventInfo::NoAuditEvent)
            .await?
            .into_iter()
            .map(|(k, decrypted_data)| {
                let val = Self(
                    decrypted_data
                        .into_iter()
                        .map(|(k, v)| (k.identifier, v))
                        .collect(),
                );
                (k, val)
            })
            .collect();
        Ok(ret)
    }

    pub fn empty() -> Self {
        Self::default()
    }

    #[cfg(test)]
    pub fn new(vault_data: HashMap<DataIdentifier, PiiJsonValue>) -> Self {
        Self(vault_data)
    }
}

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub fn evaluate_rules(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    obc: &ObConfiguration,
    wf_id: Option<&WorkflowId>,
    kind: RuleSetResultKind,
    risk_signals: &[RiskSignal],
    vault_data: &VaultDataForRules,
    insight_events: &[InsightEvent],
    lists: &HashMap<ListId, ListWithDecryptedEntries>,
    rule_eval_config: &RuleEvalConfig, // could maybe query for DocReq in here and not need to pass this in
    rule_kinds: IncludeRules,
) -> FpResult<Option<(RuleSetResult, Vec<RuleResult>)>> {
    let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, rule_kinds)?;
    if rules.is_empty() {
        let v = Vault::get(conn, sv_id)?;
        let can_have_no_rules = match obc.kind {
            // Document-only playbooks are allowed to have no rules if they want to maintain
            // the existing status.
            // One day, we should probably further generalize this to be a "collection-only"
            // playbook that just doesn't run rules
            ObConfigurationKind::Document => true, /* and theoretically, should have */
            // docs_to_collect.all(is_custom)
            ObConfigurationKind::Kyc => false, // We could support this some day for skip_kyc
            ObConfigurationKind::Kyb => {
                let vc = obc.verification_checks();
                (vc.skip_kyc() && v.kind == VaultKind::Person)
                    || (vc.skip_kyb() && v.kind == VaultKind::Business)
            }
            ObConfigurationKind::Auth => true,
        };
        if can_have_no_rules {
            return Ok(None);
        }
        return Err(crate::decision::Error::from(RuleError::NoRulesForPlaybook(obc.id.clone())).into());
    }

    let (rule_results, action_triggered) = eval::evaluate_rule_set(
        rules,
        &risk_signals.iter().map(|rs| rs.reason_code.clone()).collect_vec(),
        vault_data,
        insight_events,
        lists,
        rule_eval_config,
    );

    let rule_set_result = RuleSetResult::create(
        conn,
        NewRuleSetResultArgs {
            ob_configuration_id: &obc.id,
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
            allowed_actions: rule_eval_config.allowed_rule_actions.clone(),
        },
    )?;

    Ok(Some(rule_set_result))
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::models::rule_instance::NewRule;
    use db::models::scoped_vault::ScopedVault;
    use db::test_helpers::assert_have_same_elements;
    use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
    use db::tests::prelude::*;
    use diesel::prelude::*;
    use eval::tests::TRule;
    use macros::db_test_case;
    use newtypes::BooleanOperator as BO;
    use newtypes::DbActor;
    use newtypes::DecisionIntentKind;
    use newtypes::DocumentRequestKind;
    use newtypes::FootprintReasonCode as FRC;
    use newtypes::RiskSignalGroupKind;
    use newtypes::RiskSignalId;
    use newtypes::RuleAction as RA;
    use newtypes::RuleExpression as RE;
    use newtypes::RuleExpressionCondition as REC;
    use newtypes::RuleInstanceKind;
    use newtypes::VendorAPI;

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
        RA::identity_stepup(),
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
        RA::identity_stepup(),
    )], vec![FRC::NameDoesNotMatch], false => Some(RA::identity_stepup()))]
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
        RA::identity_stepup(),
    )], vec![FRC::DocumentBarcodeContentDoesNotMatch], false => None)]
    fn test_evaluate_rules(
        conn: &mut TestPgConn,
        rules: Vec<TRule>,
        risk_signals: Vec<FRC>,
        doc_collected: bool,
    ) -> Option<RA> {
        // Setup
        let (sv, obc) = make_user(conn);
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rules = rules
            .into_iter()
            .map(|r| NewRule {
                rule_expression: r.0,
                action: r.1,
                name: None,
                kind: RuleInstanceKind::Person,
                is_shadow: false,
            })
            .collect_vec();
        let rules = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, rules).unwrap();
        let risk_signals = make_risk_signals(conn, &sv.id, risk_signals);

        // Eval
        let docs_collected = if doc_collected {
            vec![DocumentRequestKind::Identity]
        } else {
            vec![]
        };
        let config = RuleEvalConfig::new(docs_collected);
        let (rule_set_result, rule_results) = evaluate_rules(
            conn,
            &sv.id,
            &obc,
            None,
            RuleSetResultKind::Adhoc,
            &risk_signals,
            &VaultDataForRules::empty(), // TODO add tests for vd rules
            &[],
            &HashMap::new(),
            &config,
            IncludeRules::All,
        )
        .unwrap()
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
