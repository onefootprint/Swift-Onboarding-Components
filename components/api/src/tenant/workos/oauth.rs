use crate::errors::ApiError;
use crate::State;
use actix_web::HttpResponse;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(tags(Private, WorkOS))]
#[get("/oauth")]
/// Request to authenticate via Google OAuth. We will have to manually add domains to our
/// service.
fn handler(state: web::Data<State>) -> actix_web::Result<HttpResponse, ApiError> {
    let provider = "GoogleOAuth";

    // Important -- disable redirects on the client, otherwise we can't return the proper
    // redirect ourselves
    let client = awc::Client::builder().disable_redirects().finish();

    let redirect_url = &state
        .workos_client
        .get_authorization_url(&client, provider.to_owned())
        .await?;

    Ok(HttpResponse::TemporaryRedirect()
        .append_header((actix_web::http::header::LOCATION, redirect_url.clone()))
        .finish())
}
