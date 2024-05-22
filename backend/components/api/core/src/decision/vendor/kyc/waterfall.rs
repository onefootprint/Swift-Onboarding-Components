use std::collections::HashMap;

use crate::{
    decision::{
        self,
        rule_engine::{engine::VaultDataForRules, eval::RuleEvalConfig},
        vendor::{
            get_vendor_apis_for_verification_requests,
            kyc::waterfall_rules::WaterfallRuleAction,
            make_request,
            tenant_vendor_control::TenantVendorControl,
            vendor_result::{HydratedVerificationResult, RequestAndMaybeHydratedResult, VendorResult},
        },
    },
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiErrorKind, State,
};
use db::models::{
    billing_event::BillingEvent,
    decision_intent::DecisionIntent,
    ob_configuration::ObConfiguration,
    scoped_vault::ScopedVault,
    verification_request::VReqIdentifier,
    waterfall_execution::{UpdateWaterfallExecution, WaterfallExecution},
    waterfall_step::{UpdateWaterfallStep, WaterfallStep},
};
use itertools::Itertools;
use newtypes::{
    BillingEventKind, ObConfigurationId, ScopedVaultId, VerificationResultId, WaterfallExecutionId,
    WaterfallStepAction, WorkflowId,
};

use super::waterfall_vendor_api::WaterfallVendorAPI;


#[tracing::instrument(skip(state))]
pub async fn run_kyc_waterfall(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> ApiResult<VendorResult> {
    let svid = di.scoped_vault_id.clone();
    let wf_id = wf_id.clone();
    let (tenant_id, vw, obc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            let obc = ObConfiguration::get(conn, &wf_id)?.0;

            Ok((sv.tenant_id, vw, obc))
        })
        .await?;
    let ob_configuration_key = obc.key.clone();
    let tvc = TenantVendorControl::new(
        tenant_id.clone(),
        &state.db_pool,
        &state.config,
        &state.enclave_client,
    )
    .await?;

    let available_vendor_apis = get_vendor_apis_for_verification_requests(vw.populated().as_slice(), &tvc)?;
    let ordered_apis = WaterfallVendorAPI::ordered_apis(available_vendor_apis.clone());
    let ordered_apis2 = ordered_apis.clone();

    let diid2 = di.id.clone();
    let waterfall_execution = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let wfe = WaterfallExecution::get_or_create(
                conn,
                ordered_apis2.into_iter().map(|v| v.into()).collect(),
                &diid2,
            )?;
            Ok(wfe)
        })
        .await?;

    //
    // BEGIN WATERFALL LOGIC
    //
    // check if we have any existing results
    let id = VReqIdentifier::DiId(di.id.clone());
    let existing_successful_results =
        WaterfallVendorAPI::get_all_vendor_results(state, id, &vw.vault.e_private_key).await?;

    // First, check if we already have a _successful_ (not a rule-passing) vendor result for this DI.
    // If we do, this means we crashed somewhere after the waterfall started and we're now re-running it.
    // Eventually we might want to try re-running rules and re-running the waterfall but for now, we just exit early
    if let Some(already_have_success_vr) =
        choose_best_waterfall_vendor_response(existing_successful_results, &vw, &obc)
    {
        complete_waterfall_execution(state, &di.scoped_vault_id, &obc.id, &waterfall_execution.id).await?;

        return Ok(already_have_success_vr.clone());
    }

    // RUN WATERFALL
    let mut final_results = vec![];
    for waterfall_vendor_api in ordered_apis {
        let eid = waterfall_execution.id.clone();
        let eid2 = eid.clone();
        let v_api = waterfall_vendor_api.clone().into();
        let step = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let locked = WaterfallExecution::lock(conn, &eid)?;
                let step = WaterfallExecution::create_step(locked, conn, v_api)?;
                Ok(step)
            })
            .await?;

        // Make the vendor request
        let (vreq, vres, res) = make_request::make_idv_vendor_call_save_vreq_vres(
            state,
            &tvc,
            &di.scoped_vault_id,
            &di.id,
            ob_configuration_key.clone(),
            waterfall_vendor_api.into(),
        )
        .await?;
        let vres_id = vres.id.clone();

        // package up our response from a vendor
        let hvres = (!vres.is_error).then_some(HydratedVerificationResult {
            vres,
            response: res.ok(),
        });
        let vendor_result = RequestAndMaybeHydratedResult { vreq, vres: hvres }.into_vendor_result();

        // evaluate WF Rules and determine the next (control flow action, rule action)
        let step_result = if let Some(vr) = vendor_result.clone() {
            match eval_waterfall_rules(vr, &vw, &obc) {
                Ok(action) => action,
                // we should never err from evaluating rules in theory
                Err(_) => {
                    WaterfallStepResult::new_with_action_only(WaterfallControlFlowAction::TryNextVendor)
                }
            }
        } else {
            // this case means we had an error response from a vendor
            WaterfallStepResult {
                action: WaterfallControlFlowAction::TryNextVendor,
                rules_result: None,
                waterfall_step_action: Some(WaterfallStepAction::VendorError),
                verification_result_id: Some(vres_id),
                verification_result_is_error: Some(true),
            }
        };

        // Update our WaterfallStep with the results
        let sr2 = step_result.clone();
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let locked = WaterfallExecution::lock(conn, &eid2)?;
                let update = UpdateWaterfallStep::save_step_result(
                    sr2.verification_result_id,
                    sr2.verification_result_is_error,
                    sr2.waterfall_step_action,
                    sr2.rules_result,
                );
                let _ = WaterfallStep::update(locked, conn, step.id, update)?;
                Ok(())
            })
            .await?;

        final_results.push(vendor_result);
        if matches!(step_result.action, WaterfallControlFlowAction::Done) {
            // if we are done, exit the loop
            break;
        }
    }

    complete_waterfall_execution(state, &di.scoped_vault_id, &obc.id, &waterfall_execution.id).await?;
    let final_result =
        choose_best_waterfall_vendor_response(final_results.into_iter().flatten().collect(), &vw, &obc);

    if let Some(vr) = final_result {
        Ok(vr)
    } else {
        Err(ApiErrorKind::VendorRequestsFailed.into())
    }
}

