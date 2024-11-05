use crate::*;
use newtypes::DataLifetimeSeqno;
use newtypes::ObConfigurationKey;
use newtypes::OnboardingStatus;
use newtypes::RuleSetResultId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct EntityOnboardingRuleSetResult {
    pub id: RuleSetResultId,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct EntityOnboarding {
    pub id: WorkflowId,
    #[openapi(example = "pb_live_fZvYlX3JpanlQ3MAwE45g0")]
    pub playbook_key: ObConfigurationKey,
    pub status: OnboardingStatus,
    pub rule_set_results: Vec<EntityOnboardingRuleSetResult>,
    pub seqno: Option<DataLifetimeSeqno>,
    pub timestamp: DateTime<Utc>,
}
