use std::collections::HashMap;

use crate::actor::SaturatedActor;
use crate::models::verification_request::VerificationRequest;
use crate::models::workflow::Workflow;
use crate::PgConn;
use crate::TxnPgConn;
use crate::{actor, DbResult};
use chrono::{DateTime, Utc};
use db_schema::schema::manual_review;
use db_schema::schema::onboarding;
use db_schema::schema::scoped_vault;
use db_schema::schema::{onboarding_decision, onboarding_decision_verification_result_junction};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::FpId;
use newtypes::TenantId;
use newtypes::WorkflowId;
use newtypes::{
    AnnotationId, DataLifetimeSeqno, DbActor, DecisionStatus, Locked, OnboardingDecisionId,
    OnboardingDecisionInfo, OnboardingId, VaultId, VerificationResultId,
};
use serde::{Deserialize, Serialize};

use super::manual_review::ManualReview;
use super::ob_configuration::ObConfiguration;
use super::onboarding::Onboarding;
use super::user_timeline::UserTimeline;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = onboarding_decision)]
pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub onboarding_id: OnboardingId,
    pub logic_git_hash: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub status: DecisionStatus,
    pub actor: DbActor,
    // Only non-null for pass decisions made by footprint
    pub seqno: Option<DataLifetimeSeqno>,
    pub workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision)]
struct NewOnboardingDecisionRow {
    onboarding_id: OnboardingId,
    logic_git_hash: String,
    created_at: DateTime<Utc>,
    status: DecisionStatus,
    actor: DbActor,
    seqno: Option<DataLifetimeSeqno>,
    workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision_verification_result_junction)]
pub struct OnboardingDecisionJunction {
    pub verification_result_id: VerificationResultId,
    pub onboarding_decision_id: OnboardingDecisionId,
}

#[derive(Debug)]
pub struct OnboardingDecisionCreateArgs<'a> {
    pub vault_id: VaultId,
    pub onboarding: &'a Locked<Onboarding>,
    pub logic_git_hash: String,
    pub status: DecisionStatus,
    pub result_ids: Vec<VerificationResultId>,
    pub annotation_id: Option<AnnotationId>,
    pub actor: DbActor,
    pub seqno: Option<DataLifetimeSeqno>,
    pub workflow_id: WorkflowId,
}

pub type SaturatedOnboardingDecisionInfo = (
    OnboardingDecision,
    ObConfiguration,
    Vec<VerificationRequest>,
    SaturatedActor,
    Option<ManualReview>,
);

impl OnboardingDecision {
    #[tracing::instrument("OnboardingDecision::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: OnboardingDecisionCreateArgs) -> DbResult<Self> {
        // Deactivate the last decision
        diesel::update(onboarding_decision::table)
            .filter(onboarding_decision::onboarding_id.eq(&args.onboarding.id))
            .filter(onboarding_decision::deactivated_at.is_null())
            .set(onboarding_decision::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        // Create the new decision
        let new = NewOnboardingDecisionRow {
            onboarding_id: args.onboarding.id.clone(),
            logic_git_hash: args.logic_git_hash,
            created_at: Utc::now(),
            status: args.status,
            actor: args.actor,
            seqno: args.seqno,
            workflow_id: args.workflow_id,
        };
        let result = diesel::insert_into(onboarding_decision::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;

        // Create junction rows that join the decision to the results that created them
        let junction_rows: Vec<_> = args
            .result_ids
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
            annotation_id: args.annotation_id,
        };
        let su_id = args.onboarding.scoped_vault_id.clone();
        UserTimeline::create(conn, decision_info, args.vault_id, su_id)?;
        Ok(result)
    }

    #[tracing::instrument("OnboardingDecision::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&OnboardingDecisionId>,
    ) -> DbResult<HashMap<OnboardingDecisionId, SaturatedOnboardingDecisionInfo>> {
        use db_schema::schema::{ob_configuration, verification_request, verification_result, workflow};
        let results: Vec<(Self, (Workflow, ObConfiguration), Option<ManualReview>)> =
            onboarding_decision::table
                .inner_join(workflow::table.inner_join(ob_configuration::table))
                .left_join(manual_review::table)
                .filter(onboarding_decision::id.eq_any(ids))
                .get_results(conn)?;

        let onboarding_decisions: Vec<OnboardingDecision> =
            results.clone().into_iter().map(|r| r.0).collect();
        let onboarding_decisions_with_actors = actor::saturate_actors(conn, onboarding_decisions)?;

        let decision_ids: Vec<_> = results.iter().map(|(decision, _, _)| &decision.id).collect();

        // Get VRs associated with each decision
        let vrs = onboarding_decision_verification_result_junction::table
            .inner_join(verification_result::table.inner_join(verification_request::table))
            .filter(
                onboarding_decision_verification_result_junction::onboarding_decision_id.eq_any(decision_ids),
            )
            .select((
                onboarding_decision_verification_result_junction::onboarding_decision_id,
                verification_request::all_columns,
            ))
            .get_results::<(OnboardingDecisionId, VerificationRequest)>(conn)?
            .into_iter()
            .into_group_map();

        let result_map = results
            .into_iter()
            .zip(onboarding_decisions_with_actors.into_iter())
            .map(
                |((onboarding_decision, (_, onboarding_configuration), mr), (_, saturated_db_actor))| {
                    (
                        onboarding_decision.clone(),
                        onboarding_configuration,
                        vrs.get(&onboarding_decision.id).unwrap_or(&vec![]).clone(),
                        saturated_db_actor,
                        mr,
                    )
                },
            )
            .map(|d| (d.0.id.clone(), d))
            .collect();

        Ok(result_map)
    }

    #[tracing::instrument("OnboardingDecision::bulk_get_active", skip_all)]
    pub fn bulk_get_active(conn: &mut PgConn, onboarding_ids: &[OnboardingId]) -> DbResult<Vec<Self>> {
        let res = onboarding_decision::table
            .filter(onboarding_decision::onboarding_id.eq_any(onboarding_ids))
            .filter(onboarding_decision::deactivated_at.is_null())
            .get_results(conn)?;
        Ok(res)
    }

    #[tracing::instrument("OnboardingDecision::list_by_onboarding_id", skip_all)]
    pub fn list_by_onboarding_id(conn: &mut PgConn, onboarding_id: &OnboardingId) -> DbResult<Vec<Self>> {
        let result = onboarding_decision::table
            .filter(onboarding_decision::onboarding_id.eq(onboarding_id))
            .order_by(onboarding_decision::created_at.desc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("OnboardingDecision::latest_footprint_actor_decision", skip_all)]
    pub fn latest_footprint_actor_decision(
        conn: &mut PgConn,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Option<Self>> {
        let res: Option<OnboardingDecision> = onboarding_decision::table
            .filter(onboarding_decision::actor.eq(DbActor::Footprint))
            .inner_join(onboarding::table.inner_join(scoped_vault::table))
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .order_by(onboarding_decision::created_at.desc())
            .select(onboarding_decision::all_columns)
            .first(conn)
            .optional()?;
        Ok(res)
    }
}
