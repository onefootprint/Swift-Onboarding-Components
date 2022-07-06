use crate::types::success::ApiResponseData;
use crate::State;
use crate::{errors::ApiError, types::Empty};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use workos::passwordless::{
    CreatePasswordlessSession, CreatePasswordlessSessionParams, CreatePasswordlessSessionType,
    SendPasswordlessSession, SendPasswordlessSessionParams,
};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct LinkAuthRequest {
    email_address: String,
}

#[api_v2_operation(tags(Private, WorkOS))]
#[post("/magic_link")]
/// Request to authenticate a user email. WorkOS will send the email a link to login.
/// Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint,
/// at which point we authenticate the user
fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    // extract code
    let email = &request.email_address;

    // initialize WorkOS session & send link to user via email
    let passwordless_session = &state
        .workos_client
        .passwordless()
        .create_passwordless_session(&CreatePasswordlessSessionParams {
            r#type: CreatePasswordlessSessionType::MagicLink { email },
            redirect_uri: None,
            state: None,
        })
        .await?;
    state
        .workos_client
        .passwordless()
        .send_passwordless_session(&SendPasswordlessSessionParams {
            id: &passwordless_session.id,
        })
        .await?;
    Ok(Json(ApiResponseData { data: Empty }))
}
