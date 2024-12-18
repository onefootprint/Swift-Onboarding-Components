use self::client::ExperianClientAdapter;
use super::ExperianCrossCoreRequest;
use crate::footprint_http_client::FootprintVendorHttpClient;
use newtypes::PiiJsonValue;

pub mod client;
pub mod error_code;
pub(crate) mod request;
pub mod response;
pub(crate) mod validation;

pub async fn send_precise_id_request(
    client: &FootprintVendorHttpClient,
    request: ExperianCrossCoreRequest,
) -> Result<PiiJsonValue, crate::experian::error::Error> {
    // There's a lot of special logic that experian needs to do with credentials, so we just hand off
    // the responsibility to the experian code base
    let client_adapter = ExperianClientAdapter::new(request.credentials)?;
    let validated_data = client_adapter.validate_data(request.idv_data)?;

    let response = client_adapter
        .send_precise_id_request_with_retries(client, validated_data)
        .await?;
    Ok(PiiJsonValue::new(response))
}
