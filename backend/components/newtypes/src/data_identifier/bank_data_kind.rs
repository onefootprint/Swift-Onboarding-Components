use crate::AliasId;
use crate::CollectedData;
use crate::DataIdentifier;
use crate::EnumDotNotationError;
use crate::IsDataIdentifierDiscriminant;
use itertools::Itertools;
use std::str::FromStr;
use strum::EnumIter;
use strum::IntoEnumIterator;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(Debug, Display, Clone, Copy, PartialEq, Eq, Hash, EnumString, EnumIter)]
#[strum(serialize_all = "snake_case")]
pub enum BankDataKind {
    Name,
    AchRoutingNumber,
    AchAccountNumber,
    AchAccountId,
    AccountType,

    // Derived entries
    Fingerprint,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct BankInfo {
    pub alias: AliasId,
    pub kind: BankDataKind,
}

impl From<BankInfo> for DataIdentifier {
    fn from(value: BankInfo) -> Self {
        Self::Bank(value)
    }
}

impl TryFrom<DataIdentifier> for BankInfo {
    type Error = crate::Error;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Bank(info) => Ok(info),
            _ => Err(crate::Error::Custom("Can't convert into BankInfo".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for BankInfo {
    fn parent(&self) -> Option<CollectedData> {
        // TODO
        None
    }
}

/// A custom implementation to make the appearance of serialized CardInfo much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl FromStr for BankInfo {
    type Err = EnumDotNotationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let alias = AliasId::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        let kind = BankDataKind::from_str(suffix)
            .map_err(|_| EnumDotNotationError::CannotParseSuffix(suffix.to_owned()))?;
        Ok(Self { alias, kind })
    }
}

impl std::fmt::Display for BankInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}.{}", self.alias, self.kind)
    }
}

impl BankInfo {
    pub fn api_examples() -> Vec<Self> {
        BankDataKind::iter()
            .map(|k| BankInfo {
                alias: AliasId::fixture(),
                kind: k,
            })
            .collect_vec()
    }
}
