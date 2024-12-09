use crate::*;


#[derive(serde::Deserialize, Apiv2Schema)]
pub struct SamlSsoRequest {
    pub email_address: String,
    pub redirect_url: String,
}


#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct SamlSsoResponse {
    pub saml_sso_url: Option<String>,
}
