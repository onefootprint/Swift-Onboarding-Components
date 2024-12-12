use crate::State;
use api_core::auth::user::UserBizWfAuthContext;
use api_core::auth::CanDecrypt;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::VaultWrapper;
use itertools::Itertools;
use newtypes::BusinessDataKind as BDK;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Get information about the beneficial owners of this business",
    tags(Businesses, Hosted)
)]
#[actix::get("/hosted/business/owners")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserBizWfAuthContext,
) -> ApiListResponse<api_wire_types::HostedBusinessOwner> {
    let user_dis = BDK::BO_USER_DIS.to_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(user_dis))?;
    let sb_id = user_auth.sb_id().clone();
    let bvw = state
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sb_id))
        .await?;

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let results = dbos
        .into_iter()
        .map(|bo| (bo, &user_auth))
        .map(api_wire_types::HostedBusinessOwner::from_db)
        // Match the ordering as displayed on the frontend, for convenience.
        // TODO: this will most certainly change soon
        // Immutable first, then self, then by created date desc
        .sorted_by_key(|bo| (bo.is_mutable, !bo.is_authed_user, bo.created_at))
        .collect();
    Ok(results)
}
