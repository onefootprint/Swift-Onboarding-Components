use api_core::errors::ApiError;
use api_core::State;
use api_wire_types::GoogleOauthRedirectUrl;
use paperclip::actix::web::HttpResponse;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[api_v2_operation(
    description = "Request to authenticate via Google OAuth.",
    tags(Auth, Private)
)]
#[get("/org/auth/google_oauth")]
async fn handler(
    state: web::Data<State>,
    redirect_url: web::Query<GoogleOauthRedirectUrl>,
) -> actix_web::Result<HttpResponse, ApiError> {
    api_route_org_common::google_oauth::handler(state, redirect_url).await
}
