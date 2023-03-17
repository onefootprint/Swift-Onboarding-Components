use super::Error;
use super::VResult;
use crate::{InvestorProfileKind as IPK, PiiString};
use crate::{NtResult, Validate};
use serde::de::DeserializeOwned;
use serde_with::DeserializeFromStr;
use std::str::FromStr;
use strum_macros::EnumString;

impl Validate for IPK {
    fn validate(&self, value: PiiString, _for_bifrost: bool) -> NtResult<PiiString> {
        let value = match self {
            Self::Occupation => validate_length(value)?,
            Self::BrokerageFirmEmployer => validate_length(value)?,
            Self::AnnualIncome => parse_enum::<AnnualIncome>(value)?,
            Self::NetWorth => parse_enum::<NetWorth>(value)?,
            Self::InvestmentGoals => parse_json_and_validate::<Vec<InvestmentGoal>, _>(value, |l| {
                if l.is_empty() {
                    Err(Error::InvalidLength)
                } else {
                    Ok(())
                }
            })?,
            Self::RiskTolerance => parse_enum::<RiskTolerance>(value)?,
            Self::Declarations => parse_json::<Vec<Declaration>>(value)?,
        };
        Ok(value)
    }
}

fn validate_length(input: PiiString) -> VResult<PiiString> {
    if input.leak().is_empty() {
        return Err(Error::InvalidLength);
    }
    Ok(input)
}

fn parse_enum<T>(value: PiiString) -> VResult<PiiString>
where
    T: FromStr<Err = strum::ParseError>,
{
    T::from_str(value.leak())?;
    Ok(value)
}

fn parse_json<T>(value: PiiString) -> VResult<PiiString>
where
    T: DeserializeOwned,
{
    parse_json_and_validate::<T, _>(value, |_| Ok(()))
}

fn parse_json_and_validate<T, F>(value: PiiString, f: F) -> VResult<PiiString>
where
    T: DeserializeOwned,
    F: FnOnce(T) -> VResult<()>,
{
    let parsed_value = serde_json::de::from_str(value.leak())?;
    f(parsed_value)?;
    Ok(value)
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
    GrowLongTermWealth,
    SaveForRetirement,
    SupportLovedOnes,
    BuyAHome,
    PayOffDebt,
    StartMyOwnBusiness,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum RiskTolerance {
    Conservative,
    Moderate,
    Aggressive,
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum Declaration {
    AffiliatedWithUsBroker,
    SeniorExecutive,
    SeniorPoliticalFigure,
    FamilyOfPoliticalFigure,
}
