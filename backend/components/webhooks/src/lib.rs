use api_errors::FpResult;
use async_trait::async_trait;
use db::models::tenant::Tenant;
use db::DbPool;
use events::WebhookEvent;
use mockall::automock;
use newtypes::SvixAppId;
use newtypes::TenantId;
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
    #[tracing::instrument(skip(self, db_pool))]
    async fn get_app_id_for_tenant(
        &self,
        db_pool: &DbPool,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> FpResult<SvixAppId> {
        // First, see if the app_id is already saved to the tenant and return it if so.
        let t_id = tenant_id.clone();
        let tenant = db_pool.db_query(move |conn| Tenant::get(conn, &t_id)).await?;
        match (is_live, tenant.svix_app_id_live, tenant.svix_app_id_sandbox) {
            (true, Some(app_id), _) | (false, _, Some(app_id)) => return Ok(app_id),
            _ => {}
        };

        // Otherwise, create the svix app via svix's API. We'll make a separate app in live / sandbox
        let client = self.client();
        let name = format!("{} ({})", tenant_id, if is_live { "Live" } else { "Sandbox" });
        let uid = if is_live {
            tenant_id.to_string()
        } else {
            format!("{}_sandbox", tenant_id)
        };
        let svix_app = ApplicationIn {
            name,
            uid: Some(uid),
            ..ApplicationIn::default()
        };
        let app = client
            .application()
            .get_or_create(svix_app, None)
            .await
            .map_err(Error::from)?;

        let id = SvixAppId::from(app.id);
        let id2 = id.clone();

        // Save the new app ID to the tenant table
        let t_id = tenant_id.clone();
        db_pool
            .db_query(move |conn| Tenant::set_svix_app_id(conn, &t_id, is_live, &id2))
            .await?;
        Ok(id)
    }
}

#[async_trait]
impl WebhookClient for WebhookServiceClient {
    /// Send a webhook event to tenant if it's been configured
    #[tracing::instrument(skip_all)]
    async fn send_event_to_tenant(
        &self,
        db_pool: &DbPool,
        tenant_id: &TenantId,
        is_live: bool,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> FpResult<()> {
        let app_id = self.get_app_id_for_tenant(db_pool, tenant_id, is_live).await?;

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
    #[tracing::instrument(skip(self, db_pool))]
    async fn portal_url_for_tenant(
        &self,
        db_pool: &DbPool,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> FpResult<PortalResponse> {
        let app_id = self.get_app_id_for_tenant(db_pool, tenant_id, is_live).await?;
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
    pub app_id: SvixAppId,
    pub url: String,
    pub token: String,
}

#[automock]
#[async_trait]
pub trait WebhookClient: Send + Sync {
    async fn send_event_to_tenant(
        &self,
        db_pool: &DbPool,
        tenant_id: &TenantId,
        is_live: bool,
        event: WebhookEvent,
        idempotency_key: Option<String>,
    ) -> FpResult<()>;

    async fn portal_url_for_tenant(
        &self,
        db_pool: &DbPool,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> FpResult<PortalResponse>;
}
