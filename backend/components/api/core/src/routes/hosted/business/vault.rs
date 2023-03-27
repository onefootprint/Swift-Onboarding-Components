use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::{Business, VaultWrapper};
use crate::State;
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
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    request.assert_no_id_data()?;
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let sb_id = user_auth
                .scoped_business_id()
                .ok_or(UserError::NotAllowedWithoutBusiness)?;
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
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let scoped_business_id = user_auth
                .scoped_business_id()
                .ok_or(UserError::NotAllowedWithoutBusiness)?;
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &scoped_business_id)?;

            // TODO fingerprints
            // TODO make this do something with business data
            bvw.put_business_data(conn, request)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
