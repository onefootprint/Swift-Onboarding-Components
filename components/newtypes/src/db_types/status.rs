use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

/// Determines what integration the app has.
///
/// Custom indicates that there is no other integration.
#[derive(Debug, DbEnum, Clone, Copy, Deserialize, Serialize, Apiv2Schema, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
#[PgType = "User_Status"]
#[DieselType = "User_status"]
#[DbValueStyle = "verbatim"]
pub enum Status {
    Verified,
    Processing,
    Incomplete,
    Failed,
}

impl Default for Status {
    fn default() -> Self {
        Status::Incomplete
    }
}
