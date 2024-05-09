use std::collections::HashMap;

use super::{
    manual_review::{ManualReview, ManualReviewArgs},
    ob_configuration::ObConfiguration,
    user_timeline::UserTimeline,
};
use crate::{actor, actor::SaturatedActor, models::workflow::Workflow, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{
    manual_review, onboarding_decision, onboarding_decision_verification_result_junction, scoped_vault,
    workflow,
};
use diesel::{dsl::not, prelude::*, Insertable, Queryable};
use newtypes::{
    AnnotationId, DataLifetimeSeqno, DbActor, DecisionStatus, FpId, OnboardingDecisionId,
    OnboardingDecisionInfo, RuleSetResultId, ScopedVaultId, TenantId, VaultId, VerificationResultId,
    WorkflowId,
};

pub type FailedForDocReview = bool;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = onboarding_decision)]
pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub logic_git_hash: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub status: DecisionStatus,
    pub actor: DbActor,
    pub seqno: Option<DataLifetimeSeqno>,
    pub workflow_id: WorkflowId,
    /// If this is an OBD from a workflow, this will be the corresponding rule result making that decision
    /// Note: this is NOT currently backfilled so will be null for historical workflows
    pub rule_set_result_id: Option<RuleSetResultId>,
    /// When true, the user had a document manual review. If no other rule action was matched,
    /// we would fail the user.
    pub failed_for_doc_review: FailedForDocReview,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = onboarding_decision)]
struct NewOnboardingDecisionRow {
    logic_git_hash: String,
    created_at: DateTime<Utc>,
    status: DecisionStatus,
    actor: DbActor,
    seqno: DataLifetimeSeqno,
    workflow_id: WorkflowId,
    rule_set_result_id: Option<RuleSetResultId>,
    failed_for_doc_review: FailedForDocReview,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = onboarding_decision_verification_result_junction)]
pub struct OnboardingDecisionJunction {
    pub verification_result_id: VerificationResultId,
    pub onboarding_decision_id: OnboardingDecisionId,
}

#[derive(Debug)]
pub struct NewDecisionArgs {
    pub vault_id: VaultId,
    pub logic_git_hash: String,
    pub status: DecisionStatus,
    pub result_ids: Vec<VerificationResultId>,
    pub annotation_id: Option<AnnotationId>,
    pub actor: DbActor,
    pub seqno: DataLifetimeSeqno,
    /// List of actions to perform for each ManualReviewKind. If no action is provided for a
    /// ManualReviewKind, we'll leave any existing ManualReview for that kind untouched.
    pub manual_reviews: Vec<ManualReviewArgs>,
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub failed_for_doc_review: FailedForDocReview,
}

pub type SaturatedOnboardingDecisionInfo = (
    OnboardingDecision,
    ObConfiguration,
    SaturatedActor,
    Option<ManualReview>,
);

impl OnboardingDecision {
    #[tracing::instrument("OnboardingDecision::create", skip_all)]
    pub(super) fn create(conn: &mut TxnPgConn, wf: &Workflow, args: NewDecisionArgs) -> DbResult<Self> {
        let NewDecisionArgs {
            vault_id,
            logic_git_hash,
            status,
            result_ids,
            annotation_id,
            actor,
            seqno,
            rule_set_result_id,
            failed_for_doc_review,
            // Used by caller
            manual_reviews: _,
        } = args;
        // Deactivate the last decision
        diesel::update(onboarding_decision::table)
            .filter(onboarding_decision::workflow_id.eq(&wf.id))
            .filter(onboarding_decision::deactivated_at.is_null())
            .set(onboarding_decision::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        // Create the new decision
        let new = NewOnboardingDecisionRow {
            logic_git_hash,
            status,
            actor,
            seqno,
            rule_set_result_id,
            failed_for_doc_review,
            created_at: Utc::now(),
            workflow_id: wf.id.clone(),
        };
        let result = diesel::insert_into(onboarding_decision::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;

        // Create junction rows that join the decision to the results that created them
        let junction_rows: Vec<_> = result_ids
            .into_iter()
            .map(|id| OnboardingDecisionJunction {
                onboarding_decision_id: result.id.clone(),
                verification_result_id: id,
            })
            .collect();
        diesel::insert_into(onboarding_decision_verification_result_junction::table)
            .values(junction_rows)
            .execute(conn.conn())?;

        // Create UserTimeline event for the decision
        let decision_info = OnboardingDecisionInfo {
            id: result.id.clone(),
            annotation_id,
        };
        UserTimeline::create(conn, decision_info, vault_id, wf.scoped_vault_id.clone())?;
        Ok(result)
    }

    #[tracing::instrument("OnboardingDecision::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&OnboardingDecisionId>,
    ) -> DbResult<HashMap<OnboardingDecisionId, SaturatedOnboardingDecisionInfo>> {
        use db_schema::schema::{ob_configuration, workflow};
        let results: Vec<(Self, (Workflow, ObConfiguration), Option<ManualReview>)> =
            onboarding_decision::table
                .inner_join(workflow::table.inner_join(ob_configuration::table))
                .left_join(manual_review::table)
                .filter(onboarding_decision::id.eq_any(ids))
                .get_results(conn)?;

        let onboarding_decisions: Vec<OnboardingDecision> =
            results.clone().into_iter().map(|r| r.0).collect();
        let onboarding_decisions_with_actors = actor::saturate_actors(conn, onboarding_decisions)?;

        let result_map = results
            .into_iter()
            .zip(onboarding_decisions_with_actors.into_iter())
            .map(
                |((onboarding_decision, (_, onboarding_configuration), mr), (_, saturated_db_actor))| {
                    (
                        onboarding_decision,
                        onboarding_configuration,
                        saturated_db_actor,
                        mr,
                    )
                },
            )
            .map(|d| (d.0.id.clone(), d))
            .collect();

        Ok(result_map)
    }

    #[tracing::instrument("OnboardingDecision::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Option<Self>> {
        let res = onboarding_decision::table
            .filter(onboarding_decision::workflow_id.eq(wf_id))
            .filter(onboarding_decision::deactivated_at.is_null())
            .get_result(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("OnboardingDecision::latest_footprint_actor_decision", skip_all)]
    pub fn latest_footprint_actor_decision(
        conn: &mut PgConn,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Option<Self>> {
        use db_schema::schema::workflow;
        let res: Option<OnboardingDecision> = onboarding_decision::table
            .filter(onboarding_decision::actor.eq(DbActor::Footprint))
            .inner_join(workflow::table.inner_join(scoped_vault::table))
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .filter(scoped_vault::deactivated_at.is_null())
            .order_by(onboarding_decision::created_at.desc())
            .select(onboarding_decision::all_columns)
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("OnboardingDecision::latest_non_footprint_actor_decision", skip_all)]
    pub fn latest_non_footprint_actor_decision(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
    ) -> DbResult<Option<(Self, Option<ManualReview>)>> {
        let res: Option<(OnboardingDecision, Option<ManualReview>)> = onboarding_decision::table
            .filter(not(onboarding_decision::actor.eq(DbActor::Footprint)))
            .inner_join(workflow::table.inner_join(scoped_vault::table))
            .left_join(
                manual_review::table
                    .on(manual_review::completed_by_decision_id.eq(onboarding_decision::id.nullable())),
            )
            .filter(scoped_vault::id.eq(sv_id))
            .filter(scoped_vault::deactivated_at.is_null())
            .order_by(onboarding_decision::created_at.desc())
            .select((
                onboarding_decision::all_columns,
                manual_review::all_columns.nullable(),
            ))
            .first(conn)
            .optional()?;
        Ok(res)
    }
}
