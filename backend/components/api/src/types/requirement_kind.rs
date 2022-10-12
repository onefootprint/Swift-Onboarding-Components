use newtypes::db_types::requirement::RequirementKind as DbRequirementKind;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

/// The type of requirement
#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum RequirementKind {
    Name,
    Dob,
    Ssn4,
    Ssn9,
    FullAddress,
    PartialAddress,
    Email,
    PhoneNumber,
    IdentityDocument,
    Liveness,
}

// 2022-10-12 this is temporary while @agrinman finishes consolidating shared types in their
// own crate
impl From<DbRequirementKind> for RequirementKind {
    fn from(db_req_kind: DbRequirementKind) -> Self {
        match db_req_kind {
            DbRequirementKind::Name => Self::Name,
            DbRequirementKind::Dob => Self::Dob,
            DbRequirementKind::Ssn4 => Self::Ssn4,
            DbRequirementKind::Ssn9 => Self::Ssn9,
            DbRequirementKind::FullAddress => Self::FullAddress,
            DbRequirementKind::PartialAddress => Self::PartialAddress,
            DbRequirementKind::Email => Self::Email,
            DbRequirementKind::PhoneNumber => Self::PhoneNumber,
            DbRequirementKind::IdentityDocument => Self::IdentityDocument,
            DbRequirementKind::Liveness => Self::Liveness,
        }
    }
}
