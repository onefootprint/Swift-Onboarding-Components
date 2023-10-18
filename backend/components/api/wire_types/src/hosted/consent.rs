use crate::*;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct ConsentRequest {
    pub consent_language_text: String,
    pub ml_consent: Option<bool>,
}
