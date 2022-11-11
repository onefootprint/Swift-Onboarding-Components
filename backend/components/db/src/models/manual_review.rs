use chrono::{DateTime, Utc};
use newtypes::{ManualReviewId, OnboardingDecisionId, OnboardingId, TenantUserId};

#[derive(Debug, Clone, Queryable, Default)]
#[diesel(table_name = manual_review)]
pub struct ManualReview {
    pub id: ManualReviewId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: OnboardingId,
    pub completed_at: Option<DateTime<Utc>>,
    pub completed_by_decision_id: Option<OnboardingDecisionId>,
    pub completed_by_tenant_user_id: Option<TenantUserId>,
}
