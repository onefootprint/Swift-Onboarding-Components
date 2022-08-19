use crate::{PiiString, SaltedFingerprint};
use crypto::sha256;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, EnumIter, EnumString};

/// The type of data attribute
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
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "PascalCase")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DataKind {
    FirstName,
    LastName,
    Dob,
    Ssn9,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    Email,
    PhoneNumber,
    Ssn4,
}

crate::util::impl_enum_str_diesel!(DataKind);

impl DataKind {
    /// Returns true if we store a fingerprint of this value to allow exact match searching.
    pub fn allows_fingerprint(&self) -> bool {
        matches!(
            self,
            DataKind::PhoneNumber
                | DataKind::Email
                | DataKind::Ssn9
                | DataKind::FirstName
                | DataKind::LastName
                | DataKind::Ssn4
        )
    }

    pub fn is_required(&self) -> bool {
        !matches!(self, DataKind::AddressLine2)
    }

    pub fn fingerprintable() -> impl Iterator<Item = DataKind> {
        Self::iter().filter(DataKind::allows_fingerprint)
    }

    pub fn permissioning_kinds(self) -> Vec<DataKind> {
        // Returns the list of DataKinds for which this kind yields permissions.
        // For example, ability to decrypt an Ssn also provides the ability to decrypt LastFourSsn
        match self {
            DataKind::Ssn9 => vec![DataKind::Ssn9, DataKind::Ssn4],
            kind => vec![kind],
        }
    }
}

impl SaltedFingerprint for DataKind {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = self.to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}
