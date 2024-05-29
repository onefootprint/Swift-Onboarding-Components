use crate::utils::db2api::DbToApi;
use db::models::risk_signal::RiskSignal;

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
            note: reason_code.note(),
            description: reason_code.description(),
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            reason_code,
            timestamp: created_at,
        }
    }
}

impl DbToApi<RiskSignal> for api_wire_types::PublicRiskSignal {
    fn from_db(rs: RiskSignal) -> Self {
        let RiskSignal {
            reason_code,
            created_at,
            ..
        } = rs;

        Self {
            note: reason_code.note(),
            description: reason_code.description(),
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            reason_code,
            timestamp: created_at,
        }
    }
}

impl DbToApi<(RiskSignal, bool)> for api_wire_types::RiskSignalDetail {
    fn from_db((rs, has_aml_hits): (RiskSignal, bool)) -> Self {
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
            note: reason_code.note(),
            description: reason_code.description(),
            severity: reason_code.severity(),
            scopes: reason_code.scopes(),
            reason_code,
            timestamp: created_at,
            has_aml_hits,
        }
    }
}
