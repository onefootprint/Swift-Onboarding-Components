use std::fmt::Debug;

use events::WebhookEvent;
use newtypes::{TenantId, WebhookServiceId};
use svix::api::{AppPortalAccessIn, ApplicationIn, MessageIn, PostOptions, Svix};

pub mod events;

#[derive(Clone)]
pub struct WebhookServiceClient {
    auth_token: String,
    channels: Vec<String>,
}
impl Debug for WebhookServiceClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        "<WebhookServiceClient>".fmt(f)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Svix service error")]
    ServiceError(#[from] svix::error::Error),

    #[error("Payload serialization")]
    SerdeJson(#[from] serde_json::Error),
}

impl WebhookServiceClient {
    pub fn new(auth_token: &str, channels: Vec<&str>) -> Self {
        Self {
            auth_token: auth_token.to_string(),
            channels: channels.into_iter().map(|s| s.to_string()).collect(),
        }
    }

    fn client(&self) -> Svix {
        Svix::new(self.auth_token.clone(), None)
    }

    /// Create a new webhook service for a tenant
    #[tracing::instrument(skip(self))]
    pub async fn get_or_create_for_tenant(&self, tenant_id: &TenantId) -> Result<WebhookServiceId, Error> {
        let client = self.client();

        let app = client
            .application()
            .get_or_create(
                ApplicationIn {
                    name: tenant_id.to_string(),
                    uid: Some(tenant_id.to_string()),
                    ..ApplicationIn::default()
                },
                None,
            )
            .await?;

        let id = WebhookServiceId::from(app.id);
        Ok(id)
    }

    /// Send a webhook event to tenant if it's been configured
    /// Note this spawns a task so it wont block
    #[tracing::instrument(skip(self))]
    pub fn send_event_to_tenant_non_blocking(
        &self,
        tenant_id: TenantId,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) {
        let client = self.clone();
        tokio::spawn(async move {
            // TODO: we may want to support some retry here in the future
            let _ = client
                .send_event_to_tenant(tenant_id, event, idempotency_key)
                .await
                .map_err(|err| {
                    tracing::error!(error=?err, "failed to send webhook event");
                });
        });
    }

    /// Send a webhook event to tenant if it's been configured
    pub async fn send_event_to_tenant(
        &self,
        tenant_id: TenantId,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> Result<(), Error> {
        let webhook_id = self.get_or_create_for_tenant(&tenant_id).await?;

        let client = self.client();
        client
            .message()
            .create(
                webhook_id.to_string(),
                MessageIn {
                    event_type: event.event_type(),
                    payload: serde_json::to_value(&event)?,
                    channels: Some(self.channels.clone()),
                    ..Default::default()
                },
                idempotency_key.map(|ik| PostOptions {
                    idempotency_key: Some(ik),
                }),
            )
            .await?;
        Ok(())
    }

    /// Get the portal URL to edit webhooks
    #[tracing::instrument(skip(self))]
    pub async fn portal_url_for_tenant(&self, tenant_id: &TenantId) -> Result<PortalResponse, Error> {
        let app_id = self.get_or_create_for_tenant(tenant_id).await?;
        let client = self.client();
        let out = client
            .authentication()
            .app_portal_access(
                app_id.to_string(),
                AppPortalAccessIn { feature_flags: None },
                None,
            )
            .await?;

        Ok(PortalResponse {
            app_id,
            url: out.url,
            token: out.token,
        })
    }
}

#[derive(Debug, Clone)]
pub struct PortalResponse {
    pub app_id: WebhookServiceId,
    pub url: String,
    pub token: String,
}
