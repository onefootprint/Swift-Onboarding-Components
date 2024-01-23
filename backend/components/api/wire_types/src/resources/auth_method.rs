use newtypes::AuthMethodKind;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, Apiv2Schema)]
pub struct AuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
}
