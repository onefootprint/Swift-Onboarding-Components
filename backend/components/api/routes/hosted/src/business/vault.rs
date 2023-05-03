use crate::auth::user::UserAuthGuard;
use crate::business::utils::send_secondary_bo_links;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::{Business, VaultWrapper};
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::errors::business::BusinessError;
use api_core::types::ResponseData;
use api_core::utils::vault_wrapper::TenantVw;
use newtypes::put_data_request::RawDataRequest;
use newtypes::ParseOptions;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Hosted, Vault, Businesses)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    user_auth: UserObAuthContext,
    request: Json<RawDataRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Business)?;
    pre_add_data_checks(&user_auth)?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sb_id = user_auth
                .scoped_business_id()
                .ok_or(BusinessError::NotAllowedWithoutBusiness)?;
            let bvw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok(bvw)
        })
        .await??;
    request.assert_allowable_identifiers(bvw.vault.kind)?;
    bvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data. Same as PATCH",
    tags(Hosted, Vault, Businesses, Deprecated)
)]
#[actix::put("/hosted/business/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = patch_inner(state, request, user_auth).await?;
    Ok(result)
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Hosted, Vault, Businesses)
)]
#[actix::patch("/hosted/business/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = patch_inner(state, request, user_auth).await?;
    Ok(result)
}

async fn patch_inner(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Business)?;
    pre_add_data_checks(&user_auth)?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    let sb_id = user_auth
        .scoped_business_id()
        .ok_or(BusinessError::NotAllowedWithoutBusiness)?;

    let request = request.build_global_fingerprints(state.as_ref()).await?;

    let (secondary_bos, sb_id) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            let (_, secondary_bos) = bvw.patch_data(conn, request)?;
            Ok((secondary_bos, sb_id))
        })
        .await?;

    let tenant = user_auth.tenant()?;
    send_secondary_bo_links(&state, tenant, sb_id, secondary_bos).await?;

    ResponseData::ok(EmptyResponse {}).json()
}
