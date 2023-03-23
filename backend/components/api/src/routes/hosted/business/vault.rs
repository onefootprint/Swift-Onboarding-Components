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
    request: Json<RawDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let opts = ParseOptions {
        for_bifrost: true,
        allow_extra_field_errors: false,
    };
    let request = request.into_inner().clean_and_validate(opts)?;
    request.assert_no_id_data()?;

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
    let opts = ParseOptions {
        for_bifrost: true,
        allow_extra_field_errors: false,
    };
    let request = request.into_inner().clean_and_validate(opts)?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let scoped_business_id = user_auth
                .scoped_business_id()
                .ok_or(UserError::NotAllowedWithoutBusiness)?;
            let uvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &scoped_business_id)?;

            // TODO fingerprints
            // TODO make this do something with business data
            uvw.put_business_data(conn, request)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
