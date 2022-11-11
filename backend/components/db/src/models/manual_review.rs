use crate::{schema::manual_review, DbResult};

use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::PgConnection;
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

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = manual_review)]
struct NewManualReview {
    timestamp: DateTime<Utc>,
    onboarding_id: OnboardingId,
}

impl ManualReview {
    pub fn create(conn: &mut PgConnection, onboarding_id: OnboardingId) -> DbResult<Self> {
        // NOTE: We have a uniqueness constraint that won't allow us to create multiple active
        // ManualReview rows for one onboarding.
        let new = NewManualReview {
            timestamp: Utc::now(),
            onboarding_id,
        };
        let result = diesel::insert_into(manual_review::table)
            .values(new)
            .get_result(conn)?;
        Ok(result)
    }
}
