use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Ord,
    PartialOrd,
    Eq,
    Hash,
    PartialEq,
    Deserialize,
    Serialize,
    Apiv2Schema,
    EnumIter,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// A subset of `IdentityDataKind`s that represents only kinds of data stored on the
/// `UserVaultData` table
pub enum UvdKind {
    FirstName,
    LastName,
    Dob,
    Ssn4,
    Ssn9,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
}

crate::util::impl_enum_str_diesel!(UvdKind);
