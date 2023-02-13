#[derive(Debug, Clone, serde::Deserialize)]
pub struct JwtTokenResponse {
    pub issued_at: String,
    pub expires_in: String,
    pub token_type: String,
    pub access_token: String,
    pub refresh_token: String,
}
