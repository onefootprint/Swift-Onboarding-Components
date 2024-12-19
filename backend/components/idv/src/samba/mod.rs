use crate::RawResponseWrapper;
use newtypes::PiiJsonValue;
use newtypes::UsStateAndTerritories;
use reqwest::StatusCode;
use serde::de::DeserializeOwned;
use serde::Serialize;

pub mod client;
pub mod common;
pub mod error;
pub mod request;
pub mod response;

pub type SambaAPIResponse<T> = RawResponseWrapper<T, error::Error>;

impl<T> SambaAPIResponse<T>
where
    T: Serialize + DeserializeOwned,
{
    pub async fn from_response(response: reqwest::Response) -> Self {
        let (cl, http_status) = (response.content_length(), response.status());
        let raw_response = response.json::<serde_json::Value>().await;
        let raw_response_ok = raw_response.as_ref().ok().map(|v| PiiJsonValue::from(v.clone()));

        let parse = || {
            if !http_status.is_success() {
                return Err((
                    error::Error::HttpError(http_status.as_u16(), "non-200".to_string()),
                    "non-200",
                ));
            }
            let val = match raw_response {
                Ok(val) => val,
                Err(e) => return Err((e.into(), "200 non-json response")),
            };
            match serde_json::from_value(val) {
                Ok(parsed) => Ok(parsed),
                Err(e) => Err((e.into(), "deserialization")),
            }
        };
        let parsed = match parse() {
            Ok(r) => Ok(r),
            Err((e, message)) => {
                log_response_error(http_status, cl, message);
                Err(e)
            }
        };
        let raw_response = raw_response_ok.unwrap_or(serde_json::json!({}).into());
        Self { parsed, raw_response }
    }
}

// Samba only supports specific states for license_validation
// https://dev-devportal.sambasafety.io/solutions/license-verification.html#license-validation
pub fn license_state_is_supported_for_license_validation(state: UsStateAndTerritories) -> bool {
    matches!(
        state,
        UsStateAndTerritories::AR
            | UsStateAndTerritories::AZ
            | UsStateAndTerritories::CA
            | UsStateAndTerritories::CO
            | UsStateAndTerritories::CT
            | UsStateAndTerritories::DC
            | UsStateAndTerritories::DE
            | UsStateAndTerritories::FL
            | UsStateAndTerritories::GA
            | UsStateAndTerritories::HI
            | UsStateAndTerritories::IA
            | UsStateAndTerritories::ID
            | UsStateAndTerritories::IL
            | UsStateAndTerritories::IN
            | UsStateAndTerritories::KS
            | UsStateAndTerritories::KY
            | UsStateAndTerritories::MA
            | UsStateAndTerritories::MD
            | UsStateAndTerritories::ME
            | UsStateAndTerritories::MI
            | UsStateAndTerritories::MO
            | UsStateAndTerritories::MS
            | UsStateAndTerritories::MT
            | UsStateAndTerritories::NC
            | UsStateAndTerritories::ND
            | UsStateAndTerritories::NE
            | UsStateAndTerritories::NJ
            | UsStateAndTerritories::NM
            | UsStateAndTerritories::OH
            | UsStateAndTerritories::OR
            | UsStateAndTerritories::RI
            | UsStateAndTerritories::SD
            | UsStateAndTerritories::TN
            | UsStateAndTerritories::TX
            | UsStateAndTerritories::VA
            | UsStateAndTerritories::VT
            | UsStateAndTerritories::WA
            | UsStateAndTerritories::WI
            | UsStateAndTerritories::WY
    )
}

fn log_response_error(http_status: StatusCode, content_length: Option<u64>, issue: &str) {
    tracing::warn!(
        ?http_status,
        ?content_length,
        ?issue,
        "Error handling samba response"
    );
}
