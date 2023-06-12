use std::str::FromStr;

use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, EnumDiscriminants, EnumString};

use crate::{
    BusinessDataKind as BDK, CardInfo as CCI, DataIdentifier, DocumentKind, IdentityDataKind as IDK,
    InvestorProfileKind as IPK, KvDataKey, StorageType,
};

#[derive(
    Debug,
    Clone,
    Eq,
    Hash,
    PartialEq,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
)]
#[strum_discriminants(
    name(VdKindDiscriminant),
    derive(EnumString),
    strum(serialize_all = "snake_case")
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
// TODO remove VdKind, just have runtime validation of the data kind
/// A subset of DataIdentifier whose values are stored in the VaultData table
pub enum VdKind {
    Id(IDK),
    Business(BDK),
    Custom(KvDataKey),
    InvestorProfile(IPK),
    Card(CCI),
    Document(DocumentKind), // TODO: should we create separate DocumentVaultDataKind?
}

crate::util::impl_enum_string_diesel!(VdKind);
crate::util::impl_enum_string_diesel!(BDK);

impl From<VdKind> for DataIdentifier {
    fn from(value: VdKind) -> Self {
        match value {
            VdKind::Business(b) => Self::Business(b),
            VdKind::Id(b) => Self::Id(b),
            VdKind::Custom(k) => Self::Custom(k),
            VdKind::InvestorProfile(k) => Self::InvestorProfile(k),
            VdKind::Card(k) => Self::Card(k),
            VdKind::Document(d) => Self::Document(d),
        }
    }
}

impl TryFrom<DataIdentifier> for VdKind {
    type Error = ConversionError;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Business(b) => Ok(Self::Business(b)),
            DataIdentifier::Id(b) => Ok(Self::Id(b)),
            DataIdentifier::Custom(k) => Ok(Self::Custom(k)),
            DataIdentifier::InvestorProfile(k) => Ok(Self::InvestorProfile(k)),
            DataIdentifier::Card(k) => Ok(Self::Card(k)),
            DataIdentifier::Document(doc) => match doc.storage_type() {
                StorageType::VaultData => Ok(Self::Document(doc)),
                StorageType::DocumentMetadata | StorageType::DocumentData => {
                    Err(ConversionError::Error(value))
                }
            },
        }
    }
}

impl From<IDK> for VdKind {
    fn from(value: IDK) -> Self {
        Self::Id(value)
    }
}

impl From<BDK> for VdKind {
    fn from(value: BDK) -> Self {
        Self::Business(value)
    }
}

impl From<KvDataKey> for VdKind {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}

impl From<IPK> for VdKind {
    fn from(value: IPK) -> Self {
        Self::InvestorProfile(value)
    }
}

impl From<CCI> for VdKind {
    fn from(value: CCI) -> Self {
        Self::Card(value)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("Cannot convert from DataIdentifier: {0}")]
    Error(DataIdentifier),
    #[error("VdKind does not support {0}")]
    Unsupported(String),
}

impl std::fmt::Display for VdKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let di = DataIdentifier::from(self.clone());
        di.fmt(f)
    }
}

impl FromStr for VdKind {
    type Err = crate::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let di = DataIdentifier::from_str(s)?;
        let result = Self::try_from(di)?;
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(VdKind::Id(IDK::FirstName) => "id.first_name")]
    #[test_case(VdKind::Id(IDK::AddressLine1) => "id.address_line1")]
    fn test_serialization(kind: VdKind) -> String {
        kind.to_string()
    }

    #[test_case("id.first_name" => VdKind::Id(IDK::FirstName))]
    #[test_case("id.address_line1" => VdKind::Id(IDK::AddressLine1))]
    fn test_deserialization(input: &str) -> VdKind {
        VdKind::from_str(input).unwrap()
    }
}
