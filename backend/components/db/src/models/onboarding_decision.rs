use crate::models::verification_request::VerificationRequest;
use crate::TxnPgConnection;
use crate::{
    schema::{onboarding_decision, onboarding_decision_verification_result_junction},
    DbResult,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DecisionStatus, OnboardingDecisionId, OnboardingDecisionInfo, OnboardingId, OnboardingStatus,
    TenantUserId, UserVaultId, VerificationResultId,
};
use serde::{Deserialize, Serialize};

use super::ob_configuration::ObConfiguration;
use super::onboarding::Onboarding;
use super::tenant_user::TenantUser;
use super::user_timeline::UserTimeline;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = onboarding_decision)]
pub struct OnboardingDecision {
    pub id: OnboardingDecisionId,
    pub onboarding_id: OnboardingId,
    pub logic_git_hash: String,
    pub tenant_user_id: Option<TenantUserId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub status: DecisionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision)]
struct NewOnboardingDecisionRow {
    onboarding_id: OnboardingId,
    logic_git_hash: String,
    tenant_user_id: Option<TenantUserId>,
    created_at: DateTime<Utc>,
    status: DecisionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision_verification_result_junction)]
pub struct OnboardingDecisionJunction {
    pub verification_result_id: VerificationResultId,
    pub onboarding_decision_id: OnboardingDecisionId,
}

#[derive(Debug)]
pub struct NewOnboardingDecision {
    pub user_vault_id: UserVaultId,
    pub onboarding_id: OnboardingId,
    pub logic_git_hash: String,
    pub tenant_user_id: Option<TenantUserId>,
    pub status: DecisionStatus,
    pub result_ids: Vec<VerificationResultId>,
}

pub type SaturatedOnboardingDecisionInfo = (
    OnboardingDecision,
    ObConfiguration,
    Vec<VerificationRequest>,
    Option<TenantUser>,
);

impl OnboardingDecision {
    pub fn visible_status(&self) -> Option<OnboardingStatus> {
        self.status.into()
    }

    pub fn create(conn: &mut TxnPgConnection, decision: NewOnboardingDecision) -> DbResult<Self> {
        // Lock Onboarding so a new decision isn't added while we deactivate the old
        Onboarding::lock(conn, &decision.onboarding_id)?;

        // Deactivate the last decision
        diesel::update(onboarding_decision::table)
            .filter(onboarding_decision::onboarding_id.eq(&decision.onboarding_id))
            .filter(onboarding_decision::deactivated_at.is_null())
            .set(onboarding_decision::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        // Create the new decision
        let new = NewOnboardingDecisionRow {
            onboarding_id: decision.onboarding_id.clone(),
            logic_git_hash: decision.logic_git_hash,
            tenant_user_id: decision.tenant_user_id,
            created_at: Utc::now(),
            status: decision.status,
        };
        let result = diesel::insert_into(onboarding_decision::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;

        // Create junction rows that join the decision to the results that created them
        let junction_rows: Vec<_> = decision
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
            },
            decision.user_vault_id,
            Some(decision.onboarding_id.clone()),
        )?;
        Ok(result)
    }

    pub fn get_bulk(
        conn: &mut PgConnection,
        ids: Vec<&OnboardingDecisionId>,
    ) -> DbResult<Vec<SaturatedOnboardingDecisionInfo>> {
        use crate::schema::{
            ob_configuration, onboarding, tenant_user, verification_request, verification_result,
        };
        let results: Vec<(Self, (Onboarding, ObConfiguration), Option<TenantUser>)> =
            onboarding_decision::table
                .inner_join(onboarding::table.inner_join(ob_configuration::table))
                .left_join(tenant_user::table)
                .filter(onboarding_decision::id.eq_any(ids))
                .get_results(conn)?;

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

        let results = results
            .into_iter()
            .map(|(ob_decision, (_, ob_config), tenant_user)| {
                (
                    ob_decision.clone(),
                    ob_config,
                    vrs.get(&ob_decision.id).unwrap_or(&vec![]).clone(),
                    tenant_user,
                )
            })
            .collect();

        Ok(results)
    }
}
