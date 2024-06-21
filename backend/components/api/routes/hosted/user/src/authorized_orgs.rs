use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::types::ApiListResponse;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(My1fp, Hosted),
    description = "Returns a list of organizations onto which the user has onboarded"
)]
#[actix::get("/hosted/user/authorized_orgs")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> ApiListResponse<api_wire_types::AuthorizedOrg> {
    let user_auth = user_auth.check_guard(UserAuthScope::BasicProfile)?;

    // TODO this could return duplicate tenants if the user onboarded onto multiple OBCs
    let obs = state
        .db_pool
        .db_query(move |conn| ScopedVault::list_authorized(conn, user_auth.user_vault_id()))
        .await?;
    let results = obs
        .into_iter()
        .map(api_wire_types::AuthorizedOrg::from_db)
        .collect();
    Ok(results)
}
