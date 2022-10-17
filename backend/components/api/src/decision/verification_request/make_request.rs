use crate::{errors::ApiError, State};
use db::models::verification_request::VerificationRequest;
use idv::IdvResponse;
use newtypes::{IdvData, Vendor};

/// Branch on vendor and send requests to vendors
pub async fn send_idv_request(
    state: &State,
    request: VerificationRequest,
    data: IdvData,
) -> Result<(IdvResponse, Option<String>), ApiError> {
    // Make the request to the IDV vendor
    let result = match request.vendor {
        Vendor::Idology => {
            let (raw_response, signal_scopes) = state
                .idology_client
                .verify_expectid(data)
                .await
                .map_err(idv::Error::from)?;
            idv::idology::verification::process(raw_response, signal_scopes).map_err(idv::Error::from)?
        }
        Vendor::Twilio => {
            // TODO make it easier to share twilio client between IDV + SMS sending
            let idv_response = idv::twilio::lookup_v2(&state.twilio_client.client, data)
                .await
                .map_err(idv::Error::from)?;
            (idv_response, None)
        }
        _ => return Err(ApiError::NotImplemented),
    };

    // Process the response from the IDV vendor
    Ok(result)
}
