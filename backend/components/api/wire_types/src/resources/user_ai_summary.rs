use crate::*;

#[derive(Debug, Clone, serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct UserAiSummary {
    pub high_level_summary: String,
    pub detailed_summary: String,
    pub risk_signal_summary: String,
    pub conclusion: String,
}
