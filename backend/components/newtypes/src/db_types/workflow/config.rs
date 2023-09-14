pub use super::*;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

// TODO: probs consolidate this into WorkflowState somehow
#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, PartialEq, Eq, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WorkflowConfig {
    Kyc(KycConfig),
    AlpacaKyc(AlpacaKycConfig),
    Document(DocumentConfig),
    Kyb(KybConfig),
}

impl WorkflowConfig {
    pub fn kind(&self) -> WorkflowKind {
        match self {
            Self::Kyc(_) => WorkflowKind::Kyc,
            Self::AlpacaKyc(_) => WorkflowKind::AlpacaKyc,
            Self::Document(_) => WorkflowKind::Document,
            Self::Kyb(_) => WorkflowKind::Kyb,
        }
    }

    // If this is a Workflow that is not the first onboarding for the user
    pub fn is_redo(&self) -> bool {
        match self {
            WorkflowConfig::Kyc(c) => c.is_redo,
            WorkflowConfig::AlpacaKyc(c) => c.is_redo,
            WorkflowConfig::Document(_) => true,
            WorkflowConfig::Kyb(_) => false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct KycConfig {
    pub is_redo: bool,
}

impl From<KycConfig> for WorkflowConfig {
    fn from(value: KycConfig) -> Self {
        Self::Kyc(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct AlpacaKycConfig {
    pub is_redo: bool,
}

impl From<AlpacaKycConfig> for WorkflowConfig {
    fn from(value: AlpacaKycConfig) -> Self {
        Self::AlpacaKyc(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DocumentConfig {}

impl From<DocumentConfig> for WorkflowConfig {
    fn from(value: DocumentConfig) -> Self {
        Self::Document(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct KybConfig {}

impl From<KybConfig> for WorkflowConfig {
    fn from(value: KybConfig) -> Self {
        Self::Kyb(value)
    }
}
