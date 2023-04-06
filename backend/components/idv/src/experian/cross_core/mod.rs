use crate::footprint_http_client::FootprintVendorHttpClient;

use self::client::ExperianClientAdapter;

use super::ExperianCrossCoreRequest;

pub mod client;
pub(crate) mod request;
pub mod response;
pub(crate) mod validation;

pub async fn send_precise_id_request(
    client: &FootprintVendorHttpClient,
    request: ExperianCrossCoreRequest,
) -> Result<serde_json::Value, crate::experian::error::Error> {
    // There's a lot of special logic that experian needs to do with credentials, so we just hand off the responsibility to the experian code base
    let client_adapter = ExperianClientAdapter::new(
        request.credentials.auth_username,
        request.credentials.auth_password,
        request.credentials.auth_client_id,
        request.credentials.auth_client_secret,
        request.credentials.cross_core_username,
        request.credentials.cross_core_password,
        request.credentials.subscriber_code,
    )?;
    let validated_data = client_adapter.validate_data(request.idv_data)?;

    client_adapter
        .send_precise_id_request(client, validated_data)
        .await
}
