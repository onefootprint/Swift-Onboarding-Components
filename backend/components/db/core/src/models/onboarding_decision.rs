use super::business_workflow_link::BusinessWorkflowLink;
use super::data_lifetime::DataLifetime;
use super::data_lifetime::DataLifetimeSeqnoTxn;
use super::manual_review::ManualReview;
use super::manual_review::ManualReviewArgs;
use super::manual_review::ManualReviewDelta;
use super::ob_configuration::ObConfiguration;
use super::playbook::Playbook;
use super::scoped_vault::ScopedVault;
use super::user_timeline::UserTimeline;
use crate::actor;
use crate::actor::SaturatedActor;
use crate::models::workflow::Workflow;
use crate::OffsetPaginatedResult;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::manual_review;
use db_schema::schema::ob_configuration;
use db_schema::schema::onboarding_decision;
use db_schema::schema::playbook;
use db_schema::schema::scoped_vault;
use db_schema::schema::workflow;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::AnnotationId;
use newtypes::BusinessOwnerCompletedKycInfo;
use newtypes::DataLifetimeSeqno;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::OnboardingDecisionId;
use newtypes::OnboardingDecisionInfo;
use newtypes::RuleSetResultId;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

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
    pub seqno: DataLifetimeSeqno,
    // TODO we should add scoped_vault_id to this table since not all decisions really affect a workflow
    // anymore
    pub workflow_id: WorkflowId,
    /// If this is an OBD from a workflow, this will be the corresponding rule result making that
    /// decision Note: this is NOT currently backfilled so will be null for historical workflows
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
#[derive(Debug)]
pub struct NewDecisionArgs<'a> {
    pub sv_txn: &'a DataLifetimeSeqnoTxn<'a>,
    pub logic_git_hash: String,
    pub status: DecisionStatus,
    pub annotation_id: Option<AnnotationId>,
    pub actor: DbActor,
    /// List of actions to perform for each ManualReviewKind. If no action is provided for a
    /// ManualReviewKind, we'll leave any existing ManualReview for that kind untouched.
    pub manual_reviews: Vec<ManualReviewArgs>,
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub failed_for_doc_review: FailedForDocReview,
}

pub type SaturatedOnboardingDecisionInfo = (
    OnboardingDecision,
    Workflow,
    ScopedVault,
    ObConfiguration,
    SaturatedActor,
    Vec<ManualReview>,
);

impl OnboardingDecision {
    #[tracing::instrument("OnboardingDecision::create_decision_and_mrs", skip_all)]
    pub fn create_decision_and_mrs(
        conn: &mut TxnPgConn,
        wf: &Workflow,
        args: NewDecisionArgs,
    ) -> FpResult<(Self, ManualReviewDelta)> {
        let NewDecisionArgs {
            sv_txn,
            logic_git_hash,
            status,
            annotation_id,
            actor,
            rule_set_result_id,
            failed_for_doc_review,
            manual_reviews,
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
            seqno: sv_txn.seqno(),
            rule_set_result_id,
            failed_for_doc_review,
            created_at: Utc::now(),
            workflow_id: wf.id.clone(),
        };
        let result = diesel::insert_into(onboarding_decision::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;

        // Create UserTimeline event for the decision
        let decision_info = OnboardingDecisionInfo {
            id: result.id.clone(),
            annotation_id,
        };
        UserTimeline::create(conn, sv_txn, decision_info)?;

        // If the Workflow that is getting a new decision is associated with a business, make a timeline
        // event for the business
        // Handle situation where this workflow is a business owner completing a workflow
        let bo_info = BusinessWorkflowLink::get_business_workflow_for_user_workflow(conn, &wf.id)?;
        if let Some((_bo, biz_wf)) = bo_info {
            let sb = ScopedVault::lock(conn, &biz_wf.scoped_vault_id)?;
            let sb_txn = DataLifetime::new_sv_txn(conn, &sb)?;

            // Event is for _this_ user completing KYC
            let event = BusinessOwnerCompletedKycInfo {
                onboarding_decision_id: result.id.clone(),
            };
            // Note: we associate this event with the corresponding _business_!
            UserTimeline::create(conn, &sb_txn, event)?;
        }

        let mr_deltas = ManualReview::apply_actions(conn, wf, &result, manual_reviews)?;

        Ok((result, mr_deltas))
    }

    #[tracing::instrument("OnboardingDecision::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&OnboardingDecisionId>,
    ) -> FpResult<HashMap<OnboardingDecisionId, SaturatedOnboardingDecisionInfo>> {
        use db_schema::schema::ob_configuration;
        use db_schema::schema::workflow;
        let results: Vec<(Self, (Workflow, ObConfiguration, ScopedVault))> = onboarding_decision::table
            .inner_join(
                workflow::table
                    .inner_join(ob_configuration::table)
                    .inner_join(scoped_vault::table),
            )
            .filter(onboarding_decision::id.eq_any(ids.clone()))
            .get_results(conn)?;

        let onboarding_decisions: Vec<OnboardingDecision> =
            results.clone().into_iter().map(|r| r.0).collect();
        let onboarding_decisions_with_actors = actor::saturate_actors(conn, onboarding_decisions)?;

        let manual_reviews = manual_review::table
            .filter(manual_review::completed_by_decision_id.eq_any(ids))
            .get_results::<ManualReview>(conn)?;
        let manual_reviews = manual_reviews
            .into_iter()
            .filter_map(|mr| mr.completed_by_decision_id.clone().map(|obd_id| (obd_id, mr)))
            .into_group_map();

        let result_map = results
            .into_iter()
            .zip(onboarding_decisions_with_actors.into_iter())
            .map(|((obd, (wf, obc, sv)), (_, actor))| {
                let cleared_mrs = manual_reviews.get(&obd.id).cloned().unwrap_or_default();
                (obd, wf, sv, obc, actor, cleared_mrs)
            })
            .map(|d| (d.0.id.clone(), d))
            .collect();

        Ok(result_map)
    }

    #[tracing::instrument("OnboardingDecision::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, wf_id: &WorkflowId) -> FpResult<Option<Self>> {
        let res = onboarding_decision::table
            .filter(onboarding_decision::workflow_id.eq(wf_id))
            .filter(onboarding_decision::deactivated_at.is_null())
            .get_result(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("OnboardingDecision::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        filters: OnboardingDecisionFilters,
        pagination: OffsetPagination,
    ) -> FpResult<OffsetPaginatedResult<(Self, Workflow, Playbook)>> {
        let OnboardingDecisionFilters { made_by_footprint } = filters;
        let mut query = onboarding_decision::table
            .inner_join(workflow::table.inner_join(ob_configuration::table.inner_join(playbook::table)))
            .filter(workflow::scoped_vault_id.eq(sv_id))
            .select((
                onboarding_decision::all_columns,
                workflow::all_columns,
                playbook::all_columns,
            ))
            .order_by(onboarding_decision::created_at.desc())
            .limit(pagination.limit())
            .into_boxed();
        if let Some(offset) = pagination.offset() {
            query = query.offset(offset);
        }
        if let Some(made_by_footprint) = made_by_footprint {
            let q_made_by_fp = onboarding_decision::actor.eq(DbActor::Footprint);
            match made_by_footprint {
                true => query = query.filter(q_made_by_fp),
                false => query = query.filter(not(q_made_by_fp)),
            }
        }
        let results = query.get_results(conn)?;
        Ok(pagination.results(results))
    }
}

#[derive(Default)]
pub struct OnboardingDecisionFilters {
    pub made_by_footprint: Option<bool>,
}
