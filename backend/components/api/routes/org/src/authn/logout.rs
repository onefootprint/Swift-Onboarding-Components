use api_core::auth::tenant::AnyTenantSessionAuth;
use api_core::auth::tenant::InvalidateAuth;
use api_core::types::ModernApiResult;
use api_core::State;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Auth, Private),
    description = "Logs out the authenticated principal and invalidates the session"
)]
#[post("/org/auth/logout")]
async fn handler(
    state: web::Data<State>,
    auth: AnyTenantSessionAuth,
) -> ModernApiResult<api_wire_types::Empty> {
    auth.invalidate(&state).await?;
    Ok(api_wire_types::Empty)
}
