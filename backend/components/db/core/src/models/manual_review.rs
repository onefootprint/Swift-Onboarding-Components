use crate::{DbError, DbResult, NonNullVec, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::manual_review;
use diesel::prelude::*;
use newtypes::{
    output::Csv, DbActor, ManualReviewId, ManualReviewKind, OnboardingDecisionId, ReviewReason,
    ScopedVaultId, WorkflowId,
};

use super::{onboarding_decision::OnboardingDecision, workflow::Workflow};

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

#[derive(derive_more::From)]
pub enum ManualReviewIdentifier<'a> {
    ScopedVault(&'a ScopedVaultId),
    Workflow(&'a WorkflowId),
}

impl ManualReview {
    #[tracing::instrument("ManualReview::apply_actions", skip_all)]
    pub fn apply_actions(
        conn: &mut TxnPgConn,
        workflow: &Workflow,
        decision: OnboardingDecision,
        mrs: Vec<ManualReviewArgs>,
    ) -> DbResult<()> {
        let existing_mrs = Self::get_active(conn, &workflow.id)?;
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
        Ok(())
    }

    #[tracing::instrument("ManualReview::get_active", skip_all)]
    pub fn get_active<'a, T: Into<ManualReviewIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
    ) -> DbResult<Vec<Self>> {
        let mut query = manual_review::table
            .filter(manual_review::completed_at.is_null())
            .into_boxed();
        match id.into() {
            ManualReviewIdentifier::Workflow(wf_id) => {
                query = query.filter(manual_review::workflow_id.eq(wf_id));
            }
            ManualReviewIdentifier::ScopedVault(sv_id) => {
                query = query.filter(manual_review::scoped_vault_id.eq(sv_id));
            }
        }
        let result = query.get_results(conn)?;
        Ok(result)
    }
}
