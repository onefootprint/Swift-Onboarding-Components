use newtypes::AuthMethodKind;
use paperclip::actix::Apiv2Response;

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct AuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
    /// True if the user's auth token doesn't restrict updating this auth method
    pub can_update: bool,
}
