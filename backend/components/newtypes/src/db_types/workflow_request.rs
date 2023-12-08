use paperclip::actix::Apiv2Schema;

use crate::{DocumentRequestKind, TriggerInfo};
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WorkflowRequestConfig {
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    RedoKyc,
    /// Upload a new document and re-run the decision engine
    IdDocument {
        kind: DocumentRequestKind,
        collect_selfie: bool,
    },
}

impl From<TriggerInfo> for WorkflowRequestConfig {
    fn from(value: TriggerInfo) -> Self {
        match value {
            TriggerInfo::RedoKyc => Self::RedoKyc,
            TriggerInfo::IdDocument { collect_selfie } => Self::IdDocument {
                kind: DocumentRequestKind::Identity,
                collect_selfie,
            },
            TriggerInfo::ProofOfSsn => Self::IdDocument {
                kind: DocumentRequestKind::ProofOfSsn,
                collect_selfie: false,
            },
        }
    }
}
