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
pub enum CardDataKind {
    Number,
    Expiration,
    Cvc,
    Name,
    #[strum(to_string = "billing_address.zip")]
    BillingZip,
    #[strum(to_string = "billing_address.country")]
    BillingCountry,

    // Derived entries
    #[strum(to_string = "expiration_month")]
    ExpMonth,
    #[strum(to_string = "expiration_year")]
    ExpYear,
    #[strum(to_string = "number_last4")]
    Last4,
    Issuer,
    Fingerprint,
}

impl CardDataKind {
    pub fn is_derived(&self) -> bool {
        match self {
            Self::ExpMonth | Self::ExpYear | Self::Last4 | Self::Issuer | Self::Fingerprint => true,
            Self::Number
            | Self::Expiration
            | Self::Cvc
            | Self::Name
            | Self::BillingZip
            | Self::BillingCountry => false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CardInfo {
    pub alias: AliasId,
    pub kind: CardDataKind,
}

impl From<CardInfo> for DataIdentifier {
    fn from(value: CardInfo) -> Self {
        Self::Card(value)
    }
}

impl TryFrom<DataIdentifier> for CardInfo {
    type Error = crate::Error;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Card(info) => Ok(info),
            _ => Err(crate::Error::Custom("Can't convert into CardInfo".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for CardInfo {
    fn parent(&self) -> Option<CollectedData> {
        // TODO
        None
    }
}

/// A custom implementation to make the appearance of serialized CardInfo much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl FromStr for CardInfo {
    type Err = EnumDotNotationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let alias = AliasId::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        let kind = CardDataKind::from_str(suffix)
            .map_err(|_| EnumDotNotationError::CannotParseSuffix(suffix.to_owned()))?;
        Ok(Self { alias, kind })
    }
}

impl std::fmt::Display for CardInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}.{}", self.alias, self.kind)
    }
}

impl CardInfo {
    pub fn api_examples() -> Vec<Self> {
        CardDataKind::iter()
            .map(|k| CardInfo {
                alias: AliasId::fixture(),
                kind: k,
            })
            .collect_vec()
    }
}
