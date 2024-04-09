use api_core::{
    types::{EmptyResponse, JsonApiResponse},
    utils::magic_link::create_magic_link,
    State,
};
use api_wire_types::LinkAuthRequest;
use paperclip::actix::{web, web::Json};

pub async fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> JsonApiResponse<EmptyResponse> {
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

    EmptyResponse::ok().json()
}
