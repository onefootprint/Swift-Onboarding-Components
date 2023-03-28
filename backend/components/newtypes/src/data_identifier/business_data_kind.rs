use crypto::sha256;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, PiiString, SaltedFingerprint};

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
    EnumIter,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Represents data that is collected about a particular Business
pub enum BusinessDataKind {
    Name,
    Dba,
    Website,
    PhoneNumber,
    Ein,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    BeneficialOwners,
}

impl From<BusinessDataKind> for DataIdentifier {
    fn from(value: BusinessDataKind) -> Self {
        Self::Business(value)
    }
}

impl TryFrom<DataIdentifier> for BusinessDataKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Business(bdk) => Ok(bdk),
            _ => Err(crate::Error::Custom("Can't convert into BDK".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for BusinessDataKind {
    fn is_optional(&self) -> bool {
        matches!(self, Self::Dba | Self::AddressLine2)
    }

    fn parent(&self) -> Option<CollectedData> {
        let result = match self {
            Self::Name => CollectedData::BusinessName,
            Self::Dba => CollectedData::BusinessName,
            Self::Website => CollectedData::BusinessWebsite,
            Self::PhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::Ein => CollectedData::BusinessEin,
            Self::AddressLine1 => CollectedData::BusinessAddress,
            Self::AddressLine2 => CollectedData::BusinessAddress,
            Self::City => CollectedData::BusinessAddress,
            Self::State => CollectedData::BusinessAddress,
            Self::Zip => CollectedData::BusinessAddress,
            Self::Country => CollectedData::BusinessAddress,
            Self::BeneficialOwners => CollectedData::BusinessBeneficialOwners,
        };
        Some(result)
    }
}

impl SaltedFingerprint for BusinessDataKind {
    fn salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        // Convert this to a DataIdentifier since we will eventually migrate to DI-based salting
        let self_name = DataIdentifier::from(*self).to_string();
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}

#[cfg(test)]
mod test {
    use crate::{BusinessDataKind, PiiString, SaltedFingerprint};

    #[test]
    fn test_fingerprint() {
        let pii = PiiString::from("Flerp Inc");
        let fingerprint = BusinessDataKind::Name.salt_pii_to_sign(&pii);
        // Here, we use a fixture fingerprint just compupted at some point in the past.
        // If the implementation of fingerprinting changes, the search on the dashboard will break.
        // So, if this test fails, it means you made a backwards-incompatible change to
        // fingerprinting and have to migrate old FPs

        let expected_fp: [u8; 32] = [
            161, 180, 84, 228, 16, 240, 168, 166, 132, 47, 102, 90, 177, 221, 216, 47, 58, 232, 38, 0, 21,
            97, 124, 207, 95, 137, 134, 230, 44, 218, 231, 233,
        ];
        assert_eq!(fingerprint, expected_fp,)
    }
}
