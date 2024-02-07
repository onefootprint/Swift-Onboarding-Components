use crate::*;
use newtypes::WebhookServiceId;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct WebhookPortalResponse {
    pub app_id: WebhookServiceId,
    pub url: String,
    pub token: String,
}
