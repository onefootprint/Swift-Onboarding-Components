use crate::schema::onboarding_decision;
use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{ComplianceStatus, OnboardingDecisionId, OnboardingId, TenantUserId, VerificationStatus};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding_decision)]
pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub onboarding_id: OnboardingId,
    pub logic_git_hash: String,
    pub tenant_user_id: Option<TenantUserId>,
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
