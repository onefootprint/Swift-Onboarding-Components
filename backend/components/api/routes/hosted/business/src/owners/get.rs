use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::auth::CanDecrypt;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::BusinessOwnerInfo;
use api_core::utils::vault_wrapper::VaultWrapper;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Decrypt information about the business",
    tags(Businesses, Hosted)
)]
#[actix::get("/hosted/business/owners")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
) -> ApiListResponse<api_wire_types::HostedBusinessOwner> {
    let user_dis = BusinessOwnerInfo::USER_DIS.to_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(user_dis))?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    let bvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sb_id))
        .await?;

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let results = dbos
        .into_iter()
        .sorted_by_key(|bo| (bo.bo.kind, bo.bo.ownership_stake, bo.bo.link_id.clone()))
        .map(|bo| (bo, &user_auth))
        .map(api_wire_types::HostedBusinessOwner::from_db)
        .collect();
    Ok(results)
}
