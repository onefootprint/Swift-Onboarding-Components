use std::collections::HashMap;

use crate::actor::SaturatedActor;
use crate::models::verification_request::VerificationRequest;
use crate::TxnPgConnection;
use crate::PgConnection;
use crate::{
    actor,
    schema::{onboarding_decision, onboarding_decision_verification_result_junction},
    DbResult,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    AnnotationId, DataLifetimeSeqno, DbActor, DecisionStatus, Locked, OnboardingDecisionId,
    OnboardingDecisionInfo, OnboardingId, OnboardingStatus, UserVaultId, VerificationResultId,
};
use serde::{Deserialize, Serialize};

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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision_verification_result_junction)]
pub struct OnboardingDecisionJunction {
    pub verification_result_id: VerificationResultId,
    pub onboarding_decision_id: OnboardingDecisionId,
}

#[derive(Debug)]
pub struct OnboardingDecisionCreateArgs<'a> {
    pub user_vault_id: UserVaultId,
    pub onboarding: &'a Locked<Onboarding>,
    pub logic_git_hash: String,
    pub status: DecisionStatus,
    pub result_ids: Vec<VerificationResultId>,
    pub annotation_id: Option<AnnotationId>,
    pub actor: DbActor,
    pub seqno: Option<DataLifetimeSeqno>,
}

pub type SaturatedOnboardingDecisionInfo = (
    OnboardingDecision,
    ObConfiguration,
    Vec<VerificationRequest>,
    SaturatedActor,
);

impl OnboardingDecision {
    pub fn visible_status(&self) -> Option<OnboardingStatus> {
        self.status.into()
    }

    pub fn create(conn: &mut TxnPgConnection, args: OnboardingDecisionCreateArgs) -> DbResult<Self> {
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
        UserTimeline::create(
            conn,
            OnboardingDecisionInfo {
                id: result.id.clone(),
                annotation_id: args.annotation_id,
            },
            args.user_vault_id,
            Some(args.onboarding.scoped_user_id.clone()),
        )?;
        Ok(result)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&OnboardingDecisionId>,
    ) -> DbResult<HashMap<OnboardingDecisionId, SaturatedOnboardingDecisionInfo>> {
        use crate::schema::{ob_configuration, onboarding, verification_request, verification_result};
        let results: Vec<(Self, (Onboarding, ObConfiguration))> = onboarding_decision::table
            .inner_join(onboarding::table.inner_join(ob_configuration::table))
            .filter(onboarding_decision::id.eq_any(ids))
            .get_results(conn)?;

        let onboarding_decisions: Vec<OnboardingDecision> =
            results.clone().into_iter().map(|r| r.0).collect();
        let onboarding_decisions_with_actors = actor::saturate_actors(conn, onboarding_decisions)?;

        let decision_ids: Vec<_> = results.iter().map(|(decision, _)| &decision.id).collect();

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
                |((onboarding_decision, (_, onboarding_configuration)), (_, saturated_db_actor))| {
                    (
                        onboarding_decision.clone(),
                        onboarding_configuration,
                        vrs.get(&onboarding_decision.id).unwrap_or(&vec![]).clone(),
                        saturated_db_actor,
                    )
                },
            )
            .map(|d| (d.0.id.clone(), d))
            .collect();

        Ok(result_map)
    }
}
