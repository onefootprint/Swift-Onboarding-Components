use super::onboarding_decision::OnboardingDecision;
use super::scoped_vault::ScopedVault;
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
use newtypes::TenantId;
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
    pub tenant_id: Option<TenantId>,
    pub is_live: Option<bool>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = manual_review)]
struct NewManualReview {
    timestamp: DateTime<Utc>,
    review_reasons: Vec<ReviewReason>,
    workflow_id: WorkflowId,
    scoped_vault_id: ScopedVaultId,
    kind: ManualReviewKind,
    tenant_id: TenantId,
    is_live: bool,
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
        let filters = ManualReviewFilters::get_active();
        let existing_mrs = Self::get(conn, &workflow.scoped_vault_id, filters)?;
        let old_has_mrs = !existing_mrs.is_empty();
        let sv = ScopedVault::get(conn, &workflow.scoped_vault_id)?;
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
                        scoped_vault_id: sv.id.clone(),
                        kind,
                        tenant_id: sv.tenant_id.clone(),
                        is_live: sv.is_live,
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
        let filters = ManualReviewFilters::get_active();
        let new_has_mrs = !Self::get(conn, &workflow.scoped_vault_id, filters)?.is_empty();
        let result = ManualReviewDelta {
            old_has_mrs,
            new_has_mrs,
        };
        Ok(result)
    }

    #[tracing::instrument("ManualReview::get", skip_all)]
    pub fn get<'a, T: Into<ManualReviewIdentifier<'a>>>(
        conn: &mut PgConn,
        id: T,
        filters: ManualReviewFilters,
    ) -> DbResult<Vec<Self>> {
        let mut query = manual_review::table.into_boxed();

        match id.into() {
            ManualReviewIdentifier::WorkflowId(wf_id) => {
                query = query.filter(manual_review::workflow_id.eq(wf_id))
            }
            ManualReviewIdentifier::ScopedVaultId(sv_id) => {
                query = query.filter(manual_review::scoped_vault_id.eq(sv_id))
            }
        }

        if filters.only_active {
            query = query.filter(manual_review::completed_at.is_null())
        }

        if let Some(kinds) = filters.kinds {
            query = query.filter(manual_review::kind.eq_any(kinds))
        }

        let res = query.get_results(conn)?;

        Ok(res)
    }
}

#[derive(Clone)]
pub struct ManualReviewFilters {
    pub only_active: bool,
    pub kinds: Option<Vec<ManualReviewKind>>,
}

impl ManualReviewFilters {
    pub fn get_active() -> Self {
        Self {
            only_active: true,
            kinds: None,
        }
    }
}

#[derive(derive_more::From)]
pub enum ManualReviewIdentifier<'a> {
    WorkflowId(&'a WorkflowId),
    ScopedVaultId(&'a ScopedVaultId),
}
