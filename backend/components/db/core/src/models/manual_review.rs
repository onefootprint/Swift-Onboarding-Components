use super::onboarding_decision::OnboardingDecision;
use super::workflow::Workflow;
use crate::DbError;
use crate::DbResult;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::manual_review;
use diesel::prelude::*;
use newtypes::output::Csv;
use newtypes::DbActor;
use newtypes::ManualReviewId;
use newtypes::ManualReviewKind;
use newtypes::OnboardingDecisionId;
use newtypes::ReviewReason;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = manual_review)]
pub struct ManualReview {
    pub id: ManualReviewId,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// When populated, means the ManualReview is no longer active
    pub completed_at: Option<DateTime<Utc>>,
    /// If the ManualReview was completed by making a new OnboardingDecision, is referenced here.
    /// Otherwise, means the ManualReview was simply cleared without making an updated decision.
    pub completed_by_decision_id: Option<OnboardingDecisionId>,
    /// If the ManualReview was completed by a tenant dashboard user, linked here
    pub completed_by_actor: Option<DbActor>,
    #[diesel(deserialize_as = NonNullVec<ReviewReason>)]
    pub review_reasons: Vec<ReviewReason>,
    pub workflow_id: WorkflowId,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: ManualReviewKind,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = manual_review)]
struct NewManualReview {
    timestamp: DateTime<Utc>,
    review_reasons: Vec<ReviewReason>,
    workflow_id: WorkflowId,
    scoped_vault_id: ScopedVaultId,
    kind: ManualReviewKind,
}

#[derive(Debug, Clone)]
pub struct ManualReviewArgs {
    pub kind: ManualReviewKind,
    pub action: ManualReviewAction,
}

#[derive(Debug, Clone)]
pub enum ManualReviewAction {
    /// Create a new ManualReview with the specified reasons, unless one already exist
    GetOrCreate { review_reasons: Vec<ReviewReason> },
    /// Clear the existing ManualReview of this kind, if exists
    Complete,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = manual_review)]
struct ManualReviewUpdate {
    completed_at: Option<Option<DateTime<Utc>>>,
    completed_by_decision_id: Option<Option<OnboardingDecisionId>>,
    completed_by_actor: Option<Option<DbActor>>,
}

#[derive(Clone, Copy)]
pub struct ManualReviewDelta {
    /// True if there existed an incomplete ManualReview _before_ applying ManualReview actions
    pub old_has_mrs: bool,
    /// True if there exists an incomplete ManualReview _after_ applying ManualReview actions
    pub new_has_mrs: bool,
}

impl ManualReview {
    #[tracing::instrument("ManualReview::apply_actions", skip_all)]
    pub fn apply_actions(
        conn: &mut TxnPgConn,
        workflow: &Workflow,
        decision: &OnboardingDecision,
        mrs: Vec<ManualReviewArgs>,
    ) -> DbResult<ManualReviewDelta> {
        let existing_mrs = Self::get_active(conn, &workflow.scoped_vault_id)?;
        let old_has_mrs = !existing_mrs.is_empty();
        for ManualReviewArgs { kind, action } in mrs {
            let existing = existing_mrs.iter().find(|mr| mr.kind == kind);
            match (existing, action) {
                (None, ManualReviewAction::GetOrCreate { review_reasons }) => {
                    // NOTE: We have a uniqueness constraint that won't allow us to create multiple
                    // active ManualReview rows of the same kind for one onboarding.
                    // Maybe we should merge the `review_reasons` when there's an existing one?
                    let new = NewManualReview {
                        timestamp: Utc::now(),
                        review_reasons,
                        workflow_id: workflow.id.clone(),
                        scoped_vault_id: workflow.scoped_vault_id.clone(),
                        kind,
                    };
                    diesel::insert_into(manual_review::table)
                        .values(new)
                        .execute(conn.conn())?;
                }
                (Some(mr), ManualReviewAction::Complete) => {
                    let update = ManualReviewUpdate {
                        completed_at: Some(Some(Utc::now())),
                        completed_by_decision_id: Some(Some(decision.id.clone())),
                        completed_by_actor: Some(Some(decision.actor.clone())),
                    };
                    let results = diesel::update(manual_review::table)
                        .filter(manual_review::id.eq(&mr.id))
                        .filter(manual_review::completed_at.is_null())
                        .set(update)
                        .get_results::<Self>(conn.conn())?;
                    if results.len() != 1 {
                        return Err(DbError::IncorrectNumberOfRowsUpdated);
                    }
                }
                // No-op
                (None, ManualReviewAction::Complete { .. }) => {}
                (Some(existing), ManualReviewAction::GetOrCreate { review_reasons }) => {
                    tracing::info!(%kind, existing_review_reasons=%Csv(existing.review_reasons.clone()), new_review_reasons=%Csv(review_reasons), "Manual review already exists, not creating");
                }
            }
        }
        let new_has_mrs = !Self::get_active(conn, &workflow.scoped_vault_id)?.is_empty();
        let result = ManualReviewDelta {
            old_has_mrs,
            new_has_mrs,
        };
        Ok(result)
    }

    #[tracing::instrument("ManualReview::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = manual_review::table
            .filter(manual_review::completed_at.is_null())
            .filter(manual_review::scoped_vault_id.eq(sv_id))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ManualReview::get", skip_all)]
    pub fn list_cleared_by(conn: &mut PgConn, id: &OnboardingDecisionId) -> DbResult<Vec<Self>> {
        let results = manual_review::table
            .filter(manual_review::completed_by_decision_id.eq(id))
            .get_results(conn)?;
        Ok(results)
    }
}
