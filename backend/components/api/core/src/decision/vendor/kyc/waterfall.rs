use std::collections::HashMap;

use crate::{
    decision::{
        self,
        rule_engine::{
            engine::VaultDataForRules,
            eval::{Rule, RuleEvalConfig},
        },
        vendor::{
            get_vendor_apis_for_verification_requests, kyc, make_request,
            tenant_vendor_control::TenantVendorControl,
            vendor_result::{HydratedVerificationResult, RequestAndMaybeHydratedResult, VendorResult},
            VendorAPIError,
        },
    },
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiErrorKind, State,
};
use db::models::{
    decision_intent::DecisionIntent, ob_configuration::ObConfiguration, scoped_vault::ScopedVault,
    verification_request::VerificationRequest, verification_result::VerificationResult,
};
use feature_flag::BoolFlag;
use idv::VendorResponse;
use itertools::Itertools;
use newtypes::{RuleAction, VendorAPI, WorkflowId};
use std::future::Future;
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, EnumIter)]
// For now, we just have 1 singular KYC waterfall ordering for all vendors. We start with Experian and then waterfall to Idology if needed.
// (we still only make vendor calls that are available to the tenant as dictated by tvc)
pub enum KycVendorApiOrder {
    Experian,
    Idology,
}

impl From<KycVendorApiOrder> for VendorAPI {
    fn from(value: KycVendorApiOrder) -> Self {
        match value {
            KycVendorApiOrder::Experian => VendorAPI::ExperianPreciseId,
            KycVendorApiOrder::Idology => VendorAPI::IdologyExpectId,
        }
    }
}

// Constructs a Vec with every available KYC VendorAPI in the correct waterfall order, with the accompanying Vreq+Vres (if any)
#[tracing::instrument(skip(latest_results))]
fn get_waterfall_vec(
    available_vendor_apis: Vec<VendorAPI>,
    latest_results: Vec<RequestAndMaybeHydratedResult>,
) -> Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)> {
    let vendor_api_to_latest_result: HashMap<VendorAPI, RequestAndMaybeHydratedResult> = latest_results
        .into_iter()
        .map(|r| (r.vreq.vendor_api, r))
        .collect();

    KycVendorApiOrder::iter()
        .map(VendorAPI::from)
        .filter(|vendor_api| available_vendor_apis.contains(vendor_api))
        .map(|vendor_api| (vendor_api, vendor_api_to_latest_result.get(&vendor_api).cloned()))
        .collect()
}

