use crate::*;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct LinkAuthRequest {
    pub email_address: String,
    pub redirect_url: String,
}
