use crate::{AliasId, CollectedData, DataIdentifier, EnumDotNotationError, IsDataIdentifierDiscriminant};
use paperclip::actix::Apiv2Schema;
use std::str::FromStr;
use strum::EnumIter;
use strum_macros::{Display, EnumString};

#[derive(
    Debug, Display, Clone, Copy, Apiv2Schema, PartialEq, Eq, Ord, PartialOrd, Hash, EnumString, EnumIter,
)]
#[strum(serialize_all = "snake_case")]
pub enum CardDataKind {
    Number,
    ExpMonth,
    ExpYear,
    Cvc,
    Last4,
}

#[derive(Debug, Clone, Apiv2Schema, PartialEq, Eq, Ord, PartialOrd, Hash)]
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
            _ => Err(crate::Error::Custom(
                "Can't convert into CardInfo".to_owned(),
            )),
        }
    }
}

impl IsDataIdentifierDiscriminant for CardInfo {
    // This really needs to be per CDO
    fn is_optional(&self) -> bool {
        // TODO
        true
    }

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
        let alias = AliasId::from(prefix.to_owned());
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
