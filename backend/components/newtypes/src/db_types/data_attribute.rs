use crate::{CollectedData, PiiString, SaltedFingerprint};
use crypto::sha256;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

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
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DataAttribute {
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
}

crate::util::impl_enum_str_diesel!(DataAttribute);

impl DataAttribute {
    /// Returns true if we store a fingerprint of this value to allow exact match searching.
    pub fn allows_fingerprint(&self) -> bool {
        matches!(
            self,
            DataAttribute::PhoneNumber
                | DataAttribute::Email
                | DataAttribute::Ssn9
                | DataAttribute::FirstName
                | DataAttribute::LastName
                | DataAttribute::Ssn4
        )
    }

    pub fn is_required(&self) -> bool {
        !matches!(self, DataAttribute::AddressLine2)
    }

    pub fn fingerprintable() -> impl Iterator<Item = DataAttribute> {
        Self::iter().filter(DataAttribute::allows_fingerprint)
    }

    /// Maps the DataAttribute to the CollectedData that may collect this attribute
    fn parent(&self) -> Option<CollectedData> {
        CollectedData::iter().find(|c| c.children().contains(self))
    }

    /// Get the list of DataAttributes that should be cleared when this kind is updated
    pub fn kinds_to_clear(&self) -> Vec<Self> {
        // Look at the CollectedData that encompasses this DataAttribute.
        // All of the other DataAttributes represented by that CollectedData need to be cleared
        // when one is set
        self.parent().map(|c| c.children()).unwrap_or_default()
    }
}

impl SaltedFingerprint for DataAttribute {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = self.to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}
