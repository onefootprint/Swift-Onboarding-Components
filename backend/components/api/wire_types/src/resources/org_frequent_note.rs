use crate::*;
use newtypes::TenantFrequentNoteId;
use newtypes::TenantFrequentNoteKind;

/// Frequently used note for an Org
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
pub struct OrgFrequentNote {
    pub id: TenantFrequentNoteId,
    pub kind: TenantFrequentNoteKind,
    pub content: String,
}
