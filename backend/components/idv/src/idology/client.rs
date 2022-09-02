use newtypes::{dob::DateOfBirth, DataAttribute, IdvData, PiiString};

use crate::idology::{ConversionError, Error, ReqwestError};

#[derive(Debug, Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    url: String,
    username: PiiString,
    password: PiiString,
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
    output: String,
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
            let dob = DateOfBirth::try_from(dob).map_err(|_| ConversionError::CantParseDob)?;
            (
                Some(dob.month.into()),
                Some(dob.year.into()),
                Some(dob.day.into()),
            )
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
            // TODO remove country code
            telephone: phone_number,
            output: "json".to_owned(),
        };
        Ok(request)
    }
}

impl IdologyClient {
    // TODO is there a more typesafe way to keep this in sync with the mapper function above?
    pub fn verified_data_attributes() -> Vec<DataAttribute> {
        vec![
            DataAttribute::FirstName,
            DataAttribute::LastName,
            DataAttribute::AddressLine1,
            DataAttribute::City,
            DataAttribute::State,
            DataAttribute::Zip,
            DataAttribute::Ssn4,
            DataAttribute::Ssn9,
            DataAttribute::Dob,
            DataAttribute::Email,
            DataAttribute::PhoneNumber,
        ]
    }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct IdologyRequest {
    username: PiiString,
    password: PiiString,
    age_to_check: u32,
    #[serde(flatten)]
    data: IdologyRequestData,
}

impl IdologyClient {
    pub fn new(username: PiiString, password: PiiString) -> Result<Self, ReqwestError> {
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
    pub async fn verify_expectid(&self, idv_data: IdvData) -> Result<serde_json::Value, Error> {
        let req_list = IdologyRequest {
            username: self.username.clone(),
            password: self.password.clone(),
            age_to_check: 13, // TODO
            data: IdologyRequestData::try_from(idv_data)?,
        };
        let response = self
            .client
            .post(&self.url)
            .query(&req_list)
            .send()
            .await
            .map_err(|err| ReqwestError::SendError(err.to_string()))?;

        let idology_response = response
            .json::<serde_json::Value>()
            .await
            .map_err(ReqwestError::InternalError)?;
        // TODO parse as an IdologyResponse
        Ok(idology_response)
    }
}
