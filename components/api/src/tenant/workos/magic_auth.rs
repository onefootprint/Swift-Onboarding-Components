use crate::errors::ApiError;
use crate::tenant::workos::LinkAuthResponse;
use crate::types::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct LinkAuthRequest {
    email_address: String,
}

#[api_v2_operation]
#[post("/magic_auth")]
/// Request to authenticate a user email. WorkOS will send the email a link to login.
/// Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint,
/// at which point we authenticate the user
fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> actix_web::Result<Json<ApiResponseData<LinkAuthResponse>>, ApiError> {
    // extract code
    let email = &request.email_address;

    // initialize WorkOS session & send link to user via email
    let client = awc::Client::default();
    let session_id = &state
        .workos_client
        .post_session(&client, email.to_owned())
        .await?;
    let link_auth_response = &state
        .workos_client
        .post_send_link(&client, session_id.to_owned())
        .await?;

    Ok(Json(ApiResponseData {
        data: link_auth_response.to_owned(),
    }))
}
