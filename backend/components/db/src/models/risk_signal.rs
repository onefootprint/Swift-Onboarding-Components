use crate::schema::risk_signal;
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{FootprintReasonCode, OnboardingDecisionId, RiskSignalId};
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
}