#[tracing::instrument(skip(state))]
pub async fn run_kyc_waterfall(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> ApiResult<VendorResult> {
    let svid = di.scoped_vault_id.clone();
    let diid = di.id.clone();
    let wf_id = wf_id.clone();
    let (latest_results, tenant_id, vw, obc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;

            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &diid)?;

            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            let obc = ObConfiguration::get(conn, &wf_id)?.0;

            Ok((latest_results, sv.tenant_id, vw, obc))
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

    let latest_results =
        VendorResult::hydrate_vendor_results(latest_results, &state.enclave_client, &vw.vault.e_private_key)
            .await?;

    let available_vendor_apis = get_vendor_apis_for_verification_requests(vw.populated().as_slice(), &tvc)?;
    let waterfall_vec = get_waterfall_vec(available_vendor_apis.clone(), latest_results.clone());

    let sv_id = di.scoped_vault_id.clone();
    let di_id = di.id.clone();
    tracing::info!(
        ?available_vendor_apis,
        waterfall_vec_len = waterfall_vec.len(),
        latest_results_len = latest_results.len(),
        scoped_vault_id = ?sv_id,
        decision_intent_id = ?di_id,
        "run_kyc_waterfall starting waterfall_loop"
    );

    let rule_config = if state
        .feature_flag_client
        .flag(BoolFlag::IsKycWaterfallOnRuleFailureEnabled(&tenant_id))
    {
        WaterfallRuleConfig::Enabled {
            vw: vw.clone(),
            obc: obc.clone(),
        }
    } else {
        WaterfallRuleConfig::Disabled
    };

    // best effort call Lexis but don't use results for anything
    match kyc::lexis::maybe_shadow_call_lexis(state, &tvc, &sv_id, &di_id, &obc, &vw).await {
        Ok(_) => {}
        Err(err) => {
            tracing::error!(?err, "Error shadow calling Lexis");
        }
    };

    waterfall_loop(
        waterfall_vec,
        |vendor_api| {
            make_request::make_idv_vendor_call_save_vreq_vres(
                state,
                &tvc,
                &sv_id,
                &di_id,
                ob_configuration_key.clone(),
                vendor_api,
            )
        },
        rule_config,
    )
    .await
}

#[tracing::instrument(skip_all)]
async fn waterfall_loop<F, Fut>(
    mut waterfall_vec: Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)>,
    make_vendor_call: F,
    rule_config: WaterfallRuleConfig,
) -> ApiResult<VendorResult>
// TODO: refactor to just return a singular VendorResult
where
    F: Fn(VendorAPI) -> Fut,
    Fut: Future<
        Output = ApiResult<(
            VerificationRequest,
            VerificationResult,
            Result<VendorResponse, VendorAPIError>,
        )>,
    >,
{
    // if we already have a successful response then we are done and just return that successful response.
    // for now, this would most likely just 1 response since our current waterfall strategy is to only waterfall on hard errors and stop when we get 1 success
    // If this case is hit, that really means that we complted the waterfall successfully but then crashed before completing `on_commit` and advancing the workflow
    let success_responses = get_successful_vendor_responses(waterfall_vec.clone());
    if let Some(success_vr) = success_responses.last() {
        // TODO: now that we are potentially waterfalling on rule failure, if we crash midway and then restart and the lastest call was a non-error but rule failing response, then we'll just return here instead of waterfalling like we might be needing to do.
        tracing::info!(
            success_responses_len = success_responses.len(),
            "[waterfall_loop] success_response already exists, returning"
        );
        return Ok(success_vr.clone());
    }

    let mut i = 0;
    let mut have_attempted_call = false;

    // collect all successful results. These are what we would write risk signals from in the workflow state `on_commit`
    // hypothetically, at least with our current waterfall logic, we'd just return 1 single VendoResult (since we stop when we get a good repsonse from a vendor)
    // but probably pretty soon, we will extend our logic here to waterfall not only on hard errors but also on vendor responses that fail the user
    loop {
        tracing::info!(waterfall_vec_len=?waterfall_vec.len(), "[waterfall_loop] loop");
        let vr = waterfall_vec.get(i).cloned();
        let Some((vendor_api, req_res)) = vr else {
            // we have exhausted the waterfall of vendors to try
            // ugh this sucks but kinda painted myself in a corner here, TODO: refactor/rewrite waterfall_loop so its cleaner now that we've added in rule failure waterfalling
            // we've exhausted vendors to try but the latest (or some) vendor we did try may have had a successful (but rule failing) response and so we want to return that and have the user fail rather than throw an error
            let final_vendor_responses = get_successful_vendor_responses(waterfall_vec);
            if let Some(vr) = final_vendor_responses.last() {
                tracing::info!(
                    "[waterfall_loop] exhausted vendors but returning latest non-error vendor response"
                );
                return Ok(vr.clone());
            } else {
                tracing::info!("[waterfall_loop] exhausted vendors and no non-error vendor response was received, erroring");
                return Err(ApiErrorKind::VendorRequestsFailed.into());
            }
        };
        match next_action(&req_res, have_attempted_call, rule_config.clone()) {
            Action::Done => {
                tracing::info!(?vendor_api, "[waterfall_loop] Done");
                break;
            }
            Action::MakeCall => {
                tracing::info!(?vendor_api, "[waterfall_loop] MakeCall");
                let (vreq, vres, res) = make_vendor_call(vendor_api).await?;
                have_attempted_call = true;
                waterfall_vec[i] = (
                    vendor_api,
                    Some(RequestAndMaybeHydratedResult {
                        vreq,
                        vres: Some(HydratedVerificationResult {
                            vres,
                            response: res.ok(),
                        }),
                    }),
                );
            }
            Action::TryNextVendor => {
                tracing::info!(?vendor_api, ?i, "[waterfall_loop] TryNextVendor");
                have_attempted_call = false;
                i += 1;
            }
        }
    }
    let final_vendor_responses = get_successful_vendor_responses(waterfall_vec);
    tracing::info!(final_vendor_responses_len=?final_vendor_responses.len(), "[waterfall_loop] loop finished, returning successful vendor response");
    if let Some(vr) = final_vendor_responses.last() {
        Ok(vr.clone())
    } else {
        Err(ApiErrorKind::VendorRequestsFailed.into())
    }
}

#[tracing::instrument(skip_all)]
fn get_successful_vendor_responses(
    waterfall_vec: Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)>,
) -> Vec<VendorResult> {
    waterfall_vec
        .into_iter()
        .filter_map(|(_, vreq_vres)| vreq_vres.and_then(|vreq_vres| vreq_vres.into_vendor_result()))
        .collect()
}

