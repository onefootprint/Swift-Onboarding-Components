use crate::util::impl_enum_string_diesel;
use crate::EnumDotNotationError;
use crate::ObConfigurationKind;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
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
        macros::SerdeAttr,
    ),
    strum(serialize_all = "snake_case"),
    serde(rename_all = "snake_case")
)]
#[strum_discriminants(diesel(sql_type = Text))]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WorkflowState {
    Kyc(KycState),
    AlpacaKyc(AlpacaKycState),
    Document(DocumentState),
    AdhocVendorCall(AdhocVendorCallState),
    Kyb(KybState),
}

impl_enum_string_diesel!(WorkflowKind);
impl_enum_string_diesel!(WorkflowState);

impl WorkflowState {
    pub fn is_complete(&self) -> bool {
        match self {
            Self::Kyc(s) => matches!(s, KycState::Complete),
            Self::AlpacaKyc(s) => matches!(s, AlpacaKycState::PendingReview | AlpacaKycState::Complete),
            Self::Document(s) => matches!(s, DocumentState::Complete),
            Self::Kyb(s) => matches!(s, KybState::Complete),
            Self::AdhocVendorCall(s) => matches!(s, AdhocVendorCallState::Complete),
        }
    }
}

impl WorkflowKind {
    /// Returns true if the decision for this workflow should be visible to tenants via API
    pub fn has_tenant_facing_decision(&self) -> bool {
        match self {
            Self::Kyb | Self::Kyc | Self::AlpacaKyc => true,
            // Don't show status of document-only workflows triggered via the dashboard. Onboardings onto
            // document playbooks actually use the Kyc workflow (which is shown above)
            Self::Document | Self::AdhocVendorCall => false,
        }
    }

    /// Returns true if this WorkflowKind can be created with a playbook of the given kind
    pub fn is_compatible_with(&self, obc_kind: ObConfigurationKind) -> bool {
        match self {
            Self::Kyb => !matches!(obc_kind, ObConfigurationKind::Kyc | ObConfigurationKind::Auth),
            Self::Kyc | Self::AlpacaKyc => !matches!(obc_kind, ObConfigurationKind::Auth),
            // Document and AdhocVendorCall workflows don't particularly care what kind of playbook they're
            // associated with
            Self::Document | Self::AdhocVendorCall => !matches!(obc_kind, ObConfigurationKind::Auth),
        }
    }
}

impl std::fmt::Display for WorkflowState {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            WorkflowState::Kyc(s) => s.to_string(),
            WorkflowState::AlpacaKyc(s) => s.to_string(),
            WorkflowState::Document(s) => s.to_string(),
            WorkflowState::AdhocVendorCall(s) => s.to_string(),
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
            WorkflowKind::AdhocVendorCall => Self::AdhocVendorCall(
                AdhocVendorCallState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?,
            ),
            WorkflowKind::Kyb => Self::Kyb(KybState::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?),
        };
        Ok(result)
    }
}

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum KycState {
    DataCollection,
    VendorCalls,
    Decisioning,
    Complete,
    DocCollection,
}

impl From<KycState> for WorkflowState {
    fn from(value: KycState) -> Self {
        Self::Kyc(value)
    }
}

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
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

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
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

#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum KybState {
    DataCollection,
    StepUpDecisioning,
    AwaitingBoKyc,
    VendorCalls,
    AwaitingAsyncVendors,
    Decisioning,
    DocCollection,
    Complete,
}

impl From<KybState> for WorkflowState {
    fn from(value: KybState) -> Self {
        Self::Kyb(value)
    }
}


#[derive(Debug, PartialEq, Eq, Display, Clone, Copy, EnumString, Apiv2Schema, macros::SerdeAttr)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AdhocVendorCallState {
    VendorCalls,
    Complete,
}

impl From<AdhocVendorCallState> for WorkflowState {
    fn from(value: AdhocVendorCallState) -> Self {
        Self::AdhocVendorCall(value)
    }
}
