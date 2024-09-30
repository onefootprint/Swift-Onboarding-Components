pub mod experian;
pub mod idology;
pub mod incode;
pub mod lexis;
pub mod middesk;
pub mod neuro_id;
pub mod samba;
pub mod sentilink;
pub mod socure;
pub mod stytch;
pub mod twilio;

use async_trait::async_trait;
use idv::ParsedResponse;
use idv::VendorResponse;
#[cfg(test)]
use mockall::automock;
use newtypes::PiiJsonValue;
use newtypes::VendorAPI;

pub trait VendorAPIResponse: Sized {
    fn vendor_api(&self) -> VendorAPI;
    fn raw_response(&self) -> PiiJsonValue;
    fn parsed_response(&self) -> ParsedResponse;

    fn into_vendor_response(self) -> VendorResponse {
        VendorResponse {
            response: self.parsed_response(),
            raw_response: self.raw_response(),
        }
    }
}

// A trait representing a VendorAPICall
#[cfg_attr(test, automock)]
#[async_trait]
pub trait VendorAPICall<T, U, E>: Send + Sync
where
    T: Send + Sync + Sized,
    U: VendorAPIResponse + Send + Sync,
    E: Send + Sync + Into<idv::Error>,
{
    async fn make_request(&self, request_data: T) -> Result<U, E>;
}
