use db::models::types::DataKind;
use paperclip::actix::Apiv2Schema;
use strum_macros::{self, Display};

#[derive(
    Debug,
    Clone,
    Apiv2Schema,
    serde::Deserialize,
    serde::Serialize,
    Eq,
    PartialEq,
    Hash,
    Ord,
    PartialOrd,
    Display,
)]
#[serde(rename_all = "snake_case")]
pub enum UserVaultFieldKind {
    FirstName,
    LastName,
    Ssn,
    Dob,
    StreetAddress,
    City,
    State,
    Email,
    PhoneNumber,
}

impl From<UserVaultFieldKind> for DataKind {
    fn from(v: UserVaultFieldKind) -> Self {
        match v {
            UserVaultFieldKind::FirstName => DataKind::FirstName,
            UserVaultFieldKind::LastName => DataKind::LastName,
            UserVaultFieldKind::Ssn => DataKind::Ssn,
            UserVaultFieldKind::Dob => DataKind::Dob,
            UserVaultFieldKind::StreetAddress => DataKind::StreetAddress,
            UserVaultFieldKind::City => DataKind::City,
            UserVaultFieldKind::State => DataKind::State,
            UserVaultFieldKind::Email => DataKind::Email,
            UserVaultFieldKind::PhoneNumber => DataKind::PhoneNumber,
        }
    }
}

impl From<DataKind> for UserVaultFieldKind {
    fn from(v: DataKind) -> Self {
        match v {
            DataKind::FirstName => UserVaultFieldKind::FirstName,
            DataKind::LastName => UserVaultFieldKind::LastName,
            DataKind::Ssn => UserVaultFieldKind::Ssn,
            DataKind::Dob => UserVaultFieldKind::Dob,
            DataKind::StreetAddress => UserVaultFieldKind::StreetAddress,
            DataKind::City => UserVaultFieldKind::City,
            DataKind::State => UserVaultFieldKind::State,
            DataKind::Email => UserVaultFieldKind::Email,
            DataKind::PhoneNumber => UserVaultFieldKind::PhoneNumber,
        }
    }
}
