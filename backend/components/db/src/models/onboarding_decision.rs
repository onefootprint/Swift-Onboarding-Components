use crate::TxnPgConnection;
use crate::{
    schema::{onboarding_decision, onboarding_decision_verification_result_junction},
    DbResult,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    ComplianceStatus, OnboardingDecisionId, OnboardingDecisionInfo, OnboardingId, TenantUserId, UserVaultId,
    VerificationResultId, VerificationStatus,
};
use serde::{Deserialize, Serialize};

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
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = onboarding_decision)]
struct NewOnboardingDecisionRow {
    onboarding_id: OnboardingId,
    logic_git_hash: String,
    tenant_user_id: Option<TenantUserId>,
    verification_status: VerificationStatus,
    compliance_status: ComplianceStatus,
    created_at: DateTime<Utc>,
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
    pub verification_status: VerificationStatus,
    pub compliance_status: ComplianceStatus,
    pub result_ids: Vec<VerificationResultId>,
}

impl OnboardingDecision {
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
            verification_status: decision.verification_status,
            compliance_status: decision.compliance_status,
            created_at: Utc::now(),
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
    ) -> DbResult<Vec<(Self, Option<TenantUser>)>> {
        use crate::schema::tenant_user;
        let results = onboarding_decision::table
            .left_join(tenant_user::table)
            .filter(onboarding_decision::id.eq_any(ids))
            .get_results(conn)?;

        Ok(results)
    }
}
