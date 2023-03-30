use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;

use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Either;
use webhooks::WebhookApp;

use crate::types::JsonApiResponse;
use crate::types::ResponseData;

use crate::State;

use paperclip::actix::{api_v2_operation, get, web};
use webhooks::PortalResponse;

#[api_v2_operation(tags(OrgSettings, Private), description = "Returns the webhook portal url.")]
#[get("/org/webhook_portal")]
async fn get(
    state: web::Data<State>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::WebhookPortalResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let is_live = auth.is_live()?;

    let PortalResponse { app_id, url, token } = state
        .webhook_service_client
        .portal_url_for_tenant(WebhookApp {
            id: auth.tenant().id.clone(),
            is_live,
        })
        .await?;
    let result = api_wire_types::WebhookPortalResponse { app_id, url, token };
    ResponseData::ok(result).json()
}
