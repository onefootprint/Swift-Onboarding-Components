use crate::*;
use newtypes::LabelKind;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct UserLabel {
    pub kind: Option<LabelKind>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
}
