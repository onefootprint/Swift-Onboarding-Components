use std::{collections::HashMap, sync::Arc};

use super::{
    features::kyc_features::KycFeatureVector,
    onboarding::{
        calculate_kyc_rules_output_with_waterfall, DecisionReasonCodes, FeatureVector, KycRuleGroup,
        OnboardingRulesDecisionOutput, WaterfallOnboardingRulesDecisionOutput,
    },
    vendor::{
        make_request::{VerificationRequestWithVendorError, VerificationRequestWithVendorResponse},
        tenant_vendor_control::TenantVendorControl,
        vendor_result::VendorResult,
        verification_result,
    },
    *,
};
use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiResult},
    metrics,
    vendor_clients::VendorClient,
};
use db::{
    models::{
        onboarding::Onboarding,
        risk_signal::RiskSignal,
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbError, DbPool, TxnPgConn,
};
use either::Either;
use feature_flag::FeatureFlagClient;
use idv::{
    experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};

use itertools::Itertools;
use newtypes::{
    ObConfigurationId, OnboardingId, PiiJsonValue, ReviewReason, RiskSignalGroupKind, ScopedVaultId,
    VaultKind, VerificationRequestId, VerificationResultId, WorkflowId,
};
use prometheus::labels;

pub async fn make_onboarding_decision<T>(
    ob: &Onboarding,
    fv: T,
    db_pool: &DbPool,
    verification_result_ids: Vec<VerificationResultId>,
    vault_kind: VaultKind,
) -> ApiResult<()>
where
    T: FeatureVector + Send + Sync,
{
    // Calculate output from rules + features
    let (rules_output, reason_codes) = fv.evaluate()?;

    let ob = ob.clone();
    db_pool
        .db_transaction(move |conn| {
            // Save/action/emit risk signals for the decision

            // TODO: remove make_onboarding_decision entirely. used only by the now dead engine::run and the private/protected/make_decision endpoint
            let rsg_kind = match vault_kind {
                VaultKind::Person => RiskSignalGroupKind::Kyc,
                VaultKind::Business => RiskSignalGroupKind::Kyb,
            };
            RiskSignal::bulk_create(conn, &ob.scoped_vault_id, reason_codes, rsg_kind)?;

            save_onboarding_decision(
                conn,
                &ob,
                rules_output,
                verification_result_ids,
                true,
                false,
                None,
                vec![],
            )
        })
        .await
}

pub async fn save_vendor_responses(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    vendor_error_responses: Vec<(VerificationRequest, Option<PiiJsonValue>)>,
    onboarding_id: &OnboardingId,
) -> ApiResult<Vec<VendorResult>> {
    let obid = onboarding_id.clone();

    let responses = vendor_responses.to_owned();
    let results = db_pool
        .db_transaction(move |conn| -> ApiResult<Vec<VendorResult>> {
            let uv = Vault::get(conn, &obid)?;
            let vres = verification_result::save_verification_results(conn, &responses, &uv.public_key)?;
            verification_result::save_error_verification_results(
                conn,
                &vendor_error_responses,
                &uv.public_key,
            )?; // Match on errors that are parsable

            let mut verification_results: HashMap<VerificationRequestId, VerificationResult> =
                vres.into_iter().map(|vr| (vr.request_id.clone(), vr)).collect();

            let results: Vec<VendorResult> = responses
                .iter()
                .map(|(req, res)| -> ApiResult<VendorResult> {
                    let verification_result = verification_results
                        .remove(&req.id)
                        .ok_or(DbError::RelatedObjectNotFound)?;

                    Ok(VendorResult {
                        response: res.clone(),
                        verification_result_id: verification_result.id,
                        verification_request_id: req.id.clone(),
                    })
                })
                .collect::<Result<Vec<VendorResult>, _>>()?;
            Ok(results)
        })
        .await?;
    Ok(results)
}

pub struct VendorRequests {
    pub completed_requests: Vec<VendorResult>,
    pub outstanding_requests: Vec<VerificationRequest>, // requests that we do not yet have results for
}

#[tracing::instrument(skip(db_pool, enclave_client))]
pub async fn get_latest_verification_requests_and_results(
    onboarding_id: &OnboardingId,
    scoped_user_id: &ScopedVaultId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> ApiResult<VendorRequests> {
    let suid = scoped_user_id.clone();
    let requests_and_results = db_pool
        .db_query(move |conn| -> Result<Vec<RequestAndMaybeResult>, DbError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, suid)
        })
        .await??;

    let obid = onboarding_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &obid)).await??;

    let previous_results = vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
        requests_and_results.clone(),
        enclave_client,
        &uv.e_private_key,
    )
    .await?;

    let requests: Vec<VerificationRequest> = requests_and_results
        .into_iter()
        .filter_map(|(request, result)| {
            // Only send requests for which we don't already have a result
            if result.is_none() {
                Some(request)
            } else {
                None
            }
        })
        .collect();

    Ok(VendorRequests {
        completed_requests: previous_results,
        outstanding_requests: requests,
    })
}

