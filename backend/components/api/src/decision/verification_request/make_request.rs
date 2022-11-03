use crate::{errors::ApiError, State};
use db::models::verification_request::VerificationRequest;
use idv::VendorResponse;
use newtypes::{IdvData, Vendor};

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
    let result = match request.vendor {
        Vendor::Idology => idv::idology::request::send_expectid_request(&state.idology_client, data).await?,
        Vendor::Twilio => idv::twilio::lookup_v2(&state.twilio_client.client, data)
            .await
            .map_err(idv::Error::from)?,
        _ => return Err(ApiError::NotImplemented),
    };

    Ok(result)
}
