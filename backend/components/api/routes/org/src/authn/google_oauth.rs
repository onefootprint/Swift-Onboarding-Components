use api_core::ModernApiResult;
use api_core::State;
use api_wire_types::GoogleOauthRedirectUrl;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::web::HttpResponse;

#[api_v2_operation(
    description = "Request to authenticate via Google OAuth.",
    tags(Auth, Private)
)]
#[get("/org/auth/google_oauth")]
async fn handler(
    state: web::Data<State>,
    redirect_url: web::Query<GoogleOauthRedirectUrl>,
) -> ModernApiResult<HttpResponse> {
    api_route_org_common::google_oauth::handler(state, redirect_url).await
}