pub struct VendorResults {
    pub successful: Vec<VerificationRequestWithVendorResponse>,
    pub non_critical_errors: Vec<VerificationRequestWithVendorError>,
    pub critical_errors: Vec<VerificationRequestWithVendorError>,
}

impl VendorResults {
    pub fn all_errors(&self) -> Vec<&ApiError> {
        self.critical_errors
            .iter()
            .chain(self.non_critical_errors.iter())
            .map(|(_, e)| e)
            .collect()
    }

    pub fn all_errors_with_parsable_requests(&self) -> Vec<(VerificationRequest, Option<PiiJsonValue>)> {
        self.critical_errors
            .iter()
            .map(Self::construct_requests_with_responses_for_verification_result)
            .chain(
                self.non_critical_errors
                    .iter()
                    .map(Self::construct_requests_with_responses_for_verification_result),
            )
            .collect()
    }
}

impl VendorResults {
    fn construct_requests_with_responses_for_verification_result(
        v: &VerificationRequestWithVendorError,
    ) -> (VerificationRequest, Option<PiiJsonValue>) {
        match v {
            (req, ApiError::VendorRequestFailed(ve)) => match &ve.error {
                idv::Error::IDologyError(idv::idology::error::Error::ErrorWithResponse(e)) => {
                    (req.clone(), Some(e.response.clone()))
                }
                idv::Error::ExperianError(idv::experian::error::Error::ErrorWithResponse(e)) => {
                    (req.clone(), Some(e.response.clone()))
                }
                // TODO: non-ideal to have empty json, should make response optional
                _ => (req.clone(), None),
            },
            (req, _) => (req.clone(), None),
        }
    }
}

fn partition_vendor_errors(
    raw_results: Vec<Result<VerificationRequestWithVendorResponse, VerificationRequestWithVendorError>>,
) -> VendorResults {
    // TODO: This just fails if any vendor requests return errors. We should handle these appropriately somewhere!

    let (successful, errors): (
        Vec<VerificationRequestWithVendorResponse>,
        Vec<VerificationRequestWithVendorError>,
    ) = raw_results.into_iter().partition_map(|r| match r {
        Ok(vr) => Either::Left(vr),
        Err(e) => Either::Right(e),
    });

    let (critical_errors, non_critical_errors) = errors.into_iter().partition(|(_, e)| {
        match e {
            ApiError::VendorRequestFailed(vendor_api_error) => {
                if utils::should_throw_error_in_decision_engine_if_error_in_request(&vendor_api_error.vendor_api) {
                    true
                } else {
                    tracing::warn!(vendor_api=%&vendor_api_error.vendor_api, "Vendor request failed, but not bailing out of decision engine run");
                    false
                }
            }
            _ => true,
        }
    });

    VendorResults {
        successful,
        non_critical_errors,
        critical_errors,
    }
}

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub async fn make_vendor_requests(
    db_pool: &DbPool,
    onboarding_id: &OnboardingId,
    enclave_client: &EnclaveClient,
    is_production: bool,
    requests: Vec<VerificationRequest>,
    ff_client: Arc<dyn FeatureFlagClient>,
    idology_client: VendorClient<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: VendorClient<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: TenantVendorControl,
) -> ApiResult<VendorResults> {
    // Make requests
    let results = vendor::make_request::make_vendor_requests(
        requests,
        onboarding_id,
        db_pool,
        enclave_client,
        is_production,
        ff_client,
        idology_client,
        socure_client,
        twilio_client,
        experian_client,
        tenant_vendor_control,
    )
    .await?;

    Ok(partition_vendor_errors(results))
}

