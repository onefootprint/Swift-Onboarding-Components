use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, Display, EnumIter, EnumString};

use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant};

#[derive(
    Debug,
    Display,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Apiv2Schema,
    Serialize,
    Deserialize,
    Hash,
    Clone,
    Copy,
    EnumIter,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
/// Represents data that is collected as part of a user's investor profile
pub enum InvestorProfileKind {
    EmploymentStatus,
    Occupation,
    EmployedByBrokerage,
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
        false
    }

    fn parent(&self) -> Option<CollectedData> {
        Some(CollectedData::InvestorProfile)
    }
}
