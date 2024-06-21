use super::vendor::make_request::VerificationRequestWithVendorError;
use super::vendor::make_request::VerificationRequestWithVendorResponse;
use super::vendor::tenant_vendor_control::TenantVendorControl;
use super::vendor::vendor_result::VendorResult;
use super::vendor::verification_result;
use super::vendor::VendorAPIError;
use super::*;
use crate::errors::ApiResult;
use crate::State;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow::Workflow;
use db::DbError;
use db::DbPool;
use either::Either;
use itertools::Itertools;
use newtypes::PiiJsonValue;
use newtypes::VerificationRequestId;
use newtypes::WorkflowId;
use std::collections::HashMap;

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

pub struct VendorResults {
    pub successful: Vec<VerificationRequestWithVendorResponse>,
    pub non_critical_errors: Vec<VerificationRequestWithVendorError>,
    pub critical_errors: Vec<VerificationRequestWithVendorError>,
}

impl VendorResults {
    pub fn all_errors(&self) -> Vec<&VendorAPIError> {
        self.critical_errors
            .iter()
            .chain(self.non_critical_errors.iter())
            .map(|(_, e)| e)
            .collect()
    }

    pub fn all_errors_with_parsable_requests(&self) -> Vec<(VerificationRequest, Option<PiiJsonValue>)> {
        self.critical_errors
            .iter()
            .chain(self.non_critical_errors.iter())
            .map(|(req, err)| (req.clone(), Self::vendor_api_error_to_json(err)))
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
    // TODO: This just fails if any vendor requests return errors. We should handle these appropriately
    // somewhere!

    let (successful, errors): (
        Vec<VerificationRequestWithVendorResponse>,
        Vec<VerificationRequestWithVendorError>,
    ) = raw_results.into_iter().partition_map(|r| match r {
        Ok(vr) => Either::Left(vr),
        Err(e) => Either::Right(e),
    });

    let (critical_errors, non_critical_errors) = errors.into_iter().partition(|(_, e)| {
        if utils::should_throw_error_in_decision_engine_if_error_in_request(&e.vendor_api) {
            true
        } else {
            tracing::warn!(vendor_api=%&e.vendor_api, "Vendor request failed, but not bailing out of decision engine run");
            false
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
