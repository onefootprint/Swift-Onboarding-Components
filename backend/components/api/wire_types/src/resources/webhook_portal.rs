use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct WebhookPortalResponse {
    pub app_id: WebhookServiceId,
    pub url: String,
    pub token: String,
}

export_schema!(WebhookPortalResponse);
