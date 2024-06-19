use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::types::ModernApiResult;
use api_core::State;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};
use webhooks::{
    PortalResponse,
    WebhookApp,
};

#[api_v2_operation(tags(OrgSettings, Private), description = "Returns the webhook portal url.")]
#[get("/org/webhook_portal")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> ModernApiResult<api_wire_types::WebhookPortalResponse> {
    let auth = auth.check_guard(TenantGuard::ManageWebhooks)?;
    let is_live = auth.is_live()?;

    let PortalResponse { app_id, url, token } = state
        .webhook_client
        .portal_url_for_tenant(WebhookApp {
            id: auth.tenant().id.clone(),
            is_live,
        })
        .await?;
    let result = api_wire_types::WebhookPortalResponse { app_id, url, token };
    Ok(result)
}
