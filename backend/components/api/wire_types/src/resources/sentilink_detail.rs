use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct SentilinkDetail {
    pub synthetic: Option<SentilinkScoreDetail>,
    pub id_theft: Option<SentilinkScoreDetail>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct SentilinkScoreDetail {
    pub score: i32,
    pub reason_codes: Vec<SentilinkReasonCode>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct SentilinkReasonCode {
    // A code indicating the reason.
    pub code: String,
    // The rank of reason codes by importance. The top three reason codes are surfaced.
    pub rank: i32,
    // A string indicating the direction of the reason code. Potential values include: "less_fraudy" and
    // "more_fraudy."
    pub direction: String,
    // A written explanation of the reason code. String length will not exceed 255 characters.
    pub explanation: String,
}
