use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone, Copy, DbEnum)]
#[serde(rename_all = "lowercase")]
#[PgType = "User_Status"]
#[DieselType = "User_status"]
#[DbValueStyle = "verbatim"]
pub enum UserStatus {
    None,
    InProgress,
    Verified,
}
