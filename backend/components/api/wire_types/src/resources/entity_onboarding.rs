use crate::*;
use newtypes::DataLifetimeSeqno;
use newtypes::OnboardingStatus;
use newtypes::PublishablePlaybookKey;
use newtypes::RuleSetResultId;
use newtypes::WatchlistCheckId;
use newtypes::WorkflowConfig;
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
    pub kind: PublicWorkflowKind,
    pub status: OnboardingStatus,
    pub rule_set_results: Vec<EntityOnboardingRuleSetResult>,
    pub seqno: Option<DataLifetimeSeqno>,
    pub timestamp: DateTime<Utc>,
    pub config: WorkflowConfig,
}

#[derive(Debug, Serialize, Apiv2Schema, Clone)]
#[serde(rename_all = "snake_case")]
pub enum PublicWorkflowKind {
    Kyc,
    AlpacaKyc,
    Kyb,
    Document,
    AdhocVendorCall,
    ContinuousMonitoringWatchlistCheck,
}

impl From<(WorkflowKind, Option<WatchlistCheckId>)> for PublicWorkflowKind {
    fn from((kind, watchlist_check_id): (WorkflowKind, Option<WatchlistCheckId>)) -> Self {
        match kind {
            WorkflowKind::Kyc => PublicWorkflowKind::Kyc,
            WorkflowKind::AlpacaKyc => PublicWorkflowKind::AlpacaKyc,
            WorkflowKind::Kyb => PublicWorkflowKind::Kyb,
            WorkflowKind::Document => PublicWorkflowKind::Document,
            WorkflowKind::AdhocVendorCall => {
                if watchlist_check_id.is_some() {
                    PublicWorkflowKind::ContinuousMonitoringWatchlistCheck
                } else {
                    PublicWorkflowKind::AdhocVendorCall
                }
            }
        }
    }
}