/// Separate creating decision from saving decision. Used to "dry run" a decision before applying
pub fn calculate_decision(
    vendor_results: Vec<VendorResult>,
    rule_group: KycRuleGroup,
) -> ApiResult<(
    OnboardingRulesDecisionOutput,
    DecisionReasonCodes,
    KycFeatureVector,
)> {
    // From our results, create a FeatureVector for the final decision output
    let fv = features::kyc_features::create_features(vendor_results);
    let (decision, reason_codes) = calculate_kyc_rules_output_with_waterfall(&fv, rule_group)?;

    Ok((decision.output, reason_codes, fv))
}

/// Create and save an onboarding decision
#[allow(clippy::too_many_arguments)]
pub fn save_onboarding_decision(
    conn: &mut TxnPgConn,
    ob: &Onboarding,
    rules_output: WaterfallOnboardingRulesDecisionOutput,
    verification_result_ids: Vec<VerificationResultId>,
    assert_is_first_decision_for_onboarding: bool,
    is_sandbox: bool,
    workflow_id: Option<WorkflowId>,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    let onboarding_decision = risk::save_final_decision(
        conn,
        ob.id.clone(),
        verification_result_ids,
        &rules_output.output,
        assert_is_first_decision_for_onboarding,
        workflow_id,
        review_reasons,
    )?;

    let status = onboarding_decision.status.to_string();
    if let Ok(metric) =
        metrics::DECISION_ENGINE_ONBOARDING_DECISION.get_metric_with(&labels! {"status" => status.as_str()})
    {
        metric.inc();
    }

    if !is_sandbox {
        // Log our canonical line
        log_rule_evaluation(
            &ob.id,
            &ob.ob_configuration_id,
            &ob.scoped_vault_id,
            &rules_output.output,
            rule::CANONICAL_ONBOARDING_RULE_LINE,
        );

        // Log any additional decisions
        rules_output.additional_evaluated.into_iter().for_each(|output| {
            log_rule_evaluation(
                &ob.id,
                &ob.ob_configuration_id,
                &ob.scoped_vault_id,
                &output,
                "additional_decisions_for_onboarding",
            )
        });
    }

    Ok(())
}

fn log_rule_evaluation(
    ob_id: &OnboardingId,
    obc_id: &ObConfigurationId,
    sv_id: &ScopedVaultId,
    rule_output: &OnboardingRulesDecisionOutput,
    msg: &str,
) {
    tracing::info!(
       rules_triggered=%rule::rules_to_string(&rule_output.rules_triggered),
       rules_not_triggered=%rule::rules_to_string(&rule_output.rules_not_triggered),
       create_manual_review=%rule_output.decision.create_manual_review,
       decision=%rule_output.decision.decision_status,
       onboarding_id=%ob_id,
       scoped_user_id=%sv_id,
       ob_configuration_id=%obc_id,
       vendor_api=%rule_output.decision.vendor_api,
       msg
       // TODO: differentiate KYB vs KYC here
    );
}
