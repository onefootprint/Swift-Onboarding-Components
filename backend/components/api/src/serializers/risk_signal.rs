use db::models::{
    risk_signal::RiskSignal, verification_request::VerificationRequest,
    verification_result::VerificationResult,
};

use crate::utils::db2api::DbToApi;

impl DbToApi<RiskSignal> for api_wire_types::RiskSignal {
    fn from_db(target: RiskSignal) -> Self {
        api_wire_types::RiskSignal::from_db((target, None))
    }
}

impl DbToApi<(RiskSignal, Option<Vec<(VerificationRequest, VerificationResult)>>)>
    for api_wire_types::RiskSignal
{
    fn from_db(target: (RiskSignal, Option<Vec<(VerificationRequest, VerificationResult)>>)) -> Self {
        let RiskSignal {
            id,
            onboarding_decision_id,
            reason_code,
            created_at,
            deactivated_at,
            vendors,
            ..
        } = target.0;

        Self {
            id,
            onboarding_decision_id,
            reason_code: reason_code.clone(),
            note: reason_code.note(),
            description: reason_code.description(),
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            timestamp: created_at,
            deactivated_at,
            vendors,
        }
    }
}
