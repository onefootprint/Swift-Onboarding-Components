use super::common::request::IdologyRequestData;
use super::common::request::Request;
use super::error;
use super::expectid::{
    self,
};
use newtypes::IdvData;
use newtypes::PiiString;

#[derive(Debug, Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    username: PiiString,
    password: PiiString,
}

impl IdologyClient {
    // TODO: deprecate
    pub fn new(username: PiiString, password: PiiString) -> Result<Self, crate::Error> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(45))
            .build()
            .map_err(error::ReqwestError::from)
            .map_err(error::Error::from)?;
        Ok(Self {
            client,
            username,
            password,
        })
    }

    /// Make a request to the ExpectID module. Returns the result from ExpectID and a vec of
    /// scopes that were sent to IDology's ExpectID
    #[tracing::instrument(skip_all)]
    pub async fn verify_expectid(
        &self,
        idv_data: IdvData,
        tenant_identifier: String,
    ) -> Result<serde_json::Value, error::Error> {
        let url = "https://web.idologylive.com/api/idiq.svc";
        let req_data = expectid::request::RequestData::try_from(idv_data, tenant_identifier)?;
        let req_list = Request::new(
            self.username.clone(),
            self.password.clone(),
            IdologyRequestData::ExpectId(req_data),
        );
        let response = self
            .client
            .post(url)
            .query(&req_list)
            .send()
            .await
            .map_err(|err| error::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(error::ReqwestError::Error)?;
        Ok(idology_response)
    }
}
