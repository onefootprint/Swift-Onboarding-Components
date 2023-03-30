use db::models::scoped_vault::ScopedVault;
use webhooks::WebhookApp;

/// Translates the object into an identifiable WebhookApp
pub trait IntoWebhookApp {
    fn webhook_app(&self) -> WebhookApp;
}

impl IntoWebhookApp for ScopedVault {
    fn webhook_app(&self) -> WebhookApp {
        WebhookApp {
            id: self.tenant_id.clone(),
            is_live: self.is_live,
        }
    }
}
