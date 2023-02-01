use super::*;
use crate::metrics;
use crate::{errors::ApiError, State};

use crate::feature_flag::FeatureFlagClient;
use db::{
    models::{
        insight_event::InsightEvent, ob_configuration::ObConfiguration,
        socure_device_session::SocureDeviceSession, verification_request::VerificationRequest,
    },
    DbError,
};
use idv::{idology::expectid::response::ExpectIDAPIResponse, ParsedResponse, VendorResponse};
use newtypes::{DocVData, IdvData, ObConfigurationKey, PiiString, Vendor, VendorAPI};
use prometheus::labels;

/// Branch on vendor and send requests to vendors
pub async fn send_idv_request(
    state: &State,
    request: VerificationRequest,
    data: IdvData,
) -> Result<VendorResponse, ApiError> {
    tracing::info!(
        msg = "Sending verification request",
        request_id = request.id.clone().to_string(),
        vendor_api = request.vendor_api.clone().to_string(),
        onboarding_id = request.onboarding_id.to_string(),
    );
    // Make the request to the IDV vendor

    let result = match request.vendor_api {
        VendorAPI::IdologyExpectID => send_idology_idv_request(state, request, data).await?,
        VendorAPI::TwilioLookupV2 => idv::twilio::lookup_v2(&state.twilio_client.client, data)
            .await
            .map_err(idv::Error::from)?,
        VendorAPI::SocureIDPlus => send_socure_idv_request(state, request, data).await?,
        api => {
            let err = format!("send_idv_request not implemented for {}", api);
            return Err(ApiError::AssertionError(err));
        }
    };

    Ok(result)
}

/// Send a request to vendors for document verification
pub async fn send_docv_request(
    state: &State,
    request: VerificationRequest,
    data: DocVData,
) -> Result<VendorResponse, ApiError> {
    tracing::info!(
        msg = "Sending verification request",
        request_id = request.id.clone().to_string(),
        vendor_api = request.vendor_api.clone().to_string(),
        onboarding_id = request.onboarding_id.to_string(),
    );
    // Make the request to the DocV vendor
    // TODO implement mocking for these once we use scan verify
    let result = match request.vendor_api {
        VendorAPI::IdologyScanVerifySubmission => {
            idv::idology::send_scan_verify_request(&state.idology_client, data).await?
        }
        VendorAPI::IdologyScanVerifyResults => {
            let Some(ref_id) = data.reference_id else {
                return Err(idv::Error::from(idv::idology::error::Error::MissingReferenceId).into())
            };
            idv::idology::poll_scan_verify_results_request(&state.idology_client, ref_id).await?
        }
        VendorAPI::IdologyScanOnboarding => send_scan_onboarding_docv_request(state, request, data).await?,
        api => {
            let err = format!("send_docv_request not implemented for {}", api);
            return Err(ApiError::AssertionError(err));
        }
    };

    Ok(result)
}

pub async fn send_idology_idv_request(
    state: &State,
    request: VerificationRequest,
    data: IdvData,
) -> Result<VendorResponse, ApiError> {
    let onboarding_id = request.onboarding_id.clone();
    let ob_configuration_key = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get_by_onboarding_id(conn, &onboarding_id))
        .await??
        .key;

    if state.config.service_config.is_production()
        || state
            .feature_flag_client
            .bool_flag_by_ob_configuration_key(
                "EnableIdologyIdvCallsInNonProdEnvironment",
                &ob_configuration_key,
            )
            .unwrap_or(false)
    {
        let res = idv::idology::send_expectid_request(&state.idology_client, data)
            .await
            .map_err(ApiError::from);

        match res {
            Ok(ref res) => {
                if let ParsedResponse::IDologyExpectID(expect_id_response) = &res.response {
                    let summary_result = expect_id_response
                        .response
                        .summary_result
                        .as_ref()
                        .map(|k| k.key.clone())
                        .unwrap_or_default();
                    let results = expect_id_response
                        .response
                        .results
                        .as_ref()
                        .map(|k| k.key.clone())
                        .unwrap_or_default();
                    metrics::IDOLOGY_EXPECT_ID_SUCCESS
                        .with(&labels! {"summary_result" => summary_result.as_str(), "results" => results.as_str()})
                        .inc();
                };
            }
            Err(ref e) => {
                let error = format!("{}", e);
                metrics::IDOLOGY_EXPECT_ID_ERROR
                    .with(&labels! {"error" => error.as_str()})
                    .inc()
            }
        }
        res
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDAPIResponse =
            idv::idology::expectid::response::parse_response(response.clone())
                .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            vendor: Vendor::Idology,
            raw_response: response.into(),
            response: ParsedResponse::IDologyExpectID(parsed_response),
        })
    }
}

