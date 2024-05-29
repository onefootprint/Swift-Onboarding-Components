use crate::*;
use newtypes::{
    TenantFrequentNoteId,
    TenantFrequentNoteKind,
};

/// Frequently used note for an Org
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct OrgFrequentNote {
    pub id: TenantFrequentNoteId,
    pub kind: TenantFrequentNoteKind,
    pub content: String,
}
