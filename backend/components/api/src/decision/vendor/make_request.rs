use super::*;
use crate::{errors::ApiError, State};
use db::{
    models::{
        insight_event::InsightEvent, socure_device_session::SocureDeviceSession,
        verification_request::VerificationRequest,
    },
    DbError,
};
use idv::VendorResponse;
use newtypes::{IdvData, PiiString, Vendor};

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

    // TODO: query for SocureDeviceSession:latest_for_onboard and pass along to Socure request
    let result = match request.vendor {
        Vendor::Idology => idv::idology::send_expectid_request(&state.idology_client, data).await?,
        Vendor::Twilio => idv::twilio::lookup_v2(&state.twilio_client.client, data)
            .await
            .map_err(idv::Error::from)?,
        Vendor::Socure => {
            let (socure_device_session_id, ip_address) = state
                .db_pool
                .db_query(
                    move |conn| -> Result<(Option<String>, Option<PiiString>), DbError> {
                        let socure_device_session_id =
                            SocureDeviceSession::latest_for_onboarding(conn, &request.onboarding_id)?
                                .map(|d| d.device_session_id);

                        let ip_address = InsightEvent::get_by_onboarding_id(conn, &request.onboarding_id)?
                            .ip_address
                            .map(PiiString::from);

                        Ok((socure_device_session_id, ip_address))
                    },
                )
                .await??;

            idv::socure::send_idplus_request(
                &state.socure_sandbox_client,
                data,
                socure_device_session_id,
                ip_address,
            )
            .await
            .map_err(idv::Error::from)?
        }
        _ => return Err(ApiError::NotImplemented),
    };

    Ok(result)
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
