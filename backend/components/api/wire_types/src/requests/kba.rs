use newtypes::SessionAuthToken;
use paperclip::actix::Apiv2Schema;

#[derive(serde::Serialize, Apiv2Schema)]
pub struct KbaResponse {
    pub token: SessionAuthToken,
}