pub(super) enum Action {
    Done,
    MakeCall,
    TryNextVendor,
}

#[allow(clippy::collapsible_match)]
#[tracing::instrument(skip_all)]
fn next_action(
    req_res: &Option<RequestAndMaybeHydratedResult>,
    have_attempted_call: bool,
    rule_config: WaterfallRuleConfig,
) -> Action {
    match req_res {
        Some(vreq_vres) => match &vreq_vres.vres {
            Some(res) => {
                if res.vres.is_error {
                    // Right now, we retry transient errors within the client themselves. If the retry strategy doesn't succeed in a few seconds, then
                    // we will save a vres with is_error = true. Normally, we'd proceed with trying the next vendor. But if there is no next vendor available,
                    // then we would have to hard error and in those cases we would want to manually trigger re-attempting of vendor calls (ie prompting stuck workflows via /proceed).
                    // To enable that, if this is the first call in the attempt of running vendor calls, we will make a vendor call instead of trying to proceed to the next vendor
                    // (if we instead had logic that said "makecall if there is no next vendor", then we would infinite loop trying the last failing vendor)
                    if !have_attempted_call {
                        Action::MakeCall
                    } else {
                        Action::TryNextVendor
                    }
                } else {
                    // We have a vreq with a successful vres
                    // if we have waterfalling on rule failure enabled, then we should execute rules and determine the next action based on that. If not, we can just return Action::Done

                    let Some(vr) = vreq_vres.clone().into_vendor_result() else {
                        // this should only be None if is_error = true so this case shouldn't be possible. Should rework HydratedVerificationResult and such to better represent this but for now just do this to be safe
                        return Action::TryNextVendor;
                    };

                    match rule_config {
                        WaterfallRuleConfig::Disabled => Action::Done,
                        WaterfallRuleConfig::Enabled { vw, obc } => {
                            // mb unnecessary and could `?` here but for now to be a bit safer, just log error and default to `Done` if there is an error in rule eval
                            match eval_rules(vr, &vw, &obc) {
                                Ok(action) => action,
                                Err(_) => Action::Done,
                            }
                        }
                    }
                }
            }
            // We have a vreq with no accompanying vres. Theoretically means we crashed before saving the vres. We should just make a brand new call and save a new vreq+vres
            None => Action::MakeCall,
        },
        // We have not attempted calling this vendor at all yet (no Vreq exists) so we should make a call
        None => Action::MakeCall,
    }
}

#[tracing::instrument(skip_all)]
pub(super) fn eval_rules(res: VendorResult, vw: &VaultWrapper, obc: &ObConfiguration) -> ApiResult<Action> {
    let vendor_api = res.vendor_api();
    let vault_id = vw.vault.id.clone();
    // this does a lot of unnecessary stuff and has a lot of layers of unnecessary indirection but unfortunately this is the safest way to produce risk signals here without diverging too much from how other code paths do this
    let reason_codes = decision::features::risk_signals::parse_reason_codes_from_vendor_result(res, vw)?
        .kyc
        .footprint_reason_codes
        .into_iter()
        .map(|(frc, _, _)| frc)
        .collect_vec();

    let rules: Vec<_> = [
        decision::rule_engine::default_rules::base_kyc_rules(),
        decision::rule_engine::default_rules::ssn_rules(),
    ]
    .concat()
    .into_iter()
    .map(|(re, ra)| Rule {
        expression: re,
        action: ra,
    })
    .collect();
    let (rule_results, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
        rules,
        &reason_codes,
        &VaultDataForRules::empty(),
        &[],
        &HashMap::new(),
        &RuleEvalConfig::default(),
    );

    tracing::info!(
        %vendor_api,
        %vault_id,
        tenant_id=%obc.tenant_id,
        obc_id=%obc.id,
        obc_key=%obc.key,
        ?rule_results,
        ?action_triggered,
        ?reason_codes,
        "kyc_waterfall rule evaluation"
    );

    let action = match action_triggered {
        None => Action::Done,
        Some(ra) => match ra {
            RuleAction::PassWithManualReview => Action::Done,
            RuleAction::ManualReview | RuleAction::StepUp(_) | RuleAction::Fail => Action::TryNextVendor,
        },
    };
    Ok(action)
}

#[derive(Clone)]
#[allow(clippy::large_enum_variant)]
enum WaterfallRuleConfig {
    Disabled,
    Enabled {
        vw: VaultWrapper,     // needed for risk signal generation
        obc: ObConfiguration, // needed for risk signal generation
    },
}
