use crate::{
    errors::{workos::WorkOsError, ApiError},
    State,
};
use actix_web::HttpResponseBuilder;
use paperclip::actix::{api_v2_operation, get, web, web::HttpResponse, Apiv2Schema};
use reqwest::redirect;
use workos::sso::{ClientId, ConnectionSelector, GetAuthorizationUrl, GetAuthorizationUrlParams, Provider};

#[derive(serde::Serialize, Apiv2Schema)]
struct GoogleOauthResponse {
    redirect_url: String,
}

#[derive(serde::Deserialize, Apiv2Schema)]
struct RedirectUrl {
    redirect_url: String,
}

#[api_v2_operation(
    description = "Request to authenticate via Google OAuth.",
    tags(Auth, Private)
)]
#[get("/org/auth/google_oauth")]
async fn handler(
    state: web::Data<State>,
    redirect_url: web::Query<RedirectUrl>,
) -> actix_web::Result<HttpResponse, ApiError> {
    let redirect_url = &redirect_url.redirect_url;

    let authorization_url = &state
        .workos_client
        .sso()
        .get_authorization_url(&GetAuthorizationUrlParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            redirect_uri: redirect_url,
            connection_selector: ConnectionSelector::Provider(&Provider::GoogleOauth),
            state: None,
        })
        .map_err(WorkOsError::from)?;

    // get the redirect from workos
    let client = reqwest::ClientBuilder::new()
        .redirect(redirect::Policy::none())
        .build()?;

    let response = client.get(authorization_url.to_string()).send().await?;

    // forward the response back to the client
    let mut builder = HttpResponseBuilder::new(response.status());
    for header in response.headers() {
        builder.insert_header(header);
    }
    let response = builder.body(response.bytes().await?);
    Ok(response)
}
