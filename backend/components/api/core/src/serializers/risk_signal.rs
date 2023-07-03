use db::models::risk_signal::RiskSignal;

use crate::utils::db2api::DbToApi;

impl DbToApi<RiskSignal> for api_wire_types::RiskSignal {
    fn from_db(rs: RiskSignal) -> Self {
        let RiskSignal {
            id,
            onboarding_decision_id,
            reason_code,
            created_at,
            ..
        } = rs;

        Self {
            id,
            onboarding_decision_id,
            reason_code: reason_code.clone(),
            note: reason_code.note(),
            description: reason_code.description(),
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            timestamp: created_at,
        }
    }
}
