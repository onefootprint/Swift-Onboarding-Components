use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, DbEnum, Eq, PartialEq, Clone, Copy, Deserialize, Serialize, Apiv2Schema)]
#[serde(rename_all = "lowercase")]
#[DieselExistingType = "ChallengeStatePg"]
#[DieselType = "Challenge_state"]
#[DbValueStyle = "verbatim"]
pub enum ChallengeState {
    AwaitingResponse,
    Expired,
    Validated,
}

#[derive(diesel::sql_types::SqlType)]
#[diesel(postgres_type(name = "challenge_state"))]
pub struct ChallengeStatePg;
