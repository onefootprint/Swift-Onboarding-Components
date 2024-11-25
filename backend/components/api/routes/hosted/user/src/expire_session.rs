use api_core::auth::tenant::InvalidateAuth;
use api_core::auth::user::UserAuthContext;
use api_core::web;
use api_core::ApiResponse;
use api_core::State;
use paperclip::actix;
use paperclip::actix::api_v2_operation;

#[api_v2_operation(
    tags(User, Hosted),
    description = "Expires the session defined by `x-fp-authorization`"
)]
#[actix::post("/hosted/user/expire_session")]
async fn post(state: web::Data<State>, auth: UserAuthContext) -> ApiResponse<api_wire_types::Empty> {
    auth.invalidate(&state).await?;
    Ok(api_wire_types::Empty)
}
