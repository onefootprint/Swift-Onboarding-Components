pub use super::*;
use crate::CollectedDataOption;
use crate::DocumentRequestConfig;
use crate::VerificationCheck;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use serde::Deserialize;
use serde::Serialize;

// TODO: probs consolidate this into WorkflowState somehow
#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WorkflowConfig {
    Kyc(KycConfig),
    AlpacaKyc(AlpacaKycConfig),
    Document(DocumentConfig),
    Kyb(KybConfig),
    AdhocVendorCall(AdhocVendorCallConfig),
}

impl WorkflowConfig {
    pub fn kind(&self) -> WorkflowKind {
        match self {
            Self::Kyc(_) => WorkflowKind::Kyc,
            Self::AlpacaKyc(_) => WorkflowKind::AlpacaKyc,
            Self::Document(_) => WorkflowKind::Document,
            Self::Kyb(_) => WorkflowKind::Kyb,
            Self::AdhocVendorCall(_) => WorkflowKind::AdhocVendorCall,
        }
    }

    pub fn recollect_attributes(&self) -> &[CollectedDataOption] {
        match self {
            Self::Kyc(config) => &config.recollect_attributes,
            Self::AlpacaKyc(_) => &[],
            Self::Document(_) => &[],
            Self::Kyb(config) => &config.recollect_attributes,
            Self::AdhocVendorCall(_) => &[],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct KycConfig {
    #[serde(default)]
    pub recollect_attributes: Vec<CollectedDataOption>,
}

impl From<KycConfig> for WorkflowConfig {
    fn from(value: KycConfig) -> Self {
        Self::Kyc(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct AlpacaKycConfig {}

impl From<AlpacaKycConfig> for WorkflowConfig {
    fn from(value: AlpacaKycConfig) -> Self {
        Self::AlpacaKyc(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentConfig {
    pub configs: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub business_configs: Vec<DocumentRequestConfig>,
}

impl From<DocumentConfig> for WorkflowConfig {
    fn from(value: DocumentConfig) -> Self {
        Self::Document(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct KybConfig {
    #[serde(default)]
    pub recollect_attributes: Vec<CollectedDataOption>,
    #[serde(default)]
    pub reuse_existing_bo_kyc: bool,
}

impl From<KybConfig> for WorkflowConfig {
    fn from(value: KybConfig) -> Self {
        Self::Kyb(value)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]

pub struct AdhocVendorCallConfig {
    pub verification_checks: Vec<VerificationCheck>,
}


impl From<AdhocVendorCallConfig> for WorkflowConfig {
    fn from(value: AdhocVendorCallConfig) -> Self {
        Self::AdhocVendorCall(value)
    }
}
