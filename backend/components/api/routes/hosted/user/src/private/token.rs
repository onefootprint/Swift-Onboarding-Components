use crate::auth::user::ItUserAuthContext;
use api_core::web;
use api_core::ApiResponse;
use api_core::State;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use newtypes::VaultId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};

#[derive(serde::Serialize, Apiv2Schema, macros::JsonResponder)]
pub struct PrivateUserInfo {
    fp_id: Option<FpId>,
    fp_bid: Option<FpId>,
    vault_id: VaultId,
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about the auth token. Can only be used in sandbox mode for demo tenants."
)]
#[actix::get("/hosted/user/private/token")]
pub async fn get(state: web::Data<State>, user_auth: ItUserAuthContext) -> ApiResponse<PrivateUserInfo> {
    let user_auth = user_auth.into_inner();
    let sb_id = user_auth.data.scoped_business_id();
    let sb = state
        .db_pool
        .db_query(move |conn| sb_id.map(|sb_id| ScopedVault::get(conn, &sb_id)).transpose())
        .await?;

    let result = PrivateUserInfo {
        fp_id: user_auth.scoped_user().map(|sv| sv.fp_id.clone()),
        fp_bid: sb.map(|sb| sb.fp_id),
        vault_id: user_auth.user_vault_id.clone(),
    };
    Ok(result)
}
