use crate::{
    Apiv2Schema,
    Serialize,
};
use newtypes::{
    DocumentRequestKind,
    RuleSetResultId,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct DocumentRequest {
    pub kind: DocumentRequestKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rule_set_result_id: Option<RuleSetResultId>,
}
