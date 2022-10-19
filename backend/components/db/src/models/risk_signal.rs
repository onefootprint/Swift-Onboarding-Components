use crate::schema::risk_signal;
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{FootprintReasonCode, FootprintUserId, OnboardingDecisionId, RiskSignalId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = risk_signal)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = risk_signal)]
pub struct NewRiskSignal {
    pub onboarding_decision_id: OnboardingDecisionId,
    pub reason_code: FootprintReasonCode,
    pub created_at: DateTime<Utc>,
}

impl RiskSignal {
    pub fn bulk_create(
        conn: &mut PgConnection,
        onboarding_decision_id: OnboardingDecisionId,
        reason_codes: Vec<FootprintReasonCode>,
    ) -> DbResult<Vec<Self>> {
        let new: Vec<_> = reason_codes
            .into_iter()
            .map(|reason_code| NewRiskSignal {
                onboarding_decision_id: onboarding_decision_id.clone(),
                reason_code,
                created_at: Utc::now(),
            })
            .collect();
        let result = diesel::insert_into(risk_signal::table)
            .values(new)
            .get_results::<Self>(conn)?;
        Ok(result)
    }

    pub fn list(
        conn: &mut PgConnection,
        footprint_user_id: &FootprintUserId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Vec<Self>> {
        use crate::schema::{onboarding, onboarding_decision, scoped_user};
        let results = risk_signal::table
            .inner_join(
                onboarding_decision::table.inner_join(
                    onboarding::table
                        .inner_join(scoped_user::table)
                        // Must provide explicit ON since onboarding::latest_decision_id is used by default
                        .on(onboarding_decision::onboarding_id.eq(onboarding::id)),
                ),
            )
            .filter(scoped_user::fp_user_id.eq(footprint_user_id))
            .filter(scoped_user::tenant_id.eq(tenant_id))
            .filter(scoped_user::is_live.eq(is_live))
            .select(risk_signal::all_columns)
            .load::<Self>(conn)?;
        Ok(results)
    }
}
