use api_core::auth::tenant::{
    AnyPartnerTenantSessionAuth,
    InvalidateAuth,
};
use api_core::types::JsonApiResponse;
use api_core::State;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    tags(Auth, Private),
    description = "Logs out the authenticated principal and invalidates the session"
)]
#[post("/partner/auth/logout")]
async fn handler(
    state: web::Data<State>,
    auth: AnyPartnerTenantSessionAuth,
) -> JsonApiResponse<api_wire_types::Empty> {
    auth.invalidate(&state).await?;
    Ok(api_wire_types::Empty)
}
