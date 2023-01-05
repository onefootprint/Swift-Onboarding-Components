use super::*;
use crate::{errors::ApiError, State};

use db::{
    models::{
        insight_event::InsightEvent, ob_configuration::ObConfiguration,
        socure_device_session::SocureDeviceSession, verification_request::VerificationRequest,
    },
    DbError,
};
use idv::{idology::expectid::response::ExpectIDAPIResponse, ParsedResponse, VendorResponse};
use newtypes::{IdvData, ObConfigurationKey, PiiString, Vendor, VendorAPI};

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
        _ => return Err(ApiError::NotImplemented),
    };

    Ok(result)
}

pub async fn send_idology_idv_request(
    state: &State,
    request: VerificationRequest,
    data: IdvData,
) -> Result<VendorResponse, ApiError> {
    let feature_flag_client = &state.feature_flag_client;

    let onboarding_id = request.onboarding_id.clone();
    let ob_configuration_key = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get_by_onboarding_id(conn, &onboarding_id))
        .await??
        .key;

    if state.config.service_config.is_production()
        || feature_flag_client
            .bool_flag_by_ob_configuration_key(
                "EnableIdologyIdvCallsInNonProdEnvironment",
                &ob_configuration_key,
            )
            .unwrap_or(false)
    {
        idv::idology::send_expectid_request(&state.idology_client, data)
            .await
            .map_err(ApiError::from)
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDAPIResponse =
            idv::idology::expectid::response::parse_response(response.clone())
                .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            vendor: Vendor::Idology,
            raw_response: response,
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
        idv::socure::send_idplus_request(
            &state.socure_certification_client,
            data,
            socure_device_session_id,
            ip_address,
        )
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)))
    } else {
        let response = idv::test_fixtures::socure_idplus_fake_passing_response();

        let parsed_response =
            idv::socure::parse_response(response.clone()).map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            vendor: Vendor::Socure,
            response: ParsedResponse::SocureIDPlus(parsed_response),
            raw_response: response,
        })
    }
}

/// Make our requests to a vendor, building data from the cached VerificationRequest
async fn make_idv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();

    let data = build_request::build_idv_data_from_verification_request(state, request.clone()).await?;

    let vendor_response = make_request::send_idv_request(state, request, data).await?;

    let verification_result =
        verification_result::save_verification_result(state, request_id.clone(), vendor_response.clone())
            .await?;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: request_id,
    };

    Ok(result)
}

pub async fn make_vendor_requests(
    state: &State,
    requests: Vec<VerificationRequest>,
) -> Result<Vec<Result<vendor_result::VendorResult, ApiError>>, ApiError> {
    // Build our IDV Vendor requests
    let raw_futures = requests.into_iter().map(|r| make_idv_request(state, r));

    // Make requests
    let mut futures: Vec<_> = raw_futures.into_iter().map(Box::pin).collect();
    let mut results: Vec<Result<vendor_result::VendorResult, ApiError>> = vec![];

    while !futures.is_empty() {
        let (result, _, remaining) = futures::future::select_all(futures).await;
        results.push(result);
        futures = remaining;

        // TODO: log
    }

    Ok(results)
}
