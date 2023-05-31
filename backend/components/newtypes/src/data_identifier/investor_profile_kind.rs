use strum_macros::{Display, EnumIter, EnumString};

use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant};

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumIter, EnumString)]
#[strum(serialize_all = "snake_case")]
/// Represents data that is collected as part of a user's investor profile
pub enum InvestorProfileKind {
    Occupation,
    BrokerageFirmEmployer,
    AnnualIncome,
    NetWorth,
    InvestmentGoals,
    RiskTolerance,
    Declarations,
}

impl From<InvestorProfileKind> for DataIdentifier {
    fn from(value: InvestorProfileKind) -> Self {
        Self::InvestorProfile(value)
    }
}

impl TryFrom<DataIdentifier> for InvestorProfileKind {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::InvestorProfile(ipk) => Ok(ipk),
            _ => Err(crate::Error::Custom("Can't convert into IPK".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for InvestorProfileKind {
    fn is_optional(&self) -> bool {
        matches!(self, Self::Occupation | Self::BrokerageFirmEmployer)
    }

    fn parent(&self) -> Option<CollectedData> {
        Some(CollectedData::InvestorProfile)
    }
}
