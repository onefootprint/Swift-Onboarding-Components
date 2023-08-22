use super::utils;
use super::Error;
use crate::AllData;
use crate::NtResult;
use crate::Validate;
use crate::ValidateArgs;
use crate::{InvestorProfileKind as IPK, PiiString};
use itertools::Itertools;
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
            Self::SeniorExecutiveSymbols => utils::parse_json_and_map::<Vec<String>, _>(value, |l| {
                if l.is_empty() || l.iter().any(|symbol| symbol.len() < 3 || symbol.len() > 5) {
                    Err(Error::InvalidLength)
                } else if l
                    .iter()
                    .any(|symbol| symbol.chars().any(|c| !c.is_ascii_alphabetic()))
                {
                    Err(Error::InvalidCharacter)
                } else {
                    let uppercase_symbols = l.iter().map(|s| s.to_uppercase()).collect_vec();
                    let value = PiiString::from(serde_json::ser::to_string(&uppercase_symbols)?);
                    Ok(value)
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
    Le25k,
    Gt25kLe50k,
    Gt50kLe100k,
    Gt100kLe200k,
    Gt200kLe300k,
    Gt300kLe500k,
    Gt500kLe1200k,
    Gt1200k,

    /// DEPRECATED
    Lt50k,
    /// DEPRECATED
    S50kTo100k,
    /// DEPRECATED
    S100kTo250k,
    /// DEPRECATED
    S250kTo500k,
    /// DEPRECATED
    Gt500k,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum NetWorth {
    Le50k,
    Gt50kLe100k,
    Gt100kLe200k,
    Gt200kLe500k,
    Gt500kLe1m,
    Gt1mLe5m,
    Gt5m,

    /// DEPRECATED
    Lt50k,
    /// DEPRECATED
    S50kTo100k,
    /// DEPRECATED
    S100kTo250k,
    /// DEPRECATED
    S250kTo500k,
    /// DEPRECATED
    S500kTo1m,
    /// DEPRECATED
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
