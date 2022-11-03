use newtypes::IdvData;

use crate::{ParsedResponse, VendorResponse};

use super::{
    client::IdologyClient,
    verification::{self, IDologyResponse},
};
use newtypes::Vendor;

pub async fn send_expectid_request(
    client: &IdologyClient,
    data: IdvData,
) -> Result<VendorResponse, crate::Error> {
    let response = client.verify_expectid(data).await.map_err(crate::Error::from)?;
    //temp, debugging
    tracing::info!(msg = "Got verification response", response = response.to_string(),);
    let parsed_response: IDologyResponse =
        verification::parse_response(response.clone()).map_err(crate::Error::from)?;

    Ok(VendorResponse {
        vendor: Vendor::Idology,
        raw_response: response,
        response: ParsedResponse::IDology(parsed_response),
    })
}
