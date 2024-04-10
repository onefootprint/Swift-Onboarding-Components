use newtypes::{PiiJsonValue, ScrubbedPiiJsonValue};
use serde::{Deserialize, Serialize};
use serde_with::DeserializeFromStr;
use strum::{Display, EnumString};

use super::error;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroIdAnalyticsResponse {
    pub message: Option<String>,
    pub more_info: Option<String>,
    status: Option<String>,
    pub profile: Option<NeuroProfile>,
}

impl NeuroIdAnalyticsResponse {
    pub fn status(&self) -> Status {
        self.status
            .as_ref()
            .map(|s| match Status::try_from(s.as_str()) {
                Ok(r) => r,
                Err(err) => {
                    tracing::error!(?err, status=%s, "Error parsing Neuro status");
                    Status::Unknown
                }
            })
            .unwrap_or(Status::Unknown)
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroProfile {
    pub client_id: Option<String>,
    pub funnel: Option<String>,
    pub id: Option<String>,
    pub signals: Option<Vec<NeuroSignal>>,
    pub site_id: Option<String>,
}

impl NeuroProfile {
    pub fn get_signal_for_model(&self, model: Model) -> Option<NeuroSignal> {
        self.signals
            .as_ref()
            .and_then(|ss| ss.iter().find(|s| s.model() == model))
            .cloned()
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroSignal {
    /// The classification label for the signal. E.g., for the Intent signal, the possible labels are genuine, neutral, risky, and insufficient data
    pub label: Option<String>,
    /// The name of the signal.
    model: Option<String>,
    pub score: Option<f32>,
    pub version: Option<String>,
    // The lower-level data elements used to arrive at the classification for a signal.
    // Only available for customers who have purchased ID Attributes.
    // A block of associated attributes are added to each element in the signals array under the heading attributes.
    // The keys of this map are strings, while the values could be different data types.
    pub attributes: Option<serde_json::Value>,
}

impl NeuroSignal {
    fn model(&self) -> Model {
        self.model
            .as_ref()
            .map(|s| match Model::try_from(s.as_str()) {
                Ok(r) => r,
                Err(err) => {
                    tracing::error!(?err, status=%s, "Error parsing NeuroSignal model ");
                    Model::Other("unknown".into())
                }
            })
            .unwrap_or(Model::Other("missing".into()))
    }
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroIdAnalyticsResponseError {
    status: Option<String>,
    pub message: Option<String>,
    pub more_info: Option<String>,
}
impl NeuroIdAnalyticsResponseError {
    pub fn status(&self) -> Status {
        self.status
            .as_ref()
            .map(|s| match Status::try_from(s.as_str()) {
                Ok(r) => r,
                Err(err) => {
                    tracing::error!(?err, status=%s, "Error parsing NeuroAnalyticsResponseError status ");
                    Status::Unknown
                }
            })
            .unwrap_or(Status::Unknown)
    }
}
impl std::fmt::Display for NeuroIdAnalyticsResponseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "NeuroIdAnalyticsResponseError {:?}: {} more_info: {}>",
            self.status,
            self.message.as_ref().unwrap_or(&"".to_string()),
            self.more_info.as_ref().unwrap_or(&"".to_string())
        )
    }
}

// private fn since this assumes you are doing http status checking first
fn from_analytics_response_to_error(value: NeuroIdAnalyticsResponse) -> NeuroIdAnalyticsResponseError {
    let NeuroIdAnalyticsResponse {
        message,
        more_info,
        status,
        profile: _,
    } = value;
    NeuroIdAnalyticsResponseError {
        status,
        message,
        more_info,
    }
}

#[derive(Clone, Debug, Display, EnumString, DeserializeFromStr, Eq, PartialEq, Serialize)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum Status {
    Success,
    // Data has been received for this profile though the signals have insufficient data to calculate a result
    NotEnoughInteractionData,
    // Data has been received for this profile though the site still needs to be configured to calculate an accurate result.
    SiteNotConfigured,
    // Api key not correct
    UnauthorizedAccess,
    // No profiles found for the given ID and Site ID
    ProfileNotFound,
    Unknown,
}

#[derive(Clone, Debug, Display, EnumString, DeserializeFromStr, Eq, PartialEq, Serialize)]
#[strum(serialize_all = "snake_case")]
pub enum Model {
    Familiarity,
    FraudRingIndicator,
    AutomatedActivity,
    CombinedDigitalIntent,
    RiskDevice,
    Other(String),
}

// T isn't needed here since it isn't an incode-style multi-endpoint request
// so we can prob just drop it
pub enum NeuroAPIResult {
    // We successfully can deserialize a 200 response
    Success(NeuroIdAnalyticsResponse),
    // We got a neuro error, but we have informative error information we handle in code
    ResponseErrorWithResponse(NeuroIdAnalyticsResponseError),
    // We got a non-200 that didn't have handleable error information
    ResponseErrorUnhandled(error::Error),
}
impl NeuroAPIResult {
    pub fn into_success(self) -> Result<NeuroIdAnalyticsResponse, error::Error> {
        match self {
            NeuroAPIResult::Success(s) => Ok(s),
            NeuroAPIResult::ResponseErrorWithResponse(e) => Err(error::Error::APIResponseError(e)),
            NeuroAPIResult::ResponseErrorUnhandled(e) => Err(e),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiJsonValue, error::Error> {
        let res = match self {
            NeuroAPIResult::Success(s) => ScrubbedPiiJsonValue::scrub(s),
            NeuroAPIResult::ResponseErrorWithResponse(e) => ScrubbedPiiJsonValue::scrub(e),
            // If we have an unhandled error, there's no T to serialize
            NeuroAPIResult::ResponseErrorUnhandled(_) => ScrubbedPiiJsonValue::scrub(serde_json::json!({})),
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        !matches!(self, NeuroAPIResult::Success(_))
    }
}


#[derive(derive_more::Deref)]
pub struct NeuroApiResponse {
    #[deref]
    pub result: NeuroAPIResult,
    pub raw_response: PiiJsonValue,
}


impl NeuroApiResponse {
    pub async fn from_response(response: reqwest::Response) -> Self {
        let (cl, http_status) = (response.content_length(), response.status());
        let response_json: Result<serde_json::Value, reqwest::Error> = response.json().await;
        match response_json {
            Ok(j) => {
                if http_status.is_success() {
                    let deserialized: Result<NeuroIdAnalyticsResponse, serde_json::Error> =
                        serde_json::from_value(j.clone());
                    match deserialized {
                        Ok(d) => match d.status() {
                            // if we are http 200, we shouldn't see anything other than success, but enums /shrug
                            Status::Success => Self {
                                result: NeuroAPIResult::Success(d),
                                raw_response: j.into(),
                            },
                            _ => Self {
                                result: NeuroAPIResult::ResponseErrorWithResponse(
                                    from_analytics_response_to_error(d),
                                ),
                                raw_response: j.into(),
                            },
                        },
                        Err(_e) => todo!(),
                    }
                } else {
                    let deserialized_error: Result<NeuroIdAnalyticsResponseError, serde_json::Error> =
                        serde_json::from_value(j.clone());

                    match deserialized_error {
                        Ok(de) => {
                            if matches!(de.status(), Status::Success) {
                                tracing::error!("unexpected success status for neuro error");
                            }

                            Self {
                                result: NeuroAPIResult::ResponseErrorWithResponse(de),
                                raw_response: j.into(),
                            }
                        }
                        Err(_) => Self {
                            result: NeuroAPIResult::ResponseErrorUnhandled(error::Error::UnknownStatus),
                            raw_response: j.into(),
                        },
                    }
                }
            }
            // if we can't deserialize as json, we probably have a 5xx
            Err(err) => {
                tracing::error!(http_status=%http_status, content_length=?cl, ?err, "error parsing Neuro response as json");
                Self {
                    result: NeuroAPIResult::ResponseErrorUnhandled(err.into()),
                    raw_response: serde_json::json!({}).into(),
                }
            }
        }
    }
}


// TODO: add these tests
// #[cfg(test)]
// mod tests {
//     use http::response::Builder;
//     use test_case::test_case;
//     use url::Url;

//     use super::*;

//     #[test_case(200)]
//     #[tokio::test]
//     fn test_neuro_api_response(http_status: i32, response: &str, expected: NeuroAPIResult) {
//         let url = Url::parse("http://example.com").unwrap();
//         let response = reqwest::RequestBuilder::new()
//             .status(200)
//             .url(url.clone())
//             .body("foo")
//             .unwrap();
//         let response = reqwest::Response::from(response);
//     }
// }
