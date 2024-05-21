use newtypes::PiiString;

#[derive(serde::Deserialize)]
pub(crate) struct AuthenticationResponse {
    #[allow(unused)]
    pub token_type: String,
    #[allow(unused)]
    pub expires_in: i32,
    pub access_token: PiiString,
    #[allow(unused)]
    pub scope: String,
}
