use newtypes::AuthMethodKind;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, Apiv2Schema)]
pub struct AuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
    /// True if the user's auth token doesn't restrict updating this auth method
    pub can_update: bool,
}
