use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiResponse;
use api_core::State;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use webhooks::PortalResponse;

#[api_v2_operation(tags(OrgSettings, Private), description = "Returns the webhook portal url.")]
#[get("/org/webhook_portal")]
async fn get(
    state: web::Data<State>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::WebhookPortalResponse> {
    let auth = auth.check_guard(TenantGuard::ManageWebhooks)?;
    let is_live = auth.is_live()?;

    let PortalResponse { app_id, url, token } = state
        .webhook_client
        .portal_url_for_tenant(&auth.tenant().id.clone(), is_live)
        .await?;
    let result = api_wire_types::WebhookPortalResponse { app_id, url, token };
    Ok(result)
}
