use crate::sentilink::error::error_code::SentilinkErrorCode;
use crate::sentilink::error::Error;
use crate::sentilink::SentilinkResponseStatus;
use crate::sentilink::SentilinkResult;
use chrono::DateTime;
use chrono::Utc;
use newtypes::sentilink::SentilinkProduct;
use newtypes::ScrubbedPiiJsonValue;
use serde::Deserialize;
use serde::Serialize;
use std::str::FromStr;


#[derive(Serialize, Deserialize, Clone)]
pub struct ApplicationRiskResponse {
    pub application_id: String,
    pub customer_id: String,
    pub environment: String,
    pub latency_ms: i64,
    pub sentilink_synthetic_score: Option<ScoreResult>,
    pub sentilink_id_theft_score: Option<ScoreResult>,
    // A Facets bundle containing all attributes offered by SentiLink.
    pub all_attributes: Option<ScrubbedPiiJsonValue>,

    // As of 2024-09 we aren't provisioned for these
    pub first_party_fraud_flags: Option<ScrubbedPiiJsonValue>,
    pub sentilink_first_party_check_fraud_score: Option<ScrubbedPiiJsonValue>,
    pub sentilink_first_party_ach_fraud_score: Option<ScrubbedPiiJsonValue>,
    #[serde(rename = "timestamp")]
    pub request_completed_at: DateTime<Utc>,
    pub transaction_id: String,
    // TODO enum
    // An string with the value SUCCESS if response is successful, PARTIAL if one or more requested products
    // could not be returned, or ERROR if no requested products could be returned.
    pub response_status: String,
}

impl ApplicationRiskResponse {
    pub fn response_status(&self) -> SentilinkResponseStatus {
        SentilinkResponseStatus::from_str(self.response_status.as_str())
            .unwrap_or(SentilinkResponseStatus::Failure)
    }

    pub fn validate(self) -> SentilinkResult<ValidatedApplicationRiskResponse> {
        let synthentic = self
            .sentilink_synthetic_score
            .ok_or(Error::MissingScore(SentilinkProduct::SyntheticScore))?
            .score()?;
        let id_theft = self
            .sentilink_id_theft_score
            .ok_or(Error::MissingScore(SentilinkProduct::IdTheftScore))?
            .score()?;

        let validated = ValidatedApplicationRiskResponse {
            synthetic_score: synthentic,
            id_theft_score: id_theft,
        };

        Ok(validated)
    }
}

// Note: Assumes we are always requesting synthetic and ID theft!
pub struct ValidatedApplicationRiskResponse {
    pub synthetic_score: Score,
    pub id_theft_score: Score,
}


#[derive(Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum ScoreResult {
    Score(Score),
    Error(ScoreError),
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Score {
    pub version: String,
    // A value between 0 (low risk) and 1000 (high risk).
    pub score: i32,
    // A list of the three most important features supporting the score.
    pub reason_codes: Vec<ReasonCode>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ScoreError {
    // A list of error messages. errors is an optional field that is only present when a requested score
    // cannot be calculated.
    errors: Vec<String>,
    // An error code. error_code is an optional field that is only present when a requested score cannot
    // be calculated.
    error_code: i32,
}

impl ScoreError {
    #[allow(unused)]
    pub fn error_code(&self) -> SentilinkErrorCode {
        self.error_code.into()
    }
}

impl ScoreResult {
    #[allow(unused)]
    pub fn score(&self) -> SentilinkResult<Score> {
        match self {
            ScoreResult::Score(score) => Ok(score.clone()),
            ScoreResult::Error(score_error) => Err(crate::sentilink::error::Error::ErrorCode(
                score_error.error_code(),
            )),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ReasonCode {
    // A code indicating the reason.
    pub code: String,
    // The rank of reason codes by importance. The top three reason codes are surfaced.
    pub rank: i32,
    // A string indicating the direction of the reason code. Potential values include: "less_fraudy" and
    // "more_fraudy."
    pub direction: String,
    // A written explanation of the reason code. String length will not exceed 255 characters.
    pub explanation: String,
}
