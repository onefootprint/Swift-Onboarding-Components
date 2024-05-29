use crate::{
    CollectedData,
    DataIdentifier,
    IsDataIdentifierDiscriminant,
};
use strum_macros::{
    Display,
    EnumIter,
    EnumString,
};

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumIter, EnumString)]
#[strum(serialize_all = "snake_case")]
/// Represents data that is collected as part of a user's investor profile
pub enum InvestorProfileKind {
    EmploymentStatus,
    Occupation,
    Employer,
    AnnualIncome,
    NetWorth,
    InvestmentGoals,
    RiskTolerance,
    Declarations,
    // These IPKs are for metadata based on the declarations
    /// If affiliated with a broker-dealer, the name of the brokerage
    BrokerageFirmEmployer,
    /// If a senior executive or shareholder at a publicly traded company, the list of symbols
    SeniorExecutiveSymbols,
    /// If a senior political figure, names of immediate family members
    FamilyMemberNames,
    /// If a senior political figure, name of the political organization
    PoliticalOrganization,
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

impl InvestorProfileKind {
    pub fn is_optional(&self) -> bool {
        matches!(
            self,
            Self::Employer
                | Self::Occupation
                | Self::BrokerageFirmEmployer
                // TODO make employment status not null after migrating frontend
                | Self::EmploymentStatus
                | Self::SeniorExecutiveSymbols
                | Self::FamilyMemberNames
                | Self::PoliticalOrganization
        )
    }
}

impl IsDataIdentifierDiscriminant for InvestorProfileKind {
    fn parent(&self) -> Option<CollectedData> {
        Some(CollectedData::InvestorProfile)
    }
}
