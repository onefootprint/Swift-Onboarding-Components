use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, PiiString, SaltedFingerprint};
use crypto::sha256;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

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
/// Represents the kind of a piece of "identity data" - data which is on your virtual
/// "Footprint ID card" and that we send off to be verified by data vendors.
/// This data is stored in potentiall different underlying database tables.
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

impl From<IdentityDataKind> for DataIdentifier {
    fn from(value: IdentityDataKind) -> Self {
        Self::Id(value)
    }
}

impl TryFrom<DataIdentifier> for IdentityDataKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Id(idk) => Ok(idk),
            _ => Err(crate::Error::Custom("Can't convert into IDK".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for IdentityDataKind {
    fn parent(&self) -> Option<CollectedData> {
        let result = match self {
            Self::FirstName => CollectedData::Name,
            Self::LastName => CollectedData::Name,
            Self::Dob => CollectedData::Dob,
            Self::Ssn4 => CollectedData::Ssn,
            Self::Ssn9 => CollectedData::Ssn,
            Self::AddressLine1 => CollectedData::Address,
            Self::AddressLine2 => CollectedData::Address,
            Self::City => CollectedData::Address,
            Self::State => CollectedData::Address,
            Self::Zip => CollectedData::Address,
            Self::Country => CollectedData::Address,
            Self::Email => CollectedData::Email,
            Self::PhoneNumber => CollectedData::PhoneNumber,
        };
        Some(result)
    }

    fn is_optional(&self) -> bool {
        matches!(self, Self::AddressLine2)
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

    pub fn fingerprintable() -> impl Iterator<Item = Self> {
        Self::iter().filter(Self::allows_fingerprint)
    }

    // Some kinds we may be more surprised than others seeing show up in multiple distinct vaults
    pub fn should_have_unique_fingerprint(&self) -> bool {
        matches!(self, Self::Ssn9 | Self::Ssn4)
    }
}

// TODO should one day just implement this on DataIdentifier but we'd have to migrate all the old
// fingerprints
impl SaltedFingerprint for IdentityDataKind {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = self.to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}
