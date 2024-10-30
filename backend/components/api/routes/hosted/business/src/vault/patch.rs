use crate::auth::user::UserAuthScope;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::auth::user::UserBizWfAuthContext;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::TenantVw;
use newtypes::put_data_request::ModernRawBusinessDataRequest;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Businesses, Hosted, Vault)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    user_auth: UserBizWfAuthContext,
    request: Json<ModernRawBusinessDataRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_biz_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.sb_id().clone();

    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(
        request.into_inner(),
        ValidateArgs::for_bifrost(user_auth.scoped_user.is_live),
    )?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);

    let source = user_auth.user_session.dl_source();
    state
        .db_query(move |conn| -> FpResult<_> {
            let bvw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            bvw.validate_request(conn, updates, &DataRequestSource::HostedPatchVault(source.into()))?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Businesses, Hosted, Vault)
)]
#[actix::patch("/hosted/business/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<ModernRawBusinessDataRequest>,
    user_auth: UserBizWfAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_biz_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.sb_id().clone();

    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(
        request.into_inner(),
        ValidateArgs::for_bifrost(user_auth.scoped_user.is_live),
    )?;
    let updates = FingerprintedDataRequest::build(&state, updates, &sb_id).await?;

    let source = user_auth.user_session.dl_source();
    state
        .db_transaction(move |conn| -> FpResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            bvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(source.into()))?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
