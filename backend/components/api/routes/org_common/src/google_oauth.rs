use actix_web::HttpResponseBuilder;
use api_core::errors::workos::WorkOsError;
use api_core::errors::ApiError;
use api_core::State;
use api_wire_types::GoogleOauthRedirectUrl;
use paperclip::actix::web;
use paperclip::actix::web::HttpResponse;
use reqwest::redirect;
use workos::sso::{
    ClientId,
    ConnectionSelector,
    GetAuthorizationUrl,
    GetAuthorizationUrlParams,
    Provider,
};

pub async fn handler(
    state: web::Data<State>,
    redirect_url: web::Query<GoogleOauthRedirectUrl>,
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
