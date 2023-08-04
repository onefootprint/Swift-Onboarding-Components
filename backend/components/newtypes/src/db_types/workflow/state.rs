use crate::util::impl_enum_string_diesel;
use crate::EnumDotNotationError;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
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
    Copy,
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
    Document(DocumentState),
    Kyb(KybState),
}

impl_enum_string_diesel!(WorkflowKind);
impl_enum_string_diesel!(WorkflowState);

impl std::fmt::Display for WorkflowState {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            WorkflowState::Kyc(s) => s.to_string(),
            WorkflowState::AlpacaKyc(s) => s.to_string(),
            WorkflowState::Document(s) => s.to_string(),
            WorkflowState::Kyb(s) => s.to_string(),
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
            WorkflowKind::Document => {
                Self::Document(DocumentState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            WorkflowKind::Kyb => Self::Kyb(KybState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?),
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

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum DocumentState {
    DataCollection,
    Decisioning,
    Complete,
}

impl From<DocumentState> for WorkflowState {
    fn from(value: DocumentState) -> Self {
        Self::Document(value)
    }
}

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString)]
#[strum(serialize_all = "snake_case")]
pub enum KybState {
    DataCollection,
    AwaitingBoKyc,
    VendorCalls,
    AwaitingAsyncVendors,
    Decisioning,
    Complete,
}

impl From<KybState> for WorkflowState {
    fn from(value: KybState) -> Self {
        Self::Kyb(value)
    }
}
