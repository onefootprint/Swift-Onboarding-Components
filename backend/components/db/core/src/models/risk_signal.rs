use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::risk_signal;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::{FootprintReasonCode, FpId, OnboardingDecisionId, RiskSignalId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = risk_signal)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>, // Currently unused!
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub verification_result_id: Option<VerificationResultId>,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = risk_signal)]
pub struct NewRiskSignal {
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub verification_result_id: Option<VerificationResultId>,
    pub hidden: bool,
    pub vendor_api: VendorAPI,
}

impl RiskSignal {
    #[tracing::instrument("RiskSignal::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        onboarding_decision_id: OnboardingDecisionId,
        signals: Vec<(FootprintReasonCode, VendorAPI)>,
    ) -> DbResult<Vec<Self>> {
        let new: Vec<_> = signals
            .into_iter()
            .map(|(reason_code, vendor_api)| NewRiskSignal {
                onboarding_decision_id: Some(onboarding_decision_id.clone()),
                reason_code,
                created_at: Utc::now(),
                verification_result_id: None,
                hidden: false,
                vendor_api,
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
            .select(onboarding_decision::id.nullable());
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
    ) -> DbResult<Self> {
        let signal = Self::query(fp_id, tenant_id, is_live)
            .filter(risk_signal::id.eq(id))
            .get_result::<Self>(conn)?;
        Ok(signal)
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
