use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::business::utils::send_secondary_bo_links;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::{Business, VaultWrapper};
use crate::State;
use api_core::errors::business::BusinessError;
use api_core::types::ResponseData;
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
    user_auth: UserAuthContext,
    request: Json<RawDataRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Business)?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    request.assert_no_id_data()?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let sb_id = user_auth
                .scoped_business_id()
                .ok_or(BusinessError::NotAllowedWithoutBusiness)?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok(bvw)
        })
        .await??;
    bvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Hosted, Vault, Businesses)
)]
#[actix::put("/hosted/business/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Business)?;
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
            pre_add_data_checks(&user_auth, conn)?;
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            let secondary_bos = bvw.put_business_data(conn, request)?;
            Ok((secondary_bos, sb_id))
        })
        .await?;

    send_secondary_bo_links(&state, sb_id, secondary_bos).await?;

    ResponseData::ok(EmptyResponse {}).json()
}
