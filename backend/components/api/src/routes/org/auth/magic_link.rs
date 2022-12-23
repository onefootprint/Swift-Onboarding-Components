use crate::errors::ApiResult;
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
    description = "Request to authenticate a user email. WorkOS will send the email a link to \
    login. Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint, \
    at which point we authenticate the user",
    tags(Private)
)]
#[post("/org/auth/magic_link")]
fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let LinkAuthRequest {
        email_address,
        redirect_url,
    } = request.into_inner();
    // TODO infer redirect_url from host header?
    create_and_send_magic_link(&state, &email_address, &redirect_url).await?;

    Ok(Json(EmptyResponse::ok()))
}

pub(crate) async fn create_and_send_magic_link(
    state: &State,
    email: &str,
    redirect_url: &str,
) -> ApiResult<()> {
    let session = state
        .workos_client
        .passwordless()
        .create_passwordless_session(&CreatePasswordlessSessionParams {
            r#type: CreatePasswordlessSessionType::MagicLink { email },
            redirect_uri: Some(redirect_url),
            state: None,
        })
        .await?;

    let link = match &session.r#type {
        PasswordlessSessionType::MagicLink { email: _, link } => link.clone(),
    };

    crate::utils::email::send_magic_link_dashboard_auth_email(state, email.to_owned(), link).await?;
    Ok(())
}
