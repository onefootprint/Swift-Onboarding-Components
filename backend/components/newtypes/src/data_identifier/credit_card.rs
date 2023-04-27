use std::str::FromStr;

use crate::{
    AliasId, CollectedData, DataIdentifier, EnumDotNotationError, IsDataIdentifierDiscriminant, Validate,
};
use paperclip::actix::Apiv2Schema;
use strum::EnumIter;
use strum_macros::{Display, EnumString};
#[derive(
    Debug, Display, Clone, Copy, Apiv2Schema, PartialEq, Eq, Ord, PartialOrd, Hash, EnumString, EnumIter,
)]
#[strum(serialize_all = "snake_case")]
pub enum CreditCardDataKind {
    Number,
    ExpMonth,
    ExpYear,
    Cvc,
    Last4,
}
#[derive(Debug, Clone, Apiv2Schema, PartialEq, Eq, Ord, PartialOrd, Hash)]
pub struct CreditCardInfo {
    pub alias: AliasId,
    pub kind: CreditCardDataKind,
}

impl From<CreditCardInfo> for DataIdentifier {
    fn from(value: CreditCardInfo) -> Self {
        Self::CreditCard(value)
    }
}

impl TryFrom<DataIdentifier> for CreditCardInfo {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::CreditCard(info) => Ok(info),
            _ => Err(crate::Error::Custom(
                "Can't convert into CreditCardInfo".to_owned(),
            )),
        }
    }
}

impl Validate for CreditCardInfo {
    fn validate(&self, value: crate::PiiString, _for_bifrost: bool) -> crate::NtResult<crate::PiiString> {
        // TODO
        Ok(value)
    }
}

impl IsDataIdentifierDiscriminant for CreditCardInfo {
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

/// A custom implementation to make the appearance of serialized CreditCardInfo much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl FromStr for CreditCardInfo {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let alias = AliasId::from(prefix.to_owned());
        let kind = CreditCardDataKind::from_str(suffix)
            .map_err(|_| EnumDotNotationError::CannotParseSuffix(suffix.to_owned()))?;
        Ok(Self { alias, kind })
    }
}

impl std::fmt::Display for CreditCardInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}.{}", self.alias, self.kind)
    }
}
