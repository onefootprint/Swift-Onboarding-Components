use super::{
    common::request::{IdologyRequestData, Request},
    error as IdologyError,
    expectid::{self},
    scan_onboarding, scan_verify,
};
use newtypes::{DocVData, IdvData, PiiString};

#[derive(Debug, Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    username: PiiString,
    password: PiiString,
}

impl IdologyClient {
    // TODO: deprecate
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
    #[tracing::instrument(skip_all)]
    pub async fn verify_expectid(
        &self,
        idv_data: IdvData,
        tenant_identifier: String,
    ) -> Result<serde_json::Value, IdologyError::Error> {
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
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::Error)?;
        Ok(idology_response)
    }

    /// Submit an image to the ScanVerify module. Returns the result from ExpectID and a vec of
    /// scopes that were sent to IDology's ExpectID
    #[tracing::instrument(skip_all)]
    pub(super) async fn submit_to_scan_verify(
        &self,
        docv_data: DocVData,
    ) -> Result<serde_json::Value, IdologyError::Error> {
        // TODO load these as env or something else
        let url = "https://web.idologylive.com/api/idscanperform.svc";
        let req_data = scan_verify::request::SubmissionRequestData::try_from(docv_data)?;
        let req = Request::new(
            self.username.clone(),
            self.password.clone(),
            IdologyRequestData::ScanVerify(req_data),
        );

        let response = self
            .client
            .post(url)
            .form(&req)
            .send()
            .await
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::Error)?;
        Ok(idology_response)
    }

    #[tracing::instrument(skip_all)]
    pub(super) async fn get_scan_verify_results(
        &self,
        query_id: u64,
    ) -> Result<serde_json::Value, IdologyError::Error> {
        // TODO load these as env or something else
        let url = "https://web.idologylive.com/api/idscan.svc";
        let req_data = scan_verify::request::ResultsRequestData::from(query_id);
        let req = Request::new(
            self.username.clone(),
            self.password.clone(),
            IdologyRequestData::ScanVerifyResults(req_data),
        );

        let response = self
            .client
            .post(url)
            .form(&req)
            .send()
            .await
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::from)?;

        // Here we parse the response in order to determine if we need to retry
        let parsed = scan_verify::response::parse_response(idology_response.clone())
            .map_err(IdologyError::Error::from)?;

        // Retry if results aren't ready. This error will cause us to retry
        if parsed.needs_retry() {
            let id_number = parsed
                .response
                .id_number
                .map(|i| format!("{:?}", i))
                // i don't think we need to error here if we are inside this conditional branch already
                .unwrap_or_else(|| "No id number found".into());
            tracing::info!(query_id=%id_number, "ScanVerify requires retry");
            return Err(IdologyError::Error::DocumentResultsNotReady);
        }

        Ok(idology_response)
    }

    /// Scan onboarding
    #[tracing::instrument(skip_all)]
    pub(super) async fn submit_to_scan_onboarding(
        &self,
        docv_data: DocVData,
    ) -> Result<serde_json::Value, IdologyError::Error> {
        // TODO load these as env or something else
        let url = "https://web.idologylive.com/api/scan-capture.svc";
        let req_data = scan_onboarding::request::SubmissionRequestData::try_from(docv_data)?;
        let req = Request::new(
            self.username.clone(),
            self.password.clone(),
            IdologyRequestData::ScanOnboarding(req_data),
        );

        let response = self
            .client
            .post(url)
            .form(&req)
            .send()
            .await
            .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(IdologyError::ReqwestError::from)?;
        Ok(idology_response)
    }
}