pub async fn send_socure_idv_request(
    state: &State,
    request: VerificationRequest,
    data: IdvData,
) -> Result<VendorResponse, ApiError> {
    let feature_flag_client = &state.feature_flag_client;

    let onboarding_id = request.onboarding_id.clone();
    let (socure_device_session_id, ip_address, ob_configuration_key) = state
        .db_pool
        .db_query(
            move |conn| -> Result<(Option<String>, Option<PiiString>, ObConfigurationKey), DbError> {
                let socure_device_session_id =
                    SocureDeviceSession::latest_for_onboarding(conn, &onboarding_id)?
                        .map(|d| d.device_session_id);

                let ip_address = InsightEvent::get_by_onboarding_id(conn, &onboarding_id)?
                    .ip_address
                    .map(PiiString::from);

                let ob_configuration_key = ObConfiguration::get_by_onboarding_id(conn, &onboarding_id)?.key;

                Ok((socure_device_session_id, ip_address, ob_configuration_key))
            },
        )
        .await??;

    if feature_flag_client
        .bool_flag("DisableAllSocureIdvCalls")
        .unwrap_or(false)
    {
        Err(ApiError::from(idv::Error::VendorCallsDisabledError))
    } else if state.config.service_config.is_production()
        || feature_flag_client
            .bool_flag_by_ob_configuration_key(
                "EnableSocureIdvCallsInNonProdEnvironment",
                &ob_configuration_key,
            )
            .unwrap_or(false)
    {
        let res = idv::socure::send_idplus_request(
            &state.socure_production_client,
            data,
            socure_device_session_id,
            ip_address,
        )
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)));

        if let Ok(r) = &res {
            if let ParsedResponse::SocureIDPlus(socure_response) = &r.response {
                if let Some(score) = socure_response.sigma_fraud_score() {
                    metrics::SOCURE_SIGMA_FRAUD_SCORE.observe(score.into());
                }
            }
        }

        res
    } else {
        let response = idv::test_fixtures::socure_idplus_fake_passing_response();

        let parsed_response =
            idv::socure::parse_response(response.clone()).map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            vendor: Vendor::Socure,
            response: ParsedResponse::SocureIDPlus(parsed_response),
            raw_response: response.into(),
        })
    }
}

pub async fn send_scan_onboarding_docv_request(
    state: &State,
    request: VerificationRequest,
    data: DocVData,
) -> Result<VendorResponse, ApiError> {
    let feature_flag_client = &state.feature_flag_client;

    let onboarding_id = request.onboarding_id.clone();
    let ob_configuration_key = state
        .db_pool
        .db_query(move |conn| -> Result<ObConfigurationKey, DbError> {
            Ok(ObConfiguration::get_by_onboarding_id(conn, &onboarding_id)?.key)
        })
        .await??;

    if feature_flag_client
        .bool_flag("DisableAllScanOnboardingCalls")
        .unwrap_or(false)
    {
        Err(ApiError::from(idv::Error::VendorCallsDisabledError))
    } else if state.config.service_config.is_production()
        || feature_flag_client
            .bool_flag_by_ob_configuration_key(
                "EnableScanOnboardingCallsInNonProdEnvironment",
                &ob_configuration_key,
            )
            .unwrap_or(false)
    {
        idv::idology::send_scan_onboarding_request(&state.idology_client, data)
            .await
            .map_err(ApiError::from)
    } else {
        let response = idv::test_fixtures::scan_onboarding_fake_passing_response();

        let parsed_response = idv::idology::scan_onboarding::response::parse_response(response.clone())
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            vendor: Vendor::Idology,
            response: ParsedResponse::IDologyScanOnboarding(parsed_response),
            raw_response: response.into(),
        })
    }
}

/// Make our requests to a vendor, building data from the cached VerificationRequest
pub async fn make_idv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();
    let requestid = request.id.clone();

    let data = build_request::build_idv_data_from_verification_request(state, request.clone()).await?;

    let vendor_response = send_idv_request(state, request, data).await?;
    let uv = state
        .db_pool
        .db_query(move |conn| VerificationRequest::get_user_vault(conn, requestid))
        .await??;
    let (verification_result, structured_vendor_response) = verification_result::save_verification_result(
        state,
        request_id.clone(),
        vendor_response.clone(),
        uv.public_key,
    )
    .await?;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: request_id,
        structured_vendor_response,
    };

    Ok(result)
}

/// Make our requests to a vendor, building data from the cached VerificationRequest
///
/// A note on usage: Doc verification is different from other vendor requests in that we run the request synchronously in bifrost
/// in order to communicate potential issues with the uploaded image back to the customer. Because of this,
/// we have VerificationResults _before_ the decision engine would run
pub async fn make_docv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();
    let requestid = request.id.clone();

    let data =
        build_request::build_docv_data_for_submission_from_verification_request(state, request.clone())
            .await?;

    let vendor_response = send_docv_request(state, request, data).await?;
    let uv = state
        .db_pool
        .db_query(move |conn| VerificationRequest::get_user_vault(conn, requestid))
        .await??;

    let (verification_result, structured_vendor_response) = verification_result::save_verification_result(
        state,
        request_id.clone(),
        vendor_response.clone(),
        uv.public_key,
    )
    .await?;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: request_id,
        structured_vendor_response,
    };

    Ok(result)
}

#[tracing::instrument(skip(state))]
pub async fn make_vendor_requests(
    state: &State,
    requests: Vec<VerificationRequest>,
) -> Result<Vec<Result<vendor_result::VendorResult, ApiError>>, ApiError> {
    let raw_futures_with_vendors = requests
        .into_iter()
        .map(|r| (r.vendor_api, make_idv_request(state, r)));

    // Make requests
    let (vendor_apis, raw_futures): (Vec<_>, Vec<_>) = raw_futures_with_vendors.into_iter().unzip();
    let mut futures: Vec<_> = raw_futures.into_iter().map(Box::pin).collect();
    let mut results: Vec<Result<vendor_result::VendorResult, ApiError>> = vec![];

    while !futures.is_empty() {
        let (result, idx, remaining) = futures::future::select_all(futures).await;

        match result {
            Err(ref e) => {
                // return the api that failed
                let api = vendor_apis[idx];
                tracing::warn!(
                    vendor_api = %api,
                    err = format!("{:?}", e),
                    "VerificationRequest failed"
                );

                results.push(Err(ApiError::VendorRequestFailed(api)))
            }
            Ok(_) => {
                results.push(result);
            }
        }
        futures = remaining;
    }

    Ok(results)
}
