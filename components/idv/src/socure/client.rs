use chrono::{naive::NaiveDateTime, Utc};
use newtypes::{
    address::Address, dob::ValidatedDob, email::Email, name::Name, ssn::Ssn, LeakToString, PhoneNumber,
};
use reqwest::header;

use crate::ReqwestError;

use super::conversion::SocureAddress;

#[derive(Clone)]
pub struct SocureClient {
    client: reqwest::Client,
}

impl std::fmt::Debug for SocureClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("socure")
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(untagged)]
enum SocureResponse<T> {
    Success(T),
    Error(SocureError),
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SocureRequest {
    modules: Vec<String>,
    first_name: String,
    sur_name: String,
    dob: String, // YYYY-MM-DD
    national_id: String,
    email: String,
    mobile_number: String, // e164 format
    physical_address: String,
    physical_address_2: Option<String>,
    city: String,
    state: String,
    zip: String,
    country: String,
    user_consent: bool,
    consent_timestamp: NaiveDateTime,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureKycResponse {
    reference_id: String,
    kyc: SocureKycData,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureKycData {
    reason_codes: Vec<String>,
    field_validations: ValidationStruct,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidationStruct {
    first_name: f32,
    sur_name: f32,
    street_address: f32,
    city: f32,
    state: f32,
    zip: f32,
    mobile_number: f32,
    dob: f32,
    ssn: f32,
}

pub struct IdentifyRequest {
    first_name: Name,
    last_name: Name,
    address: Address,
    phone: PhoneNumber,
    dob: ValidatedDob,
    email: Email,
    ssn: Ssn,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SocureError {
    status: String,
    reference_id: String,
    data: Option<SocureErrorMetadata>,
    msg: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SocureErrorMetadata {
    parameters: Vec<String>,
}

impl SocureClient {
    pub fn new(sdk_key: String) -> Result<Self, crate::ReqwestError> {
        let mut headers = header::HeaderMap::new();
        let header_val = format!("SocureApiKey {}", sdk_key);
        headers.insert(
            "Authorization",
            header::HeaderValue::from_str(header_val.as_str())?,
        );
        headers.insert(
            "Content-Type",
            header::HeaderValue::from_static("application/json"),
        );

        let client = reqwest::Client::builder().default_headers(headers).build()?;
        Ok(Self { client })
    }

    /// Uses the kyc socure module which contains built-in support for the social security adm.'s
    /// identity verification module
    pub async fn verify_kyc(
        self,
        identify_request: IdentifyRequest,
    ) -> Result<SocureKycResponse, crate::SocureError> {
        let IdentifyRequest {
            first_name,
            last_name,
            address,
            ssn,
            email,
            phone,
            dob,
        } = identify_request;

        let SocureAddress {
            physical_address,
            physical_address_2,
            city,
            state,
            zip,
            country,
        } = SocureAddress::try_from(address)?;

        let req = SocureRequest {
            modules: vec!["kyc".to_string()],
            first_name: first_name.leak_to_string(),
            sur_name: last_name.leak_to_string(),
            dob: dob.leak_to_string(),
            national_id: ssn.leak_to_string(),
            email: email.leak_to_string(),
            mobile_number: phone.leak_to_string(),
            physical_address,
            physical_address_2,
            city,
            state,
            zip,
            country,
            user_consent: true,
            consent_timestamp: Utc::now().naive_utc(),
        };

        let response = self
            .client
            .post("https://sandbox.socure.com/api/3.0/EmailAuthScore")
            .json(&req)
            .send()
            .await
            .map_err(|err| crate::ReqwestError::ReqwestSendError(err.to_string()))?;

        let socure_response: SocureResponse<SocureKycResponse> = response
            .json::<SocureResponse<SocureKycResponse>>()
            .await
            .map_err(ReqwestError::InternalError)?;

        match socure_response {
            SocureResponse::Success(kyc_response) => Ok(kyc_response),
            SocureResponse::Error(err) => Err(crate::SocureError::SocureErrorResponse(err.msg)),
        }

        // Err(crate::SocureError::SocureErrorResponse("beep".to_string()))
    }
}

#[cfg(test)]
mod tests {

    use std::str::FromStr;

    use super::*;
    use dotenv;
    use newtypes::address::*;
    use newtypes::dob::*;

    #[actix_rt::test]
    #[ignore]
    async fn test_client() {
        let key = "SOCURE_API_KEY";
        let sdk_key = dotenv::var(key).unwrap();
        let socure_client = SocureClient::new(sdk_key).unwrap();

        let first_name: Name = Name::from_str("John").unwrap();
        let last_name: Name = Name::from_str("Smith").unwrap();
        let phone: PhoneNumber = PhoneNumber::from_str("+13471235555").unwrap();
        let street_address: StreetAddress = StreetAddress::try_from("123 wallaby way".to_string()).unwrap();
        let street_address_2: Option<StreetAddress> = None;
        let city: City = City::try_from("sydney".to_string()).unwrap();
        let state: State = State::try_from("NC".to_string()).unwrap();
        let country: Country = Country::try_from("US".to_string()).unwrap();
        let zip: Zip = Zip::try_from("12345".to_string()).unwrap();
        let address: Address = Address {
            street_address,
            street_address_2,
            city,
            state,
            zip,
            country,
        };
        let email: Email = Email::from_str("beep@boop.org").unwrap();
        let bad_dob: Dob = serde_json::from_str("{\"month\": 1, \"day\": 9, \"year\": 1998 }").unwrap();
        let dob: ValidatedDob = ValidatedDob::try_from(bad_dob).unwrap();
        let ssn: Ssn = Ssn::from_str("123456789").unwrap();

        let request = IdentifyRequest {
            first_name,
            last_name,
            address,
            phone,
            dob,
            email,
            ssn,
        };

        let resp = socure_client.verify_kyc(request).await.unwrap();

        println!("{:?}", resp)
    }
}