// We evaluate the rules twice in the waterfall - once to determine waterfalling control flow and the second time
// to determine the "best" action. For example, IdNotLocated < IdFlagged (since IdFlagged gives a tenant more info on the user)
#[tracing::instrument(skip_all)]
fn choose_best_waterfall_vendor_response(
    final_results: Vec<VendorResult>,
    vw: &VaultWrapper,
    obc: &ObConfiguration,
) -> Option<VendorResult> {
    final_results
        .into_iter()
        .filter_map(|vr| {
            eval_waterfall_rules(vr.clone(), vw, obc)
                .ok()
                .map(|result| (vr, result))
        })
        .min_by_key(|(_, rule_result)| rule_result.waterfall_step_action)
        .map(|(vr, _)| vr)
}

/// Complete the WFE DB model
#[tracing::instrument(skip_all)]
async fn complete_waterfall_execution(
    state: &State,
    sv_id: &ScopedVaultId,
    obc_id: &ObConfigurationId,
    execution_id: &WaterfallExecutionId,
) -> ApiResult<()> {
    let eid = execution_id.clone();
    let sv_id = sv_id.clone();
    let obc_id = obc_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let locked = WaterfallExecution::lock(conn, &eid)?;
            if locked.completed_at.is_some() {
                return Ok(());
            }
            let update = UpdateWaterfallExecution::set_completed_at();
            let waterfall_steps = WaterfallStep::list(conn, &locked.id)?;
            let num_non_error_vendors = waterfall_steps
                .iter()
                .filter(|ws| !ws.verification_result_is_error.unwrap_or_default())
                .count();
            let kyc_billing_event_kinds = vec![
                BillingEventKind::Kyc,
                BillingEventKind::KycWaterfallSecondVendor,
                BillingEventKind::KycWaterfallThirdVendor,
            ];
            if num_non_error_vendors > kyc_billing_event_kinds.len() {
                tracing::error!(
                    num_steps=%num_non_error_vendors,
                    "More waterfall steps than kyc waterfall vendors"
                );
            }
            let events_to_create = kyc_billing_event_kinds
                .into_iter()
                .take(num_non_error_vendors)
                .collect_vec();
            for kind in events_to_create {
                BillingEvent::create(conn, &sv_id, &obc_id, kind)?;
            }
            let _ = WaterfallExecution::update(locked, conn, update)?;
            Ok(())
        })
        .await?;


    Ok(())
}

