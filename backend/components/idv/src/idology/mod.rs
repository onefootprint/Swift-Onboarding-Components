pub mod client;
pub mod error;
pub mod expectid;

use newtypes::IdvData;

use crate::{ParsedResponse, VendorResponse};

use crate::idology::client::IdologyClient;
use expectid::response::IDologyResponse;
use newtypes::Vendor;

pub async fn send_expectid_request(
    client: &IdologyClient,
    data: IdvData,
) -> Result<VendorResponse, crate::Error> {
    let response = client
        .verify_expectid(data)
        .await
        .map_err(crate::idology::error::Error::from)?;
    let parsed_response: IDologyResponse =
        expectid::response::parse_response(response.clone()).map_err(crate::idology::error::Error::from)?;

    Ok(VendorResponse {
        vendor: Vendor::Idology,
        raw_response: response,
        response: ParsedResponse::IDology(parsed_response),
    })
}
