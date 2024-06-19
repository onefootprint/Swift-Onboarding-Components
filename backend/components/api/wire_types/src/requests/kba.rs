use newtypes::SessionAuthToken;
use paperclip::actix::Apiv2Response;

#[derive(serde::Serialize, Apiv2Response, macros::JsonResponder)]
pub struct KbaResponse {
    pub token: SessionAuthToken,
}
