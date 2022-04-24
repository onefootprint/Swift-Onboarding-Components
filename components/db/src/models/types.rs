use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};

/// Determines what integration the app has.
///
/// Custom indicates that there is no other integration.
#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[PgType = "User_Status"]
#[DieselType = "User_status"]
#[DbValueStyle = "verbatim"]
pub enum Status {
    Verified,
    Processing,
    Incomplete,
    Failed
}

#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[PgType = "challenge_kind"]
#[DieselType = "Challenge_kind"]
#[DbValueStyle = "verbatim"]
pub enum ChallengeKind {
    PhoneNumber,
    Email,
}

#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[PgType = "challenge_state"]
#[DieselType = "Challenge_state"]
#[DbValueStyle = "verbatim"]
pub enum ChallengeState {
    AwaitingResponse,
    Expired,
    Validated,
}