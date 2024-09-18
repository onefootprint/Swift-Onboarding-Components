use chrono::DateTime;
use chrono::Utc;
use newtypes::ScrubbedPiiJsonValue;
use serde::Deserialize;
use serde::Serialize;


#[derive(Serialize, Deserialize)]
pub struct ApplicationRiskResponse {
    pub application_id: String,
    pub customer_id: String,
    pub environment: String,
    pub latency_ms: i64,
    pub sentilink_synthetic_score: Option<Score>,
    pub sentilink_id_theft_score: Option<Score>,
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
// TODO: sentilink docs give conflicting guidance on how errors manifest. Is it embedded in this or in a diff Error object? https://docs.sentilink.com/v2/errors/#score
#[derive(Serialize, Deserialize)]
pub struct Score {
    pub version: String,
    // A value between 0 (low risk) and 1000 (high risk).
    pub score: i32,
    // A list of the three most important features supporting the score.
    pub reason_codes: Vec<ReasonCode>,
    // A list of error messages. errors is an optional field that is only present when a requested score
    // cannot be calculated.
    pub errors: Option<Vec<String>>,
    // An error code. error_code is an optional field that is only present when a requested score cannot be
    // calculated.
    pub error_code: Option<i32>,
}
#[derive(Serialize, Deserialize)]
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
