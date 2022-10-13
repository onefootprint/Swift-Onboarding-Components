use crate::{PiiString, SaltedFingerprint};
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
}

impl SaltedFingerprint for DataAttribute {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = self.to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}
