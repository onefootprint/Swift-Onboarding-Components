use crate::types::response::ResponseData;
use crate::State;
use crate::{errors::ApiError, types::EmptyResponse};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use workos::passwordless::{
    CreatePasswordlessSession, CreatePasswordlessSessionParams, CreatePasswordlessSessionType,
    PasswordlessSessionType,
};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct LinkAuthRequest {
    email_address: String,
    redirect_url: String,
}

#[api_v2_operation(
    summary = "/org/auth/magic_link",
    operation_id = "org-auth-magic_link",
    description = "Request to authenticate a user email. WorkOS will send the email a link to \
    login. Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint, \
    at which point we authenticate the user",
    tags(Private)
)]
#[post("/magic_link")]
fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let email = &request.email_address;

    let session = &state
        .workos_client
        .passwordless()
        .create_passwordless_session(&CreatePasswordlessSessionParams {
            r#type: CreatePasswordlessSessionType::MagicLink { email },
            redirect_uri: Some(&request.redirect_url),
            state: None,
        })
        .await?;

    let link = match &session.r#type {
        PasswordlessSessionType::MagicLink { email: _, link } => link.clone(),
    };

    crate::utils::email::send_magic_link_dashboard_auth_email(&state, email.to_owned(), link).await?;

    Ok(Json(EmptyResponse::ok()))
}
