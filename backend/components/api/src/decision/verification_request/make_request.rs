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
    // Make the request to the IDV vendor
    let result = match request.vendor {
        Vendor::Idology => idv::idology::request::send_expectid_request(&state.idology_client, data).await?,
        Vendor::Twilio => idv::twilio::lookup_v2(&state.twilio_client.client, data)
            .await
            .map_err(idv::Error::from)?,
        _ => return Err(ApiError::NotImplemented),
    };

    // Process the response from the IDV vendor
    Ok(result)
}
