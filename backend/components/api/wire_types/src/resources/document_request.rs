use crate::Apiv2Schema;
use crate::Serialize;
use newtypes::DocumentRequestKind;
use newtypes::RuleSetResultId;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentRequest {
    pub kind: DocumentRequestKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rule_set_result_id: Option<RuleSetResultId>,
}
