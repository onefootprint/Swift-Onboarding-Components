use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct FingerprintVisitRequest {
    pub visitor_id: String,
    pub request_id: String,
    pub path: String,
}
