use paperclip::actix::Apiv2Schema;

use crate::{DocumentRequestConfig, DocumentRequestKind, ObConfigurationId, TriggerInfo};
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WorkflowRequestConfig {
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    /// DEPRECATED
    RedoKyc,
    /// Allow onboarding onto the specific playbook.
    /// This allows editing data, re-verifies data, and then re-triggers decision engine
    Onboard {
        playbook_id: ObConfigurationId,
    },
    /// Upload a new document and re-run the decision engine
    /// DEPRECATED. TODO backfill IdDocument -> Document
    IdDocument {
        kind: DocumentRequestKind,
        collect_selfie: bool,
    },
    Document {
        configs: Vec<DocumentRequestConfig>,
    },
}

impl From<TriggerInfo> for WorkflowRequestConfig {
    fn from(value: TriggerInfo) -> Self {
        match value {
            TriggerInfo::RedoKyc => Self::RedoKyc,
            TriggerInfo::Onboard { playbook_id } => Self::Onboard { playbook_id },
            TriggerInfo::IdDocument { collect_selfie } => Self::Document {
                configs: vec![DocumentRequestConfig::Identity { collect_selfie }],
            },
            TriggerInfo::ProofOfSsn => Self::Document {
                configs: vec![DocumentRequestConfig::ProofOfSsn {}],
            },
            TriggerInfo::ProofOfAddress => Self::Document {
                configs: vec![DocumentRequestConfig::ProofOfAddress {}],
            },
            TriggerInfo::Document { configs } => Self::Document { configs },
        }
    }
}
