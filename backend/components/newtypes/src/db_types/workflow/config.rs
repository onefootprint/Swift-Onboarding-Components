use crate::{DocumentRequestConfig, DocumentRequestKind};

pub use super::*;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use serde::{Deserialize, Serialize};

// TODO: probs consolidate this into WorkflowState somehow
#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, PartialEq, Eq)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct KycConfig {
    /// This isn't really used in many places anymore, can maybe rm
    pub is_redo: bool,
}

impl From<KycConfig> for WorkflowConfig {
    fn from(value: KycConfig) -> Self {
        Self::Kyc(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]

pub struct AlpacaKycConfig {
    /// This isn't really used in many places anymore, can maybe rm
    pub is_redo: bool,
}

impl From<AlpacaKycConfig> for WorkflowConfig {
    fn from(value: AlpacaKycConfig) -> Self {
        Self::AlpacaKyc(value)
    }
}

fn default_doc_req_kind() -> DocumentRequestKind {
    DocumentRequestKind::Identity
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DocumentConfig {
    // Legacy rows don't have this, so need serde default
    // TODO rm
    #[serde(default)]
    pub collect_selfie: bool,
    // Legacy rows don't have this, so need serde default
    // TODO rm
    #[serde(default = "default_doc_req_kind")]
    pub kind: DocumentRequestKind,

    #[serde(default)]
    pub configs: Vec<DocumentRequestConfig>,
}

impl From<DocumentConfig> for WorkflowConfig {
    fn from(value: DocumentConfig) -> Self {
        Self::Document(value)
    }
}

impl From<DocumentRequestConfig> for WorkflowConfig {
    fn from(value: DocumentRequestConfig) -> Self {
        let kind = DocumentRequestKind::from(&value);
        let collect_selfie = match value {
            DocumentRequestConfig::Identity { collect_selfie, .. } => collect_selfie,
            _ => false,
        };
        DocumentConfig {
            kind,
            collect_selfie,
            configs: vec![value],
        }
        .into()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct KybConfig {}

impl From<KybConfig> for WorkflowConfig {
    fn from(value: KybConfig) -> Self {
        Self::Kyb(value)
    }
}
