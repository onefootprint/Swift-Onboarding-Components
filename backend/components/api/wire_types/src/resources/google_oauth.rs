use crate::*;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct GoogleOauthRedirectUrl {
    pub redirect_url: String,
}
