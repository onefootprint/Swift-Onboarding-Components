use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::response::ResponseData;
use api_core::auth::user::UserAuth;
use api_core::types::JsonApiResponse;
use api_core::utils::identify::get_user_challenge_context;
use api_core::State;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about the auth methods this user has registered."
)]
#[actix::get("/hosted/user/auth_methods")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<Vec<api_wire_types::AuthMethod>> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Auth)?;
    let v_id = user_auth.user_vault_id().clone();
    let ctx = get_user_challenge_context(&state, v_id, user_auth.scoped_user_id()).await?;
    let auth_methods = ctx
        .auth_methods
        .into_iter()
        .map(|m| api_wire_types::AuthMethod {
            kind: m.kind,
            is_verified: m.is_verified,
        })
        .collect();

    Ok(Json(ResponseData::ok(auth_methods)))
}
