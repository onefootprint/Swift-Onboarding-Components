use crate::{schema::manual_review, DbResult};
use crate::{DbError, TxnPgConnection};

use crate::PgConnection;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{DbActor, ManualReviewId, OnboardingDecisionId, OnboardingId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Default, Serialize, Deserialize)]
#[diesel(table_name = manual_review)]
pub struct ManualReview {
    pub id: ManualReviewId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: OnboardingId,
    // When populated, means the ManualReview is no longer active
    pub completed_at: Option<DateTime<Utc>>,
    // If the ManualReview was completed by making a new OnboardingDecision, is referenced here.
    // Otherwise, means the ManualReview was simply cleared without making an updated decision.
    pub completed_by_decision_id: Option<OnboardingDecisionId>,
    // If the ManualReview was completed by a tenant dashboard user, linked here
    pub completed_by_actor: Option<DbActor>,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = manual_review)]
struct NewManualReview {
    timestamp: DateTime<Utc>,
    onboarding_id: OnboardingId,
}

#[derive(Debug, AsChangeset, Default, Serialize, Deserialize)]
#[diesel(table_name = manual_review)]
struct ManualReviewUpdate {
    completed_at: Option<Option<DateTime<Utc>>>,
    completed_by_decision_id: Option<Option<OnboardingDecisionId>>,
    completed_by_actor: Option<Option<DbActor>>,
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

    /// Used to mark the manual review as complete
    pub fn complete<T>(
        self,
        conn: &mut TxnPgConnection,
        actor: T,
        decision_id: Option<OnboardingDecisionId>,
    ) -> DbResult<()>
    where
        T: Into<DbActor>,
    {
        let update = ManualReviewUpdate {
            completed_at: Some(Some(Utc::now())),
            completed_by_decision_id: Some(decision_id),
            completed_by_actor: Some(Some(actor.into())),
        };
        let results = diesel::update(manual_review::table)
            .filter(manual_review::id.eq(self.id))
            .filter(manual_review::completed_at.is_null())
            .set(update)
            .get_results::<Self>(conn.conn())?;
        if results.len() != 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        Ok(())
    }
}
