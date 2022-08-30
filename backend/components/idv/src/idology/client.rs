use newtypes::PiiString;
use std::fmt::{Debug, Display};

use crate::IdologyReqwestError;

#[derive(Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    url: String,
    username: String,
    password: String,
}

impl std::fmt::Debug for IdologyClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("idology")
    }
}

/// Idology request, we'll only use this for U.S. citizens for now
/// as KYC requests differ for UK + other countries
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct IdologyRequestData {
    first_name: PiiString,
    last_name: PiiString,
    address: PiiString,
    city: Option<PiiString>,
    /// 2-digit state code
    state: Option<PiiString>,
    /// zip code must be 5 digits
    zip: Option<PiiString>,
    ssn_last4: Option<PiiString>,
    ssn: Option<PiiString>,
    dob_month: Option<PiiString>,
    dob_year: Option<PiiString>,
    dob_day: Option<PiiString>,
    email: Option<PiiString>,
    /// this must be 10 digits
    telephone: Option<PiiString>,
}

impl TryFrom<IdvData> for IdologyRequestData {
    type Error = crate::idology::Error;

    fn try_from(d: IdvData) -> Result<Self, Self::Error> {
        let IdvData {
            first_name,
            last_name,
            address_line1,
            address_line2: _, // TODO
            city,
            state,
            zip,
            ssn4,
            ssn9,
            dob,
            email,
            phone_number,
        } = d;
        let first_name = first_name.ok_or(ConversionError::MissingFirstName)?;
        let last_name = last_name.ok_or(ConversionError::MissingLastName)?;
        let address = address_line1.ok_or(ConversionError::MissingAddress)?; // TODO
        let (dob_month, dob_year, dob_day) = if let Some(dob) = dob {
            let dob = DateOfBirth::try_from(dob);
            (dob.month.into(), dob.year.into(), dob.day.into())
        } else {
            (None, None, None)
        };

        let request = Self {
            first_name,
            last_name,
            address,
            city,
            state,
            zip,
            ssn_last4: ssn4,
            ssn: ssn9,
            dob_month,
            dob_year,
            dob_day,
            email,
            telephone: phone_number,
        };
        Ok(request)
    }
}

#[derive(Debug, Clone, serde:Serialize)]
#[serde(rename_all = "camelCase")]
struct IdologyRequest {
    username: PiiString,
    password: PiiString,
    age_to_check: u32,
    #[serde(flatten)]
    data: IdologyRequestData,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct IdologyResponse {
    response: IdologyResponseInner,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(untagged)]
enum IdologyResponseInner {
    Error(IdologyApiError),
    Success(IdologySuccess),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct IdologyApiError {
    error: Option<String>,
    /// this will be "failed" if the service is unreachable/down
    failed: Option<String>,
}

impl Display for IdologyApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "error_message: {:?}, failed_message : {:?}",
            self.error, self.failed
        )
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct IdologySuccess {
    id_number: String,
    summary_result: IdologyKeyAndMessage,
    results: IdologyKeyAndMessage,
    qualifiers: Qualifier,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
struct Qualifier {
    qualifier: IdologyKeyAndMessage,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
struct IdologyKeyAndMessage {
    key: String,
    message: String,
}

impl IdologyClient {
    // TODO: figure out sandbox URL
    pub fn new(
        username: String,
        password: String,
        _sandbox: bool,
    ) -> Result<Self, crate::IdologyReqwestError> {
        let url = "https://web.idologylive.com/api/idiq.svc";
        let client = reqwest::Client::builder().build()?;
        Ok(Self {
            client,
            url: url.to_string(),
            username,
            password,
        })
    }

    /// ExpectId module
    pub async fn verify_expectid(
        &self,
        identify_request: IdentifyRequest,
    ) -> Result<IdologySuccess, crate::IdologyError> {
        let req_list = IdologyRequest::new(
            PiiString::from(&self.username),
            PiiString::from(&self.password),
            identify_request,
        )?;
        let response = self
            .client
            .get(&self.url)
            .query(&req_list)
            .send()
            .await
            .map_err(|err| crate::IdologyReqwestError::ReqwestSendError(err.to_string()))?;

        let idology_response: IdologyResponse = response
            .json::<IdologyResponse>()
            .await
            .map_err(IdologyReqwestError::InternalError)?;

        let idology_response = idology_response.response;
        match idology_response {
            IdologyResponseInner::Error(error) => Err(crate::IdologyError::IdologyErrorResponse(error)),
            IdologyResponseInner::Success(success) => Ok(success),
        }
    }
}
