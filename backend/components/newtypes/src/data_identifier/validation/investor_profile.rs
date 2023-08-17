use super::utils;
use super::Error;
use crate::AllData;
use crate::NtResult;
use crate::Validate;
use crate::ValidateArgs;
use crate::{InvestorProfileKind as IPK, PiiString};
use serde_with::DeserializeFromStr;
use strum_macros::EnumString;

impl Validate for IPK {
    fn validate(&self, value: PiiString, _: ValidateArgs, _: &AllData) -> NtResult<PiiString> {
        // Don't want anything to be empty
        let value = utils::validate_not_empty(value)?;
        let value = match self {
            Self::EmploymentStatus => utils::parse_enum::<EmploymentStatus>(value)?,
            Self::Occupation => value,
            Self::Employer => value,
            Self::AnnualIncome => utils::parse_enum::<AnnualIncome>(value)?,
            Self::NetWorth => utils::parse_enum::<NetWorth>(value)?,
            Self::InvestmentGoals => utils::parse_json_and_validate::<Vec<InvestmentGoal>, _>(value, |l| {
                if l.is_empty() {
                    Err(Error::InvalidLength)
                } else {
                    Ok(())
                }
            })?,
            Self::RiskTolerance => utils::parse_enum::<RiskTolerance>(value)?,
            Self::Declarations => utils::parse_json::<Vec<Declaration>>(value)?,
            Self::BrokerageFirmEmployer => value,
            Self::SeniorExecutiveSymbols => utils::parse_json_and_validate::<Vec<String>, _>(value, |l| {
                if l.is_empty() || l.into_iter().any(|symbol| symbol.trim().is_empty()) {
                    Err(Error::InvalidLength)
                } else {
                    Ok(())
                }
            })?,
            Self::FamilyMemberNames => utils::parse_json_and_validate::<Vec<String>, _>(value, |l| {
                if l.into_iter().any(|name| name.trim().is_empty()) {
                    Err(Error::InvalidLength)
                } else {
                    Ok(())
                }
            })?,
            Self::PoliticalOrganization => value,
        };
        Ok(value)
    }
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum EmploymentStatus {
    Employed,
    Unemployed,
    Student,
    Retired,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum AnnualIncome {
    Lt50k,
    S50kTo100k,
    S100kTo250k,
    S250kTo500k,
    Gt500k,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum NetWorth {
    Lt50k,
    S50kTo100k,
    S100kTo250k,
    S250kTo500k,
    S500kTo1m,
    Gt1m,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum InvestmentGoal {
    Growth,
    Income,
    PreserveCapital,
    Speculation,
    Divserification,
    Other,

    // Can't remove these yet since some old vaults have these
    /// DEPRECATED
    GrowLongTermWealth,
    /// DEPRECATED
    SaveForRetirement,
    /// DEPRECATED
    SupportLovedOnes,
    /// DEPRECATED
    BuyAHome,
    /// DEPRECATED
    PayOffDebt,
    /// DEPRECATED
    StartMyOwnBusiness,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum RiskTolerance {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString, PartialEq, Eq)]
#[strum(serialize_all = "snake_case")]
pub enum Declaration {
    AffiliatedWithUsBroker,
    SeniorExecutive,
    SeniorPoliticalFigure,
    FamilyOfPoliticalFigure,
}

impl Declaration {
    pub fn requires_finra_compliance_doc(&self) -> bool {
        matches!(self, Self::AffiliatedWithUsBroker | Self::SeniorExecutive)
    }
}
