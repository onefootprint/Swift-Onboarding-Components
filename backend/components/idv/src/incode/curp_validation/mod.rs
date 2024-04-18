use newtypes::{vendor_credentials::IncodeCredentialsWithToken, PiiString};

pub mod request;
pub mod response;

pub struct IncodeCurpValidationRequest {
    pub credentials: IncodeCredentialsWithToken,
    pub curp: PiiString,
}
