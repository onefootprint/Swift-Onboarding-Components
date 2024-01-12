use crate::types::response::ResponseData;
use crate::utils::magic_link::create_magic_link;
use crate::State;
use crate::{errors::ApiError, types::EmptyResponse};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct LinkAuthRequest {
    email_address: String,
    redirect_url: String,
}

#[api_v2_operation(
    description = "Request to authenticate a user email. WorkOS will send the email a link to \
    login. Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint, \
    at which point we authenticate the user",
    tags(Auth, Private)
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
    let link = create_magic_link(&state, &email_address, &redirect_url, false).await?;
    state
        .sendgrid_client
        .send_magic_link_email(&state, email_address, link)
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
