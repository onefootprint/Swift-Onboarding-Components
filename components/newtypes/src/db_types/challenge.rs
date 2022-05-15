use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "lowercase")]
#[PgType = "challenge_kind"]
#[DieselType = "Challenge_kind"]
#[DbValueStyle = "verbatim"]
pub enum ChallengeKind {
    PhoneNumber,
    Email,
}

#[derive(Debug, DbEnum, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "lowercase")]
#[PgType = "challenge_state"]
#[DieselType = "Challenge_state"]
#[DbValueStyle = "verbatim"]
pub enum ChallengeState {
    AwaitingResponse,
    Expired,
    Validated,
}
