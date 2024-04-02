use crate::{
    auth::user::{UserAuth, UserAuthContext, UserAuthScope},
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::types::JsonApiResponse;
use db::models::scoped_vault::ScopedVault;
use paperclip::actix::{self, api_v2_operation, web};

type AuthorizedOrgsResponse = Vec<api_wire_types::AuthorizedOrg>;

#[api_v2_operation(
    tags(My1fp, Hosted),
    description = "Returns a list of organizations onto which the user has onboarded"
)]
#[actix::get("/hosted/user/authorized_orgs")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<AuthorizedOrgsResponse> {
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
    ResponseData::ok(results).json()
}
