use std::collections::HashMap;

use super::{
    features::kyc_features::KycFeatureVector,
    onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
    vendor::{
        make_request::{VerificationRequestWithVendorError, VerificationRequestWithVendorResponse},
        tenant_vendor_control::TenantVendorControl,
        vendor_result::VendorResult,
        vendor_trait::VendorAPICall,
        verification_result,
    },
    *,
};
use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiResult},
    metrics,
};
use db::{
    models::{
        onboarding::Onboarding,
        scoped_vault::ScopedVault,
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbError, DbPool, TxnPgConn,
};
use either::Either;
use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::{
    experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};
use strum::IntoEnumIterator;

use itertools::Itertools;
use newtypes::{
    FootprintReasonCode, OnboardingId, ScopedVaultId, VendorAPI, VerificationRequestId, VerificationResultId,
};
use prometheus::labels;
///
/// Run loads saved VerificationRequests and (potentially) VerificationResults and produces a Decision
#[allow(clippy::too_many_arguments)]
pub async fn run(
    ob: Onboarding,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    ff_client: impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: &impl VendorAPICall<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: TenantVendorControl,
) -> ApiResult<()> {
    let vendor_requests =
        get_latest_verification_requests_and_results(&ob.id, &ob.scoped_vault_id, db_pool, enclave_client)
            .await?;

    let vendor_results = make_vendor_requests(
        db_pool,
        &ob.id,
        enclave_client,
        is_production,
        vendor_requests.outstanding_requests,
        &ff_client,
        idology_client,
        socure_client,
        twilio_client,
        experian_client,
        tenant_vendor_control,
    )
    .await?;

    let has_critical_error = !vendor_results.critical_errors.is_empty();
    let error_message = format!("{:?}", vendor_results.all_errors());
    // We want to always save the successful results even if some request has a hard error
    let completed_oustanding_vendor_responses = save_vendor_responses(
        db_pool,
        &vendor_results.successful,
        vendor_results.all_errors_with_parsable_requests(),
        &ob.id,
    )
    .await?;

    // If required vendor calls failed, we cannot proceed with decisioning but we don't want to send a hard error to Bifrost so we short circuit here
    if has_critical_error {
        tracing::error!(errors = error_message, "VendorRequestsFailed");
        return Ok(());
    }

    let all_vendor_results = vendor_requests
        .completed_requests
        .into_iter()
        .chain(completed_oustanding_vendor_responses.into_iter())
        .collect();

    let fv = features::kyc_features::create_features(all_vendor_results);
    make_onboarding_decision(&ob, fv, ff_client, db_pool).await
}

pub async fn make_onboarding_decision<T>(
    ob: &Onboarding,
    fv: T,
    ff_client: impl FeatureFlagClient,
    db_pool: &DbPool,
) -> ApiResult<()>
where
    T: FeatureVector + Send + Sync,
{
    // Calculate output from rules + features
    let rules_output = fv.evaluate(&ff_client)?;

    let obid = ob.id.clone();
    let reason_codes = reason_codes_for_tenant(db_pool, ff_client, obid, &fv).await?;
    let verification_result_ids = fv.verification_results();

    let ob = ob.clone();
    db_pool
        .db_transaction(move |conn| {
            // Save/action/emit risk signals for the decision
            save_onboarding_decision(
                conn,
                &ob,
                rules_output,
                reason_codes,
                verification_result_ids,
                true,
            )
        })
        .await
}

// TODO: probably make this a direct output of rules eval or something
pub async fn reason_codes_for_tenant<T>(
    db_pool: &DbPool,
    ff_client: impl FeatureFlagClient,
    obid: OnboardingId,
    fv: &T,
) -> ApiResult<Vec<(FootprintReasonCode, Vec<Vendor>)>>
where
    T: FeatureVector,
{
    let tenant_id = db_pool
        .db_query(move |conn| ScopedVault::get(conn, &obid))
        .await??
        .tenant_id;
    let tenant_can_view_socure_risk_signal = ff_client.flag(BoolFlag::CanViewSocureRiskSignals(&tenant_id));

    let mut visible_vendor_apis: Vec<VendorAPI> = VendorAPI::iter()
        .filter(|v| !matches!(v, &VendorAPI::SocureIDPlus))
        .collect();

    if tenant_can_view_socure_risk_signal {
        visible_vendor_apis.push(VendorAPI::SocureIDPlus)
    }
    Ok(fv.reason_codes(visible_vendor_apis))
}

pub async fn save_vendor_responses(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    vendor_error_responses: Vec<(VerificationRequest, Option<serde_json::Value>)>,
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

    pub fn all_errors_with_parsable_requests(&self) -> Vec<(VerificationRequest, Option<serde_json::Value>)> {
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
    ) -> (VerificationRequest, Option<serde_json::Value>) {
        match v {
            (req, ApiError::VendorRequestFailed(ve)) => match &ve.error {
                idv::Error::IDologyError(idv::idology::error::Error::ParsableAPIError(e)) => {
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
pub async fn make_vendor_requests(
    db_pool: &DbPool,
    onboarding_id: &OnboardingId,
    enclave_client: &EnclaveClient,
    is_production: bool,
    requests: Vec<VerificationRequest>,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: &impl VendorAPICall<
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
    ff_client: &impl FeatureFlagClient,
) -> ApiResult<(OnboardingRulesDecisionOutput, KycFeatureVector)> {
    // From our results, create a FeatureVector for the final decision output
    let fv = features::kyc_features::create_features(vendor_results);
    let decision = fv.evaluate(ff_client)?;

    Ok((decision, fv))
}

/// Create and save an onboarding decision
pub fn save_onboarding_decision(
    conn: &mut TxnPgConn,
    ob: &Onboarding,
    rules_output: OnboardingRulesDecisionOutput,
    reason_codes: Vec<(FootprintReasonCode, Vec<Vendor>)>,
    verification_result_ids: Vec<VerificationResultId>,
    assert_is_first_decision_for_onboarding: bool,
) -> ApiResult<()> {
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    let onboarding_decision = risk::save_final_decision(
        conn,
        ob.id.clone(),
        reason_codes,
        verification_result_ids,
        &rules_output,
        assert_is_first_decision_for_onboarding,
    )?;

    let status = onboarding_decision.status.to_string();
    if let Ok(metric) =
        metrics::DECISION_ENGINE_ONBOARDING_DECISION.get_metric_with(&labels! {"status" => status.as_str()})
    {
        metric.inc();
    }

    tracing::info!(
       rules_triggered=%rule::rules_to_string(&rules_output.rules_triggered),
       rules_not_triggered=%rule::rules_to_string(&rules_output.rules_not_triggered),
       create_manual_review=%rules_output.create_manual_review,
       decision=%rules_output.decision_status,
       onboarding_id=%ob.id,
       scoped_user_id=%ob.scoped_vault_id,
       ob_configuration_id=%ob.ob_configuration_id,
       "{}", rule::CANONICAL_ONBOARDING_RULE_LINE,
       // TODO: differentiate KYB vs KYC here
    );

    Ok(())
}
