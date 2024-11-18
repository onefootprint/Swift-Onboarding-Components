use crate::*;
use newtypes::DataLifetimeSeqno;
use newtypes::OnboardingStatus;
use newtypes::PublishablePlaybookKey;
use newtypes::RuleSetResultId;
use newtypes::WorkflowId;
use newtypes::WorkflowKind;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct EntityOnboardingRuleSetResult {
    pub id: RuleSetResultId,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct EntityOnboarding {
    pub id: WorkflowId,
    pub playbook_name: String,
    #[openapi(example = "pb_live_fZvYlX3JpanlQ3MAwE45g0")]
    pub playbook_key: PublishablePlaybookKey,
    pub kind: WorkflowKind,
    pub status: OnboardingStatus,
    pub rule_set_results: Vec<EntityOnboardingRuleSetResult>,
    pub seqno: Option<DataLifetimeSeqno>,
    pub timestamp: DateTime<Utc>,
}
