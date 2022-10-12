use diesel::{sql_types::Text, AsExpression, FromSqlRow};
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
    AsExpression,
    FromSqlRow,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
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
crate::util::impl_enum_str_diesel!(RequirementKind);
