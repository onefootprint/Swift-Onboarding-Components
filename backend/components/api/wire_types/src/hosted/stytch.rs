use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema, JsonSchema)]
pub struct StytchTelemetryRequest {
    pub telemetry_id: String,
}

export_schema!(StytchTelemetryRequest);
