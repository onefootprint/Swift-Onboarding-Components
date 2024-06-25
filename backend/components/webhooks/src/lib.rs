use api_errors::FpResult;
use async_trait::async_trait;
use events::WebhookEvent;
use mockall::automock;
use newtypes::TenantId;
use newtypes::WebhookServiceId;
use std::fmt::Debug;
use svix::api::AppPortalAccessIn;
use svix::api::ApplicationIn;
use svix::api::MessageIn;
use svix::api::PostOptions;
use svix::api::Svix;

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

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Svix service error: {0:?}")]
    ServiceError(#[from] svix::error::Error),
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
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
    async fn get_app_id_for_tenant(&self, tenant_id: &TenantId, is_live: bool) -> FpResult<WebhookServiceId> {
        let client = self.client();

        let name = format!("{} ({})", tenant_id, if is_live { "Live" } else { "Sandbox" });

        // create separate apps for prod and live per tenant!
        let uid = if is_live {
            tenant_id.to_string()
        } else {
            format!("{}_sandbox", tenant_id)
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
            .await
            .map_err(Error::from)?;

        let id = WebhookServiceId::from(app.id);
        Ok(id)
    }
}

#[async_trait]
impl WebhookClient for WebhookServiceClient {
    /// Send a webhook event to tenant if it's been configured
    #[tracing::instrument(skip_all)]
    async fn send_event_to_tenant(
        &self,
        tenant_id: &TenantId,
        is_live: bool,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> FpResult<()> {
        let app_id = self.get_app_id_for_tenant(tenant_id, is_live).await?;

        let client = self.client();
        client
            .message()
            .create(
                app_id.to_string(),
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
            .await
            .map_err(Error::from)?;
        Ok(())
    }

    /// Get the portal URL to edit webhooks
    #[tracing::instrument(skip(self))]
    async fn portal_url_for_tenant(&self, tenant_id: &TenantId, is_live: bool) -> FpResult<PortalResponse> {
        let app_id = self.get_app_id_for_tenant(tenant_id, is_live).await?;
        let client = self.client();
        let out = client
            .authentication()
            .app_portal_access(
                app_id.to_string(),
                AppPortalAccessIn { feature_flags: None },
                None,
            )
            .await
            .map_err(Error::from)?;

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
    async fn send_event_to_tenant(
        &self,
        tenant_id: &TenantId,
        is_live: bool,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> FpResult<()>;

    async fn portal_url_for_tenant(&self, tenant_id: &TenantId, is_live: bool) -> FpResult<PortalResponse>;
}
