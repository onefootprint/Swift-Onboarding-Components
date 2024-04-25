use std::collections::HashMap;

use super::{
    onboarding::Decision,
    vendor::{
        make_request::{VerificationRequestWithVendorError, VerificationRequestWithVendorResponse},
        tenant_vendor_control::TenantVendorControl,
        vendor_result::VendorResult,
        verification_result, VendorAPIError,
    },
    *,
};
use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiErrorKind, ApiResult},
    State,
};
use db::{
    models::{
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
        workflow::Workflow,
    },
    DbError, DbPool, TxnPgConn,
};
use either::Either;

use itertools::Itertools;
use newtypes::{
    PiiJsonValue, ReviewReason, RuleSetResultId, ScopedVaultId, VerificationRequestId, VerificationResultId,
    WorkflowId,
};

pub async fn save_vendor_responses(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    vendor_error_responses: Vec<(VerificationRequest, Option<PiiJsonValue>)>,
    wf_id: &WorkflowId,
) -> ApiResult<Vec<VendorResult>> {
    let wf_id = wf_id.clone();

    let responses = vendor_responses.to_owned();
    let results = db_pool
        .db_transaction(move |conn| -> ApiResult<Vec<VendorResult>> {
            let (_, uv) = Workflow::get_with_vault(conn, &wf_id)?;
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
    scoped_user_id: &ScopedVaultId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> ApiResult<VendorRequests> {
    let suid = scoped_user_id.clone();
    let requests_and_results = db_pool
        .db_query(move |conn| -> Result<Vec<RequestAndMaybeResult>, DbError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            VerificationRequest::get_latest_requests_and_maybe_successful_results_for_scoped_user(conn, suid)
        })
        .await?;

    let su_id = scoped_user_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &su_id)).await?;

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

    pub fn has_sufficient_results_for_kyc(&self) -> bool {
        self.successful.iter().any(|(vreq, _)| {
            matches!(
                vreq.vendor_api,
                VendorAPI::IdologyExpectId | VendorAPI::ExperianPreciseId
            )
        })
    }
}

impl VendorResults {
    // TODO: this and the struct in general doesnt need to operate on ApiError, we could keep VendorAPIError
    pub fn construct_requests_with_responses_for_verification_result(
        v: &VerificationRequestWithVendorError,
    ) -> (VerificationRequest, Option<PiiJsonValue>) {
        match (&v.0, v.1.kind()) {
            (req, ApiErrorKind::VendorRequestFailed(ve)) => (req.clone(), Self::vendor_api_error_to_json(ve)),
            (req, _) => (req.clone(), None),
        }
    }

    pub fn vendor_api_error_to_json(vendor_api_error: &VendorAPIError) -> Option<PiiJsonValue> {
        match &vendor_api_error.error {
            idv::Error::IDologyError(idv::idology::error::Error::ErrorWithResponse(e)) => {
                Some(e.response.clone())
            }
            idv::Error::ExperianError(idv::experian::error::Error::ErrorWithResponse(e)) => {
                Some(e.response.clone())
            }
            idv::Error::StytchError(idv::stytch::error::Error::ErrorWithResponse(e)) => {
                Some(e.response.clone())
            }
            _ => None,
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
        match e.kind() {
            ApiErrorKind::VendorRequestFailed(vendor_api_error) => {
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
    state: &State,
    tvc: TenantVendorControl,
    requests: Vec<VerificationRequest>,
    wf_id: &WorkflowId,
) -> ApiResult<VendorResults> {
    // Make requests
    let results = vendor::make_request::make_vendor_requests(state, tvc, requests, wf_id).await?;

    Ok(partition_vendor_errors(results))
}

// TODO can we remove this proxy method?
/// Create and save an onboarding decision
#[allow(clippy::too_many_arguments)]
pub fn save_onboarding_decision(
    conn: &mut TxnPgConn,
    workflow: &Workflow,
    final_decision: Decision,
    rule_set_result_id: Option<RuleSetResultId>,
    verification_result_ids: Vec<VerificationResultId>,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    risk::save_final_decision(
        conn,
        workflow.id.clone(),
        verification_result_ids,
        &final_decision,
        rule_set_result_id,
        review_reasons,
    )?;

    Ok(())
}
