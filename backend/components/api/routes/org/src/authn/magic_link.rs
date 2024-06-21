use api_core::types::ApiResponse;
use api_core::State;
use api_wire_types::LinkAuthRequest;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    description = "Request to authenticate a user email. WorkOS will send the email a link to \
    login. Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint, \
    at which point we authenticate the user",
    tags(Auth, Private)
)]
#[post("/org/auth/magic_link")]
async fn handler(
    state: web::Data<State>,
    request: Json<LinkAuthRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    api_route_org_common::magic_link::handler(state, request).await
}
