use std::collections::HashMap;

use super::{
    default_rules::base_kyc_rules,
    eval::{self, Rule, RuleEvalConfig},
};
use crate::{
    decision::{onboarding::Decision, RuleError},
    enclave_client::EnclaveClient,
    errors::ApiResult,
    utils::vault_wrapper::{DecryptUncheckedResult, VaultWrapper},
};
use db::{
    models::{
        document_request::DocumentRequest,
        insight_event::InsightEvent,
        list_entry::ListWithDecryptedEntries,
        ob_configuration::ObConfiguration,
        risk_signal::RiskSignal,
        rule_instance::{IncludeRules, RuleInstance},
        rule_result::RuleResult,
        rule_set_result::{NewRuleResultArgs, NewRuleSetResultArgs, RuleSetResult},
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    DocumentRequestKind, ListId, ObConfigurationId, ObConfigurationKind, RiskSignalGroupKind,
    RuleExpressionCondition, RuleSetResultId, RuleSetResultKind, ScopedVaultId, WorkflowId,
};

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
) -> ApiResult<(Decision, Option<RuleSetResultId>)> {
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
        return Ok((Decision::RulesNotExecuted, None));
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
    let is_kyc_playbook = obc.kind == ObConfigurationKind::Kyc;
    let decision = Decision::RulesExecuted {
        should_commit: !is_fixture && is_kyc_playbook && should_commit_action.is_none(),
        create_manual_review: rule_set_result
            .action_triggered
            .map(|ra| ra.should_create_review())
            .unwrap_or(false),
        action: rule_set_result.action_triggered,
    };
    Ok((decision, Some(rule_set_result.id)))
}

#[derive(derive_more::Deref)]
pub struct VaultDataForRules {
    vault_data: DecryptUncheckedResult, // at this point could mb even just have this be HashMap<K,V> where we type up which K's correspond to which V's and V's encode the type like String vs Date vs etc
}

impl VaultDataForRules {
    pub async fn decrypt_for_rules(
        enclave_client: &EnclaveClient,
        vw: VaultWrapper,
        rules: &[RuleInstance],
    ) -> ApiResult<Self> {
        // could mb query for the VW here too..? gotta somehow use this ish for bulk flow too tho
        let dis = rules
            .iter()
            .flat_map(|r| &(r.rule_expression.0))
            .flat_map(|rc| match rc {
                RuleExpressionCondition::VaultData(vd) => Some(vd.field()),
                _ => None,
            })
            .cloned()
            .collect_vec();

        let vault_data = vw.decrypt_unchecked(enclave_client, &dis).await?;
        Ok(Self { vault_data })
    }

    pub fn empty() -> Self {
        Self {
            vault_data: DecryptUncheckedResult::default(),
        }
    }

    #[cfg(test)]
    pub fn new(vault_data: DecryptUncheckedResult) -> Self {
        Self { vault_data }
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
) -> ApiResult<Option<(RuleSetResult, Vec<RuleResult>)>> {
    let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, rule_kinds)?;
    if rules.is_empty() {
        if obc.kind == ObConfigurationKind::Document {
            // Document-only playbooks are allowed to have no rules if they want to maintain
            // the existing status.
            // One day, we should probably further generalize this to be a "collection-only"
            // playbook that just doesn't run rules
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
    use db::{
        models::{rule_instance::NewRule, scoped_vault::ScopedVault},
        test_helpers::assert_have_same_elements,
        tests::{fixtures::ob_configuration::ObConfigurationOpts, prelude::*},
    };
    use diesel::prelude::*;
    use eval::tests::TRule;
    use macros::db_test_case;
    use newtypes::{
        BooleanOperator as BO, DbActor, DecisionIntentKind, DocumentRequestKind, FootprintReasonCode as FRC,
        RiskSignalGroupKind, RiskSignalId, RuleAction as RA, RuleExpression as RE,
        RuleExpressionCondition as REC, RuleInstanceKind, VendorAPI,
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
