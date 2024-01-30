use crate::{
    auth::user::{UserAuthContext, UserAuthGuard},
    types::response::ResponseData,
};
use api_core::{
    auth::{session::user::UserSessionPurpose, user::UserAuth},
    types::JsonApiResponse,
    utils::identify::get_user_challenge_context,
    State,
};
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
    let limit_auth_methods =
        if let UserSessionPurpose::ApiUpdateAuthMethods { limit_auth_methods } = &user_auth.data.purpose {
            limit_auth_methods.clone()
        } else {
            None
        };
    let ctx = get_user_challenge_context(&state, v_id, user_auth.scoped_user_id(), Some(user_auth)).await?;
    let auth_methods = ctx
        .auth_methods
        .into_iter()
        .map(|m| {
            let can_update = limit_auth_methods.as_ref().is_none()
                || limit_auth_methods.as_ref().is_some_and(|l| l.contains(&m.kind));
            api_wire_types::AuthMethod {
                kind: m.kind,
                is_verified: m.is_verified,
                can_update,
            }
        })
        .collect();

    Ok(Json(ResponseData::ok(auth_methods)))
}
