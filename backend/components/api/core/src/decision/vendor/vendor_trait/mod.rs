pub mod experian;
pub mod idology;
pub mod incode;
pub mod middesk;
pub mod socure;
pub mod stytch;
pub mod twilio;

use async_trait::async_trait;
use idv::ParsedResponse;

#[cfg(test)]
use mockall::automock;
use newtypes::{PiiJsonValue, VendorAPI};

pub trait VendorAPIResponse {
    fn vendor_api(self) -> VendorAPI;
    fn raw_response(self) -> PiiJsonValue;
    fn parsed_response(self) -> ParsedResponse;
    // TODO: to_structured_pg_table or whatnot
}

// A trait representing a VendorAPICall
#[cfg_attr(test, automock)]
#[async_trait]
pub trait VendorAPICall<T, U, E>: Send + Sync
where
    T: Send + Sync + Sized,
    U: VendorAPIResponse + Send + Sync,
    E: Send + Sync,
{
    async fn make_request(&self, request_data: T) -> Result<U, E>;
}
