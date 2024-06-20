use newtypes::PiiJsonValue;
use newtypes::ScrubbedPiiJsonValue;
use reqwest::StatusCode;
use serde::de::DeserializeOwned;
use serde::Serialize;

pub mod client;
pub mod error;
pub mod request;
pub mod response;

pub enum SambaAPIResult<T>
where
    T: Serialize,
{
    // We successfully can deserialize a 200 response
    Success(T),
    Error(error::Error),
}
impl<T> SambaAPIResult<T>
where
    T: Serialize,
{
    pub fn into_success(self) -> Result<T, error::Error> {
        match self {
            SambaAPIResult::Success(s) => Ok(s),
            SambaAPIResult::Error(e) => Err(e),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiJsonValue, error::Error> {
        let res = match self {
            SambaAPIResult::Success(s) => ScrubbedPiiJsonValue::scrub(s),
            // If we have an unhandled error, there's no T to serialize
            SambaAPIResult::Error(_) => ScrubbedPiiJsonValue::scrub(serde_json::json!({})),
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        !matches!(self, SambaAPIResult::Success(_))
    }
}

#[derive(derive_more::Deref)]
pub struct SambaAPIResponse<T>
where
    T: Serialize + DeserializeOwned,
{
    #[deref]
    pub result: SambaAPIResult<T>,
    pub raw_response: PiiJsonValue,
}

impl<T> SambaAPIResponse<T>
where
    T: Serialize + DeserializeOwned,
{
    pub async fn from_response(response: reqwest::Response) -> Self {
        let (cl, http_status) = (response.content_length(), response.status());

        if http_status.is_success() {
            let response_json: Result<(serde_json::Value, Result<T, error::Error>), error::Error> = response
                .json()
                .await
                .map_err(error::Error::from)
                .map(|val: serde_json::Value| {
                    let raw = val.clone();
                    let parsed = serde_json::from_value(val).map_err(error::Error::from);
                    (raw, parsed)
                });
            match response_json {
                Ok((raw, maybe_parsed)) => {
                    let result = match maybe_parsed {
                        Ok(j) => SambaAPIResult::Success(j),
                        Err(e) => {
                            log_response_error(http_status, cl, "deserialization");
                            SambaAPIResult::Error(e)
                        }
                    };

                    Self {
                        result,
                        raw_response: raw.into(),
                    }
                }
                Err(e) => {
                    log_response_error(http_status, cl, "200 non-json response");
                    let result = SambaAPIResult::Error(e);
                    Self {
                        result,
                        raw_response: serde_json::json!({}).into(),
                    }
                }
            }
        } else {
            log_response_error(http_status, cl, "non-200");
            let result = SambaAPIResult::Error(error::Error::HttpError(
                http_status.as_u16(),
                "non-200".to_string(),
            ));

            Self {
                result,
                raw_response: response
                    .json::<serde_json::Value>()
                    .await
                    .ok()
                    .map(|v| v.into())
                    .unwrap_or(serde_json::json!({}).into()),
            }
        }
    }
}

fn log_response_error(http_status: StatusCode, content_length: Option<u64>, issue: &str) {
    tracing::warn!(
        ?http_status,
        ?content_length,
        ?issue,
        "Error handling samba response"
    );
}
