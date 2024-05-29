use async_trait::async_trait;
use events::WebhookEvent;
use mockall::automock;
use newtypes::{
    TenantId,
    WebhookServiceId,
};
use std::fmt::Debug;
use svix::api::{
    AppPortalAccessIn,
    ApplicationIn,
    MessageIn,
    PostOptions,
    Svix,
};
pub mod events;

#[cfg(test)]
mod tests;

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

#[derive(Debug, Clone)]
pub struct WebhookApp {
    pub id: TenantId,
    pub is_live: bool,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Svix service error: {0:?}")]
    ServiceError(#[from] svix::error::Error),

    #[error("Payload serialization: {0:?}")]
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
    async fn get_or_create_for_tenant(&self, tenant: &WebhookApp) -> Result<WebhookServiceId, Error> {
        let client = self.client();

        let name = format!(
            "{} ({})",
            tenant.id,
            if tenant.is_live { "Live" } else { "Sandbox" }
        );

        // create separate apps for prod and live per tenant!
        let uid = if tenant.is_live {
            tenant.id.to_string()
        } else {
            format!("{}_sandbox", tenant.id)
        };

        // TODO we should save these app URLs in the tenant table - this can take 300ms
        // https://ui.honeycomb.io/footprint-2e/environments/prod/datasets/fpc-api/result/2vcWaR8FYLY/trace/HHAjiu2kirp?fields[]=s_name&fields[]=s_serviceName&span=8af9744106e2f8a2
        let app = client
            .application()
            .get_or_create(
                ApplicationIn {
                    name,
                    uid: Some(uid),
                    ..ApplicationIn::default()
                },
                None,
            )
            .await?;

        let id = WebhookServiceId::from(app.id);
        Ok(id)
    }
}

#[async_trait]
impl WebhookClient for WebhookServiceClient {
    /// Send a webhook event to tenant if it's been configured
    /// Note this spawns a task so it wont block
    /// TODO: can probably remove this
    #[tracing::instrument(skip(self))]
    fn send_event_to_tenant_non_blocking(
        &self,
        tenant: WebhookApp,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) {
        let client = self.clone();
        tokio::spawn(async move {
            // TODO: we may want to support some retry here in the future
            let _ = client
                .send_event_to_tenant(tenant, event, idempotency_key)
                .await
                .map_err(|err| {
                    tracing::error!(?err, "failed to send webhook event");
                });
        });
    }

    /// Send a webhook event to tenant if it's been configured
    #[tracing::instrument(skip_all)]
    async fn send_event_to_tenant(
        &self,
        tenant: WebhookApp,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> Result<(), Error> {
        let webhook_id = self.get_or_create_for_tenant(&tenant).await?;

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
    async fn portal_url_for_tenant(&self, tenant: WebhookApp) -> Result<PortalResponse, Error> {
        let app_id = self.get_or_create_for_tenant(&tenant).await?;
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

#[automock]
#[async_trait]
pub trait WebhookClient: Send + Sync {
    fn send_event_to_tenant_non_blocking(
        &self,
        tenant: WebhookApp,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    );

    async fn send_event_to_tenant(
        &self,
        tenant: WebhookApp,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> Result<(), Error>;

    async fn portal_url_for_tenant(&self, tenant: WebhookApp) -> Result<PortalResponse, Error>;
}
