use serde::Serialize;

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum TwilioLookupField {
    CallerName,
    SimSwap,
    CallForwarding,
    LiveActivity,
    LineTypeIntelligence,
}
