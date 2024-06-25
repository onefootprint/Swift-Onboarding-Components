use crate::*;
use newtypes::SvixAppId;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct WebhookPortalResponse {
    pub app_id: SvixAppId,
    pub url: String,
    pub token: String,
}