#[derive(Clone, Copy)]
pub(super) enum WaterfallControlFlowAction {
    Done,
    TryNextVendor,
}


#[derive(Clone)]
pub(super) struct WaterfallStepResult {
    pub action: WaterfallControlFlowAction,
    pub rules_result: Option<serde_json::Value>,
    pub waterfall_step_action: Option<WaterfallStepAction>,
    pub verification_result_id: Option<VerificationResultId>,
    pub verification_result_is_error: Option<bool>,
}


impl WaterfallStepResult {
    pub fn new_with_action_only(action: WaterfallControlFlowAction) -> Self {
        Self {
            action,
            rules_result: None,
            waterfall_step_action: None,
            verification_result_id: None,
            verification_result_is_error: None,
        }
    }
}


#[tracing::instrument(skip_all)]
pub(super) fn eval_waterfall_rules(
    res: VendorResult,
    vw: &VaultWrapper,
    obc: &ObConfiguration,
) -> ApiResult<WaterfallStepResult> {
    let vendor_api = res.vendor_api();
    let vault_id = vw.vault.id.clone();
    let reason_codes =
        decision::features::risk_signals::parse_reason_codes_from_vendor_result(res.clone(), vw)?
            .kyc
            .footprint_reason_codes
            .into_iter()
            .map(|(frc, _, _)| frc)
            .collect_vec();

    // Waterfall Rules Logic
    //    At this point (2024-05-07), the goal of the waterfall is to do a best-effort at _locating_ an individual and matching important KYC fields like SSN
    //
    // To that extent, we want to waterfall in 3 cases
    // -  1. Identity was not located
    // -  2. Identity was not *confidently* located (i.e. id_flagged)
    // -  3. There is an SSN mismatch
    //
    //  We evaluate the rules twice in the waterfall - once to determine waterfalling control flow and the second time
    //  to determine the "best" action.
    // For example, IdNotLocated < IdFlagged (since IdFlagged gives a tenant more info on the user)
    //   Experian -> IdFlagged => we want to continue on the Idology to try and locate
    //   Idology -> IdNotLocated
    //   Overall we want to choose Experian in this case
    let rules = super::waterfall_rules::waterfall_rules();

    let (rule_results, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
        rules,
        &reason_codes,
        &VaultDataForRules::empty(),
        &[],
        &HashMap::new(),
        &RuleEvalConfig::default(),
    );

    let (control_flow_action, waterfall_step_action) = match action_triggered {
        Some(ra) => {
            let reason = match ra {
                WaterfallRuleAction::IdFlagged => WaterfallStepAction::IdFlagged,
                WaterfallRuleAction::RuleTriggered => WaterfallStepAction::RuleTriggered,
            };

            (WaterfallControlFlowAction::TryNextVendor, reason)
        }
        None => (WaterfallControlFlowAction::Done, WaterfallStepAction::Pass),
    };

    tracing::info!(
        %vendor_api,
        %vault_id,
        tenant_id=%obc.tenant_id,
        obc_id=%obc.id,
        obc_key=%obc.key,
        ?reason_codes,
        version=2,
        "kyc_waterfall rule evaluation"
    );

    let res = WaterfallStepResult {
        action: control_flow_action,
        rules_result: serde_json::to_value(rule_results).ok(),
        waterfall_step_action: Some(waterfall_step_action),
        verification_result_id: Some(res.verification_result_id.clone()),
        verification_result_is_error: Some(false),
    };
    Ok(res)
}
