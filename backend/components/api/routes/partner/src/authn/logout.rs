use api_core::auth::tenant::{
    AnyPartnerTenantSessionAuth,
    InvalidateAuth,
};
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
};
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
) -> JsonApiResponse<EmptyResponse> {
    auth.invalidate(&state).await?;
    EmptyResponse::ok().json()
}
