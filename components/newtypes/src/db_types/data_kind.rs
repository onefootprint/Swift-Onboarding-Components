use crate::SaltedFingerprint;
use crypto::sha256;
pub use derive_more::Display;
use diesel_derive_enum::DbEnum;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

/// The type of data attribute
#[derive(
    Debug,
    DbEnum,
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
)]
#[serde(rename_all = "snake_case")]
#[PgType = "data_kind"]
#[DieselType = "Data_kind"]
#[DbValueStyle = "verbatim"]
pub enum DataKind {
    FirstName,
    LastName,
    Dob,
    Ssn,
    StreetAddress,
    StreetAddress2,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,
    LastFourSsn,
}

impl DataKind {
    /// Returns true if a user vault is allowed to have more than one active piece of data for this
    /// kind.
    pub fn allow_multiple(&self) -> bool {
        matches!(self, DataKind::PhoneNumber | DataKind::Email)
    }

    /// Returns true if we store a fingerprint of this value to allow exact match searching.
    pub fn allows_fingerprint(&self) -> bool {
        matches!(
            self,
            DataKind::PhoneNumber
                | DataKind::Email
                | DataKind::Ssn
                | DataKind::FirstName
                | DataKind::LastName
                | DataKind::LastFourSsn
        )
    }

    pub fn fingerprintable() -> impl Iterator<Item = DataKind> {
        Self::iter().filter(DataKind::allows_fingerprint)
    }
}

impl SaltedFingerprint for DataKind {
    fn salt_data_to_sign(&self, data: &[u8]) -> [u8; 32] {
        let self_name = self.to_string();
        let concat = [sha256(self_name.as_bytes()), sha256(data)].concat();
        sha256(&concat)
    }
}
