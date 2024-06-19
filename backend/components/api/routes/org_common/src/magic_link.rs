use api_core::types::ModernApiResult;
use api_core::utils::magic_link::create_magic_link;
use api_core::State;
use api_wire_types::LinkAuthRequest;
use paperclip::actix::web;
use paperclip::actix::web::Json;

pub async fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
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

    Ok(api_wire_types::Empty)
}
