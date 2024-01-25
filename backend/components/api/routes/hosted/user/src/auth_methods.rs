use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::response::ResponseData;
use api_core::auth::session::user::UserSessionPurpose;
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
    let limit_auth_methods = if let Some(UserSessionPurpose::ApiUpdateAuthMethods { limit_auth_methods }) =
        &user_auth.data.purpose
    {
        limit_auth_methods.as_ref()
    } else {
        None
    };
    let auth_methods = ctx
        .auth_methods
        .into_iter()
        .map(|m| {
            let can_update =
                limit_auth_methods.is_none() || limit_auth_methods.is_some_and(|l| l.contains(&m.kind));
            api_wire_types::AuthMethod {
                kind: m.kind,
                is_verified: m.is_verified,
                can_update,
            }
        })
        .collect();

    Ok(Json(ResponseData::ok(auth_methods)))
}
