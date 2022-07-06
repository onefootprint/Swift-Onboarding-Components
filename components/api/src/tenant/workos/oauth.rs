use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_web::web::Json;
use paperclip::actix::{api_v2_operation, get, web, Apiv2Schema};
use workos::sso::{ClientId, ConnectionSelector, GetAuthorizationUrl, GetAuthorizationUrlParams, Provider};

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

    let authorization_url = &state
        .workos_client
        .sso()
        .get_authorization_url(&GetAuthorizationUrlParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            redirect_uri: redirect_url,
            connection_selector: ConnectionSelector::Provider(&Provider::GoogleOauth),
            state: None,
        })?;

    Ok(Json(ApiResponseData {
        data: GoogleOauthResponse {
            redirect_url: authorization_url.to_string(),
        },
    }))
}
