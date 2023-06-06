use crate::util::impl_enum_string_diesel;
use crate::EnumDotNotationError;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::str::FromStr;
use strum::Display;
use strum::EnumDiscriminants;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

// TODO: maybe move this to new `state` crate?
#[derive(
    Debug,
    Clone,
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
    Apiv2Schema,
)]
#[strum_discriminants(
    name(WorkflowKind),
    vis(pub),
    derive(
        Display,
        strum_macros::EnumString,
        strum_macros::EnumIter,
        AsExpression,
        FromSqlRow,
        DeserializeFromStr,
        SerializeDisplay,
        Apiv2Schema,
    ),
    strum(serialize_all = "snake_case")
)]
#[strum_discriminants(diesel(sql_type = Text))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkflowState {
    Kyc(KycState),
    AlpacaKyc(AlpacaKycState),
}

impl_enum_string_diesel!(WorkflowKind);
impl_enum_string_diesel!(WorkflowState);

impl std::fmt::Display for WorkflowState {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            WorkflowState::Kyc(s) => s.to_string(),
            WorkflowState::AlpacaKyc(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

// TODO: code share w/ DataIdentifier instead of copypaste
impl FromStr for WorkflowState {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let prefix = WorkflowKind::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            WorkflowKind::Kyc => Self::Kyc(KycState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?),
            WorkflowKind::AlpacaKyc => {
                Self::AlpacaKyc(AlpacaKycState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
        };
        Ok(result)
    }
}

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum KycState {
    DataCollection,
    VendorCalls,
    Decisioning,
    Complete,
}

impl From<KycState> for WorkflowState {
    fn from(value: KycState) -> Self {
        Self::Kyc(value)
    }
}

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum AlpacaKycState {
    DataCollection,
    VendorCalls,
    Decisioning,
    WatchlistCheck,
    PendingReview,
    DocCollection,
    Complete,
}

impl From<AlpacaKycState> for WorkflowState {
    fn from(value: AlpacaKycState) -> Self {
        Self::AlpacaKyc(value)
    }
}

// TODO: probs consolidate this into WorkflowState somehow
#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, PartialEq, Eq, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WorkflowConfig {
    Kyc(KycConfig),
    AlpacaKyc(AlpacaKycConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct KycConfig {
    pub is_redo: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct AlpacaKycConfig {
    pub is_redo: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(WorkflowState::Kyc(KycState::DataCollection) => "kyc.data_collection")]
    fn test_to_string(s: WorkflowState) -> String {
        s.to_string()
    }

    #[test_case("kyc.decisioning" => WorkflowState::Kyc(KycState::Decisioning))]
    fn test_from_str(input: &str) -> WorkflowState {
        WorkflowState::from_str(input).unwrap()
    }
}
