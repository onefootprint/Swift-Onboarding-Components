pub mod client;
pub mod common;
pub mod error;
pub mod expectid;
pub(crate) mod fixtures;
pub mod pa;

use self::common::request::IdologyRequestData;
use self::common::request::Request;
use self::pa::IdologyPaRequest;
use crate::footprint_http_client::FootprintVendorHttpClient;
use crate::idology::error as IdologyError;
use expectid::response::ExpectIDResponse;
use newtypes::vendor_credentials::IdologyCredentials;
use newtypes::IdvData;
use newtypes::PiiJsonValue;

pub struct IdologyExpectIDRequest {
    pub idv_data: IdvData,
    pub credentials: IdologyCredentials,
    pub tenant_identifier: String,
}

#[derive(Clone)]
pub struct IdologyExpectIDAPIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: ExpectIDResponse,
}

/// Make a request to the ExpectID module. Returns the result from ExpectID and a vec of
/// scopes that were sent to IDology's ExpectID
#[tracing::instrument(skip_all)]
pub async fn verify_expectid(
    fp_http_client: &FootprintVendorHttpClient,
    request: IdologyExpectIDRequest,
) -> Result<serde_json::Value, IdologyError::Error> {
    let url = "https://web.idologylive.com/api/idiq.svc";
    let req_data = expectid::request::RequestData::try_from(request.idv_data, request.tenant_identifier)?;
    let req_list = Request::new(
        request.credentials.username.clone(),
        request.credentials.password.clone(),
        IdologyRequestData::ExpectId(req_data),
    );
    let response = fp_http_client
        .client
        .post(url)
        .query(&req_list)
        .send()
        .await
        .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

    let idology_response = response
        .json::<serde_json::Value>()
        .await
        .map_err(IdologyError::ReqwestError::from)?;
    Ok(idology_response)
}

pub async fn standalone_pa(
    fp_http_client: &FootprintVendorHttpClient,
    request: IdologyPaRequest,
) -> Result<serde_json::Value, IdologyError::Error> {
    let IdologyPaRequest {
        idv_data,
        credentials,
        tenant_identifier,
    } = request;

    let url = "https://web.idologylive.com/api/pa-standalone.svc";
    let req_data = pa::request::RequestData::try_from(idv_data, tenant_identifier)?;
    let req_list = Request::new(
        credentials.username,
        credentials.password,
        IdologyRequestData::Pa(req_data),
    );
    let response = fp_http_client
        .client
        .post(url)
        .query(&req_list)
        .send()
        .await
        .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

    let idology_response = response
        .json::<serde_json::Value>()
        .await
        .map_err(IdologyError::ReqwestError::from)?;
    Ok(idology_response)
}
