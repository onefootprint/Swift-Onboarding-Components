use newtypes::SkipLivenessContext;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;

#[derive(Default, Deserialize, Apiv2Schema)]
pub struct SkipPasskeyRegisterRequest {
    pub context: Option<SkipLivenessContext>,
}
