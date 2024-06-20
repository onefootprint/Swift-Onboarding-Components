use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::IsGuardMet;
use api_core::types::JsonApiListResponse;
use api_core::utils::identify::get_user_challenge_context;
use api_core::State;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about the auth methods this user has registered."
)]
#[actix::get("/hosted/user/auth_methods")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiListResponse<api_wire_types::AuthMethod> {
    let user_auth = user_auth.check_guard(UserAuthScope::Auth.or(UserAuthScope::SignUp))?;
    let limit_auth_methods = user_auth
        .data
        .purposes
        .iter()
        .filter_map(|p| match p {
            TokenCreationPurpose::ApiUpdateAuthMethods { limit_auth_methods } => limit_auth_methods.clone(),
            _ => None,
        })
        .reduce(|a, b| a.into_iter().filter(|i| b.contains(i)).collect_vec());

    let ctx = get_user_challenge_context(&state, user_auth.user_identifier(), Some(user_auth)).await?;
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

    Ok(auth_methods)
}
