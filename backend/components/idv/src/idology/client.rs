use super::{error as IdologyError, expectid, scan_verify};
use newtypes::{DocVData, IdvData, PiiString};

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
    pub(super) async fn verify_expectid(
        &self,
        idv_data: IdvData,
    ) -> Result<serde_json::Value, IdologyError::Error> {
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

    /// Submit an image to the ScanVerify module. Returns the result from ExpectID and a vec of
    /// scopes that were sent to IDology's ExpectID
    pub(super) async fn submit_to_scan_verify(
        &self,
        docv_data: DocVData,
    ) -> Result<serde_json::Value, IdologyError::Error> {
        // TODO load these as env or something else
        let url = "https://web.idologylive.com/api/idscanperform.svc";
        let req_data = scan_verify::request::SubmissionRequestData::try_from(docv_data)?;
        let req = serde_urlencoded::to_string(scan_verify::request::SubmissionRequest {
            username: self.username.clone(),
            password: self.password.clone(),
            data: req_data,
        })
        .map_err(IdologyError::SerializationError::from)?;

        let response = self
            .client
            .post(url)
            .body(req)
            .headers(reqwest::header::HeaderMap::from_iter(
                vec![(
                    reqwest::header::CONTENT_TYPE,
                    "application/x-www-form-urlencoded".parse().unwrap(),
                )]
                .into_iter(),
            ))
            .send()
            .await
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::InternalError)?;
        Ok(idology_response)
    }

    pub(super) async fn get_scan_verify_results(
        &self,
        query_id: u64,
    ) -> Result<serde_json::Value, IdologyError::Error> {
        // TODO load these as env or something else
        let url = "https://web.idologylive.com/api/idscan.svc";
        let req_data = scan_verify::request::ResultsRequestData::from(query_id);
        let req = serde_urlencoded::to_string(scan_verify::request::ResultsRequest {
            username: self.username.clone(),
            password: self.password.clone(),
            data: req_data,
        })
        .map_err(IdologyError::SerializationError::from)?;

        let response = self
            .client
            .post(url)
            .body(req)
            .headers(reqwest::header::HeaderMap::from_iter(
                vec![(
                    reqwest::header::CONTENT_TYPE,
                    "application/x-www-form-urlencoded".parse().unwrap(),
                )]
                .into_iter(),
            ))
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
