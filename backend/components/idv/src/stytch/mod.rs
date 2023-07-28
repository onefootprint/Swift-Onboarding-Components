use newtypes::PiiJsonValue;

use self::response::LookupResponse;

pub mod client;
pub mod error;
pub mod response;

pub struct StytchLookupRequest {
    pub telemetry_id: String,
}

#[derive(Clone)]
pub struct StytchLookupResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: LookupResponse,
}
