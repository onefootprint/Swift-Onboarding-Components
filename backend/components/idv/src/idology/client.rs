use super::{error as IdologyError, expectid};
use newtypes::{IdvData, PiiString};

#[derive(Debug, Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    username: PiiString,
    password: PiiString,
}

impl IdologyClient {
    pub fn new(username: PiiString, password: PiiString) -> Result<Self, IdologyError::ReqwestError> {
        let client = reqwest::Client::builder().build()?;
        Ok(Self {
            client,
            username,
            password,
        })
    }

    /// Make a request to the ExpectID module. Returns the result from ExpectID and a vec of
    /// scopes that were sent to IDology's ExpectID
    pub async fn verify_expectid(&self, idv_data: IdvData) -> Result<serde_json::Value, IdologyError::Error> {
        let url = "https://web.idologylive.com/api/idiq.svc";
        let req_data = expectid::request::RequestData::try_from(idv_data)?;
        let req_list = expectid::request::Request {
            username: self.username.clone(),
            password: self.password.clone(),
            age_to_check: 0, // Don't have IDology reject based on age
            data: req_data,
        };
        let response = self
            .client
            .post(url)
            .query(&req_list)
            .send()
            .await
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::InternalError)?;
        Ok(idology_response)
    }
}
