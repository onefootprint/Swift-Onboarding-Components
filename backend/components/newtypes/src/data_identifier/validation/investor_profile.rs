use super::utils;
use super::Error;
use crate::AllData;
use crate::CleanAndValidate;
use crate::DataIdentifierValue;
use crate::InvestorProfileKind as IPK;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::ValidateArgs;
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use strum_macros::EnumString;

impl CleanAndValidate for IPK {
    type Parsed = ();

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        // Don't want anything to be empty
        let value = match self {
            Self::EmploymentStatus => utils::parse_enum::<EmploymentStatus>(value.as_string()?)?,
            Self::Occupation => value.as_string()?,
            Self::Employer => value.as_string()?,
            Self::AnnualIncome => utils::parse_enum::<AnnualIncome>(value.as_string()?)?,
            Self::NetWorth => utils::parse_enum::<NetWorth>(value.as_string()?)?,
            Self::InvestmentGoals => {
                utils::parse_json_and_validate::<Vec<InvestorProfileInvestmentGoal>, _>(value, |l| {
                    if l.is_empty() {
                        Err(Error::InvalidLength)
                    } else {
                        Ok(())
                    }
                })?
            }
            Self::RiskTolerance => utils::parse_enum::<RiskTolerance>(value.as_string()?)?,
            Self::Declarations => utils::parse_json::<Vec<InvestorProfileDeclaration>>(value)?,
            Self::BrokerageFirmEmployer => value.as_string()?,
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
            Self::PoliticalOrganization => value.as_string()?,
            Self::FundingSources => {
                utils::parse_json_and_validate::<Vec<InvestorProfileFundingSource>, _>(value, |l| {
                    if l.is_empty() {
                        Err(Error::InvalidLength)
                    } else {
                        Ok(())
                    }
                })?
            }
        };
        let value = utils::validate_not_empty(value)?;

        Ok(DataIdentifierValue {
            di: self.into(),
            value,
            parsed: (),
        })
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

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum InvestorProfileInvestmentGoal {
    Growth,
    Income,
    PreserveCapital,
    Speculation,
    Diversification,
    Other,

    // Can't remove these yet since some old vaults have these
    /// DEPRECATED
    #[openapi(skip)]
    GrowLongTermWealth,
    /// DEPRECATED
    #[openapi(skip)]
    SaveForRetirement,
    /// DEPRECATED
    #[openapi(skip)]
    SupportLovedOnes,
    /// DEPRECATED
    #[openapi(skip)]
    BuyAHome,
    /// DEPRECATED
    #[openapi(skip)]
    PayOffDebt,
    /// DEPRECATED
    #[openapi(skip)]
    StartMyOwnBusiness,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum RiskTolerance {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(
    Debug, Clone, Copy, DeserializeFromStr, EnumString, PartialEq, Eq, Apiv2Schema, macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum InvestorProfileDeclaration {
    AffiliatedWithUsBroker,
    SeniorExecutive,
    SeniorPoliticalFigure,
    FamilyOfPoliticalFigure,
}

impl InvestorProfileDeclaration {
    pub fn requires_finra_compliance_doc(&self) -> bool {
        matches!(self, Self::AffiliatedWithUsBroker | Self::SeniorExecutive)
    }
}

#[derive(
    Debug, Clone, Copy, DeserializeFromStr, EnumString, PartialEq, Eq, Apiv2Schema, macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum InvestorProfileFundingSource {
    EmploymentIncome,
    Investments,
    Inheritance,
    BusinessIncome,
    Savings,
    Family,
}
