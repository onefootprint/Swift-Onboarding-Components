use super::vendor_trait::{VendorAPICall, VendorAPIResponse};
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
use idv::idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::{idology::expectid::response::ExpectIDResponse, ParsedResponse, VendorResponse};
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

    let onboarding_id = request.onboarding_id.clone();
    let ob_configuration_key = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get_by_onboarding_id(conn, &onboarding_id))
        .await??
        .key;

    let is_production = state.config.service_config.is_production();

    // still TODO: traitfy the ff logic shared by these requests
    let result = match request.vendor_api {
        VendorAPI::IdologyExpectID => {
            send_idology_idv_request(
                data,
                is_production,
                ob_configuration_key,
                &state.idology_client,
                &state.feature_flag_client,
            )
            .await?
        }
        VendorAPI::TwilioLookupV2 => idv::twilio::lookup_v2(&state.twilio_client.client, data)
            .await
            .map_err(idv::Error::from)?,
        VendorAPI::SocureIDPlus => {
            send_socure_idv_request(state, request, data, &state.socure_production_client).await?
        }
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
    data: IdvData,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    idology_api_call: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    feature_flag_client: &impl FeatureFlagClient,
) -> Result<VendorResponse, ApiError> {
    if is_production
        || feature_flag_client
            .bool_flag_by_ob_configuration_key(
                "EnableIdologyIdvCallsInNonProdEnvironment",
                &ob_configuration_key,
            )
            .unwrap_or(false)
    {
        let res = idology_api_call
            .make_request(IdologyExpectIDRequest { idv_data: data })
            .await;

        match res {
            Ok(ref vr) => {
                let summary_result = vr
                    .parsed_response
                    .response
                    .summary_result
                    .as_ref()
                    .map(|k| k.key.clone())
                    .unwrap_or_default();
                let results = vr
                    .parsed_response
                    .response
                    .results
                    .as_ref()
                    .map(|k| k.key.clone())
                    .unwrap_or_default();
                if let Ok(metric) = metrics::IDOLOGY_EXPECT_ID_SUCCESS.get_metric_with(
                    &labels! {"summary_result" => summary_result.as_str(), "results" => results.as_str()},
                ) {
                    metric.inc();
                }
            }
            Err(ref e) => {
                let error = format!("{}", e);
                if let Ok(metric) =
                    metrics::IDOLOGY_EXPECT_ID_ERROR.get_metric_with(&labels! {"error" => error.as_str()})
                {
                    metric.inc();
                }
            }
        }

        res.map(|r| {
            let vendor = Vendor::from(r.clone().vendor_api()); // TOOD: clones :>
            let parsed_response = r.clone().parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                // TODO: later delete VendorResponse and just replace with VendorAPIResponse
                vendor,
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| ApiError::from(idv::Error::from(e)))
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDResponse =
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
    socure_api_call: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
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
        let res = socure_api_call
            .make_request(SocureIDPlusRequest {
                idv_data: data,
                socure_device_session_id,
                ip_address,
            })
            .await;

        if let Ok(r) = &res {
            if let Some(score) = r.parsed_response.sigma_fraud_score() {
                metrics::SOCURE_SIGMA_FRAUD_SCORE.observe(score.into());
            }
        }

        res.map(|r| {
            // TODO: later delete VendorResponse and just replace with VendorAPIResponse
            let vendor = Vendor::from(r.clone().vendor_api()); // TOOD: clones :>
            let parsed_response = r.clone().parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                vendor,
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| ApiError::from(idv::Error::from(e)))
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

#[cfg(test)]
#[allow(clippy::unwrap_used)]
#[allow(clippy::expect_used)]
mod tests {
    use super::*;
    use crate::decision::vendor::vendor_trait::MockVendorAPICall;
    use crate::feature_flag::{FeatureFlagError, MockFeatureFlagClient};

    use idv::idology::{
        expectid::{response::ExpectIDResponse, response::Response},
        IdologyExpectIDAPIResponse,
    };
    use mockall::predicate::*;

    use newtypes::PiiJsonValue;
    use serde_json::json;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(true, Ok(false), true)]
    #[test_case(false, Ok(true), true)]
    #[test_case(false, Ok(false), false)]
    #[test_case(true, Err(FeatureFlagError::LaunchDarklyClientFailedToInitialize), true)]
    #[test_case(false, Err(FeatureFlagError::LaunchDarklyClientFailedToInitialize), false)]
    #[tokio::test]
    async fn test_send_idology_idv_request(
        // Proof of concept test
        is_production: bool,
        flag_response: Result<bool, FeatureFlagError>,
        expect_api_call: bool,
    ) {
        let ob_configuration_key = ObConfigurationKey::from_str("obc123").unwrap();
        let mut mock_ff_client = MockFeatureFlagClient::new();
        let mut mock_api = MockVendorAPICall::<
            IdologyExpectIDRequest,
            IdologyExpectIDAPIResponse,
            idv::idology::error::Error,
        >::new();

        mock_ff_client
            .expect_bool_flag_by_ob_configuration_key()
            .with(
                eq("EnableIdologyIdvCallsInNonProdEnvironment"),
                eq(ob_configuration_key.clone()),
            )
            .return_once(|_, _| flag_response);

        if expect_api_call {
            mock_api.expect_make_request().times(1).return_once(|_| {
                Ok(IdologyExpectIDAPIResponse {
                    // TODO: helpers methods to make these and other test structs
                    raw_response: PiiJsonValue::from(json!({"yo": "sup"})),
                    parsed_response: ExpectIDResponse {
                        response: Response {
                            qualifiers: None,
                            results: None,
                            summary_result: None,
                            id_number: None,
                            id_scan: None,
                            error: None,
                            restriction: None,
                        },
                    },
                })
            });
        }

        send_idology_idv_request(
            IdvData { ..Default::default() },
            is_production,
            ob_configuration_key,
            &mock_api,
            &mock_ff_client,
        )
        .await
        .expect("shouldn't error");
    }
}
