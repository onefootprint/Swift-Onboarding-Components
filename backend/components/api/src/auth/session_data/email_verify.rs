use newtypes::EmailId;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifySession {
    pub email_id: EmailId,
}
