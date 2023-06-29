use crate::models::verification_request::VerificationRequest;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::risk_signal;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{FootprintReasonCode, FpId, OnboardingDecisionId, RiskSignalId, TenantId, Vendor};
use serde::{Deserialize, Serialize};

use super::verification_result::VerificationResult;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = risk_signal)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>, // Currently unused!
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub vendors: Vec<Vendor>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = risk_signal)]
pub struct NewRiskSignal {
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub vendors: Vec<Vendor>,
    pub created_at: DateTime<Utc>,
}

impl RiskSignal {
    #[tracing::instrument("RiskSignal::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        onboarding_decision_id: OnboardingDecisionId,
        signals: Vec<(FootprintReasonCode, Vec<Vendor>)>,
    ) -> DbResult<Vec<Self>> {
        let new: Vec<_> = signals
            .into_iter()
            .map(|(reason_code, vendors)| NewRiskSignal {
                onboarding_decision_id: onboarding_decision_id.clone(),
                reason_code,
                vendors,
                created_at: Utc::now(),
            })
            .collect();
        let result = diesel::insert_into(risk_signal::table)
            .values(new)
            .get_results::<Self>(conn)?;
        Ok(result)
    }

    fn query<'a>(
        fp_id: &'a FpId,
        tenant_id: &'a TenantId,
        is_live: bool,
    ) -> risk_signal::BoxedQuery<'a, diesel::pg::Pg> {
        use db_schema::schema::{onboarding, onboarding_decision, scoped_vault};
        let onboarding_decision_ids = onboarding_decision::table
            .inner_join(
                onboarding::table
                    .inner_join(scoped_vault::table)
                    // Must provide explicit ON since onboarding::latest_decision_id is used by default
                    .on(onboarding_decision::onboarding_id.eq(onboarding::id)),
            )
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .select(onboarding_decision::id);
        risk_signal::table
            .filter(risk_signal::onboarding_decision_id.eq_any(onboarding_decision_ids))
            .into_boxed()
    }

    #[tracing::instrument("RiskSignal::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        id: &RiskSignalId,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<(Self, Vec<(VerificationRequest, VerificationResult)>)> {
        use db_schema::schema::{
            onboarding_decision_verification_result_junction, verification_request, verification_result,
        };
        let signal = Self::query(fp_id, tenant_id, is_live)
            .filter(risk_signal::id.eq(id))
            .get_result::<Self>(conn)?;

        // Fetch related verification results. We look at the VerificationResults tied to the same decision
        let vr_ids = onboarding_decision_verification_result_junction::table
            .filter(
                onboarding_decision_verification_result_junction::onboarding_decision_id
                    .eq(&signal.onboarding_decision_id),
            )
            .select(onboarding_decision_verification_result_junction::verification_result_id);
        let vrs = verification_request::table
            .inner_join(verification_result::table)
            .filter(verification_result::id.eq_any(vr_ids))
            // don't include Vres that are errors
            .filter(verification_result::is_error.eq(false))
            .filter(verification_request::vendor.eq_any(&signal.vendors))
            .get_results(conn)?;
        Ok((signal, vrs))
    }

    #[tracing::instrument("RiskSignal::list_by_onboarding_decision_id", skip_all)]
    pub fn list_by_onboarding_decision_id(
        conn: &mut PgConn,
        onboarding_decision_id: &OnboardingDecisionId,
    ) -> DbResult<Vec<Self>> {
        let results = risk_signal::table
            .filter(risk_signal::onboarding_decision_id.eq(onboarding_decision_id))
            .get_results(conn)?;
        Ok(results)
    }
}
