use newtypes::IdentifyRequest;
use reqwest::header;
use std::fmt::Debug;

use crate::socure::conversion::SocureRequest;
use crate::SocureReqwestError;

#[derive(Clone)]
pub struct SocureClient {
    client: reqwest::Client,
    url: String,
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

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SocureError {
    status: Option<String>,
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
    pub fn new(sdk_key: String, sandbox: bool) -> Result<Self, crate::SocureReqwestError> {
        let url = if sandbox {
            "https://sandbox.socure.com/api/3.0/EmailAuthScore"
        } else {
            "https://socure.com/api/3.0/EmailAuthScore"
        };
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
        Ok(Self {
            client,
            url: url.to_string(),
        })
    }

    /// Uses the kyc socure module which contains built-in support for the social security adm.'s
    /// identity verification module
    pub async fn verify_kyc(
        self,
        identify_request: IdentifyRequest,
    ) -> Result<SocureKycResponse, crate::SocureError> {
        let req = SocureRequest::new(vec!["kyc".to_string()], identify_request)?;

        let response = self
            .client
            .post(self.url)
            .json(&req)
            .send()
            .await
            .map_err(|err| crate::SocureReqwestError::ReqwestSendError(err.to_string()))?;

        let socure_response: SocureResponse<SocureKycResponse> = response
            .json::<SocureResponse<SocureKycResponse>>()
            .await
            .map_err(SocureReqwestError::InternalError)?;

        match socure_response {
            SocureResponse::Success(kyc_response) => Ok(kyc_response),
            SocureResponse::Error(err) => Err(crate::SocureError::SocureErrorResponse(err.msg)),
        }
    }
}

#[cfg(test)]
mod tests {

    use std::str::FromStr;

    use super::*;
    use dotenv;
    use newtypes::address::*;
    use newtypes::dob::*;
    use newtypes::email::Email;
    use newtypes::name::Name;
    use newtypes::phone_number::*;
    use newtypes::ssn::Ssn9;

    #[actix_rt::test]
    #[ignore]
    async fn test_client() {
        let key = "SOCURE_API_KEY";
        let sdk_key = dotenv::var(key).unwrap();
        let socure_client = SocureClient::new(sdk_key, true).unwrap();

        let first_name: Name = Name::from_str("John").unwrap();
        let last_name: Name = Name::from_str("Smith").unwrap();
        let phone: ValidatedPhoneNumber =
            ValidatedPhoneNumber::__build("+13471235555".to_string(), "US".to_string(), "".to_string());
        let street_address: StreetAddress = StreetAddress::try_from("123 wallaby way".to_string()).unwrap();
        let street_address_2: Option<StreetAddress> = None;
        let city = City::try_from("sydney".to_string()).unwrap();
        let state = State::try_from("NC".to_string()).unwrap();
        let country = Country::try_from("US".to_string()).unwrap();
        let zip = Zip::try_from("12345".to_string()).unwrap();
        let address: Address = Address {
            address: Some(StreetAddressData {
                street_address,
                street_address_2,
            }),
            city: Some(city),
            state: Some(state),
            zip: Some(zip),
            country: Some(country),
        };
        let email: Email = Email::from_str("beep@boop.org").unwrap();
        let bad_dob: Dob = serde_json::from_str("{\"month\": 1, \"day\": 9, \"year\": 1998 }").unwrap();
        let dob: DateOfBirth = DateOfBirth::try_from(bad_dob).unwrap();
        let ssn: Ssn9 = Ssn9::from_str("123456789").unwrap();

        let request = IdentifyRequest {
            first_name,
            last_name,
            address,
            phone,
            dob,
            email,
            ssn,
        };

        let _resp = socure_client.verify_kyc(request).await.unwrap();
    }
}
