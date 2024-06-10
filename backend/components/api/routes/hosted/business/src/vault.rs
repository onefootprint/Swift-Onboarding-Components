use crate::auth::user::UserAuthScope;
use crate::errors::ApiResult;
use crate::types::{
    EmptyResponse,
    JsonApiResponse,
};
use crate::utils::vault_wrapper::{
    Business,
    VaultWrapper,
};
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::types::ResponseData;
use api_core::utils::vault_wrapper::{
    DataLifetimeSources,
    DataRequestSource,
    FingerprintedDataRequest,
    TenantVw,
};
use newtypes::put_data_request::{
    PatchDataRequest,
    RawDataRequest,
};
use newtypes::{
    ValidateArgs,
    WorkflowGuard,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Businesses, Hosted, Vault)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: Json<RawDataRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;

    let PatchDataRequest { updates, .. } = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_bifrost(user_auth.scoped_user.is_live))?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);

    let source = user_auth.user_session.dl_source();
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let bvw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            let sources = DataLifetimeSources::single(source);
            bvw.validate_request(conn, updates, sources, None, DataRequestSource::PatchVault)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Businesses, Hosted, Vault)
)]
#[actix::patch("/hosted/business/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserWfAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;

    let PatchDataRequest { updates, .. } = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_bifrost(user_auth.scoped_user.is_live))?;
    let updates = FingerprintedDataRequest::build(&state, updates, &sb_id).await?;

    let source = user_auth.user_session.dl_source();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            let sources = DataLifetimeSources::single(source);
            bvw.patch_data(conn, updates, sources, None)?;
            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
