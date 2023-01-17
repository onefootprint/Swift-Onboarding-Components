use crate::{DataIdentifier, PiiString, SaltedFingerprint, UvdKind};
use crypto::sha256;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

// TODO move to own file
#[derive(
    Debug,
    Display,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Apiv2Schema,
    Serialize,
    Deserialize,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumIter,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum IdentityDataKind {
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
    Email,
    PhoneNumber,
}

crate::util::impl_enum_str_diesel!(IdentityDataKind);

// UvdKind is a subset of IdentityDataKind, where UvdKind just represents the types of data stored in
// the UserVaultData table
impl From<UvdKind> for IdentityDataKind {
    fn from(value: UvdKind) -> Self {
        match value {
            UvdKind::FirstName => Self::FirstName,
            UvdKind::LastName => Self::LastName,
            UvdKind::Dob => Self::Dob,
            UvdKind::Ssn4 => Self::Ssn4,
            UvdKind::Ssn9 => Self::Ssn9,
            UvdKind::AddressLine1 => Self::AddressLine1,
            UvdKind::AddressLine2 => Self::AddressLine2,
            UvdKind::City => Self::City,
            UvdKind::State => Self::State,
            UvdKind::Zip => Self::Zip,
            UvdKind::Country => Self::Country,
        }
    }
}

impl IdentityDataKind {
    /// Returns true if we store a fingerprint of this value to allow exact match searching.
    pub fn allows_fingerprint(&self) -> bool {
        matches!(
            self,
            Self::PhoneNumber | Self::Email | Self::Ssn9 | Self::FirstName | Self::LastName | Self::Ssn4
        )
    }

    pub fn is_optional(&self) -> bool {
        matches!(self, Self::AddressLine2)
    }

    pub fn fingerprintable() -> impl Iterator<Item = Self> {
        Self::iter().filter(Self::allows_fingerprint)
    }
}

impl SaltedFingerprint for IdentityDataKind {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = self.to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}

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
    Apiv2Schema, // should be able to rm
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
pub enum DataLifetimeKind {
    // TODO transparently nest IdentityDataKind here
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
    IdentityDocument,
    Custom,
}

impl From<IdentityDataKind> for DataLifetimeKind {
    fn from(value: IdentityDataKind) -> Self {
        match value {
            IdentityDataKind::FirstName => Self::FirstName,
            IdentityDataKind::LastName => Self::LastName,
            IdentityDataKind::Dob => Self::Dob,
            IdentityDataKind::Ssn4 => Self::Ssn4,
            IdentityDataKind::Ssn9 => Self::Ssn9,
            IdentityDataKind::AddressLine1 => Self::AddressLine1,
            IdentityDataKind::AddressLine2 => Self::AddressLine2,
            IdentityDataKind::City => Self::City,
            IdentityDataKind::State => Self::State,
            IdentityDataKind::Zip => Self::Zip,
            IdentityDataKind::Country => Self::Country,
            IdentityDataKind::Email => Self::Email,
            IdentityDataKind::PhoneNumber => Self::PhoneNumber,
        }
    }
}

impl From<DataIdentifier> for Option<DataLifetimeKind> {
    fn from(value: DataIdentifier) -> Self {
        match value {
            DataIdentifier::Id(id) => Some(id.into()),
            DataIdentifier::Custom(_) => Some(DataLifetimeKind::Custom),
            DataIdentifier::IdDocument => Some(DataLifetimeKind::IdentityDocument),
            DataIdentifier::Selfie => None,
        }
    }
}

crate::util::impl_enum_str_diesel!(DataLifetimeKind);
