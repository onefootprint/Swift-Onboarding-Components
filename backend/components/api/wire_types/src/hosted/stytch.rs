use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct StytchTelemetryRequest {
    pub telemetry_id: String,
}
