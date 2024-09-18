use crate::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::ValidationError;
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
#[actix::get("/hosted/user/private_info")]
pub async fn get(state: web::Data<State>, user_auth: UserAuthContext) -> ApiResponse<PrivateUserInfo> {
    let user_auth = user_auth.check_guard(Any)?;
    // This method is only used for integration tests to be able to get an fp_id from an incomplete
    // session. NOTE: Do not remove these validations below.
    if !user_auth.tenant().is_some_and(|t| t.is_demo_tenant) {
        return ValidationError("Can only use for demo tenants").into();
    }
    if user_auth.user.is_live {
        return ValidationError("Can only use in sandbox mode").into();
    }

    let sb_id = user_auth.scoped_business_id();
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
