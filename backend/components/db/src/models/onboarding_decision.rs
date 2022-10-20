use crate::{schema::onboarding_decision, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{ComplianceStatus, OnboardingDecisionId, OnboardingId, TenantUserId, VerificationStatus};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision)]
pub struct NewOnboardingDecision {
    pub onboarding_id: OnboardingId,
    pub logic_git_hash: String,
    pub tenant_user_id: Option<TenantUserId>,
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub created_at: DateTime<Utc>,
}

impl OnboardingDecision {
    pub fn create(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
        logic_git_hash: String,
        tenant_user_id: Option<TenantUserId>,
        verification_status: VerificationStatus,
        compliance_status: ComplianceStatus,
    ) -> DbResult<Self> {
        let new = NewOnboardingDecision {
            onboarding_id,
            logic_git_hash,
            tenant_user_id,
            verification_status,
            compliance_status,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(onboarding_decision::table)
            .values(new)
            .get_result::<Self>(conn)?;
        Ok(result)
    }
}
