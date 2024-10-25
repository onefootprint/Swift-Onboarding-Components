use crate::auth::user::ItUserAuthContext;
use api_core::web;
use api_core::ApiResponse;
use api_core::State;
use db::models::scoped_vault::ScopedVault;
use newtypes::FpId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WorkflowId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};

#[derive(serde::Serialize, Apiv2Schema, macros::JsonResponder)]
pub struct PrivateUserInfo {
    fp_id: Option<FpId>,
    su_id: Option<ScopedVaultId>,
    wf_id: Option<WorkflowId>,
    fp_bid: Option<FpId>,
    sb_id: Option<ScopedVaultId>,
    biz_wf_id: Option<WorkflowId>,
    vault_id: VaultId,
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about the auth token. Can only be used in sandbox mode for demo tenants."
)]
#[actix::get("/hosted/user/private/token")]
pub async fn get(state: web::Data<State>, user_auth: ItUserAuthContext) -> ApiResponse<PrivateUserInfo> {
    let user_auth = user_auth.into_inner();
    let sb_id = user_auth.data.sb_id.clone();
    let sb = state
        .db_query(move |conn| sb_id.map(|sb_id| ScopedVault::get(conn, &sb_id)).transpose())
        .await?;

    let result = PrivateUserInfo {
        fp_id: user_auth.scoped_user.as_ref().map(|sv| sv.fp_id.clone()),
        su_id: user_auth.scoped_user.as_ref().map(|sv| sv.id.clone()),
        wf_id: user_auth.wf_id.clone(),
        fp_bid: sb.as_ref().map(|sb| sb.fp_id.clone()),
        sb_id: sb.map(|sb| sb.id),
        biz_wf_id: user_auth.biz_wf_id.clone(),
        vault_id: user_auth.user.id.clone(),
    };
    Ok(result)
}
