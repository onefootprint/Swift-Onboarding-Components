use crate::DbResult;
use crate::{DbError, TxnPgConn};
use db_schema::schema::{manual_review, onboarding_decision};

use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::dsl::not;
use diesel::prelude::*;
use newtypes::{DbActor, ManualReviewId, OnboardingDecisionId, OnboardingId, ReviewReason};
use serde::{Deserialize, Serialize};

use super::onboarding_decision::OnboardingDecision;

#[derive(Debug, Clone, Queryable, Default, Serialize, Deserialize)]
#[diesel(table_name = manual_review)]
pub struct ManualReview {
    pub id: ManualReviewId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: OnboardingId, // TODO: migrate to scoped_vault_id FP-4468
    /// When populated, means the ManualReview is no longer active
    pub completed_at: Option<DateTime<Utc>>,
    /// If the ManualReview was completed by making a new OnboardingDecision, is referenced here.
    /// Otherwise, means the ManualReview was simply cleared without making an updated decision.
    pub completed_by_decision_id: Option<OnboardingDecisionId>,
    /// If the ManualReview was completed by a tenant dashboard user, linked here
    pub completed_by_actor: Option<DbActor>,
    pub review_reasons: Vec<ReviewReason>,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = manual_review)]
struct NewManualReview {
    timestamp: DateTime<Utc>,
    onboarding_id: OnboardingId,
    review_reasons: Vec<ReviewReason>,
}

#[derive(Debug, AsChangeset, Default, Serialize, Deserialize)]
#[diesel(table_name = manual_review)]
struct ManualReviewUpdate {
    completed_at: Option<Option<DateTime<Utc>>>,
    completed_by_decision_id: Option<Option<OnboardingDecisionId>>,
    completed_by_actor: Option<Option<DbActor>>,
}

impl ManualReview {
    #[tracing::instrument("ManualReview::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        onboarding_id: OnboardingId,
        review_reasons: Vec<ReviewReason>,
    ) -> DbResult<Self> {
        // NOTE: We have a uniqueness constraint that won't allow us to create multiple active
        // ManualReview rows for one onboarding.
        let new = NewManualReview {
            timestamp: Utc::now(),
            onboarding_id,
            review_reasons,
        };
        let result = diesel::insert_into(manual_review::table)
            .values(new)
            .get_result(conn)?;
        Ok(result)
    }

    /// Used to mark the manual review as complete
    #[tracing::instrument("ManualReview::complete", skip_all)]
    pub fn complete<T>(
        self,
        conn: &mut TxnPgConn,
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

    #[tracing::instrument("ManualReview::find_completed", skip_all)]
    pub fn find_completed(
        conn: &mut PgConn,
        onboarding_id: &OnboardingId,
    ) -> DbResult<Option<(ManualReview, OnboardingDecision)>> {
        let res: Option<(ManualReview, OnboardingDecision)> = manual_review::table
            .filter(manual_review::onboarding_id.eq(onboarding_id))
            .filter(not(manual_review::completed_at.is_null()))
            .inner_join(onboarding_decision::table)
            .order_by(manual_review::completed_at.desc())
            .select((manual_review::all_columns, onboarding_decision::all_columns))
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("ManualReview::get_active_for_onboarding", skip_all)]
    pub fn get_active_for_onboarding(conn: &mut PgConn, ob_id: &OnboardingId) -> DbResult<Option<Self>> {
        let result = manual_review::table
            .filter(manual_review::onboarding_id.eq(ob_id))
            .filter(manual_review::completed_at.is_null())
            .get_result(conn)
            .optional()?;
        Ok(result)
    }
}
