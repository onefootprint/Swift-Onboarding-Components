use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_web::web::Json;
use paperclip::actix::{api_v2_operation, get, web, Apiv2Schema};

#[derive(serde::Serialize, Apiv2Schema)]
struct GoogleOauthResponse {
    redirect_url: String,
}

#[derive(serde::Deserialize, Apiv2Schema)]
struct RedirectUrl {
    redirect_url: String,
}

#[api_v2_operation(tags(Private, WorkOS))]
#[get("/google_oauth")]
/// Request to authenticate via Google OAuth. We will have to manually add domains to our
/// service.
fn handler(
    state: web::Data<State>,
    redirect_url: web::Query<RedirectUrl>,
) -> actix_web::Result<Json<ApiResponseData<GoogleOauthResponse>>, ApiError> {
    let redirect_url = &redirect_url.redirect_url;

    let provider = "GoogleOAuth";

    // Important -- disable redirects on the client, otherwise we can't return the proper
    // redirect ourselves
    let client = awc::Client::builder().disable_redirects().finish();

    let redirect_url = &state
        .workos_client
        .get_authorization_url(&client, provider.to_owned(), redirect_url.to_owned())
        .await?;

    Ok(Json(ApiResponseData {
        data: GoogleOauthResponse {
            redirect_url: redirect_url.to_owned(),
        },
    }))
}
