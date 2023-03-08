use std::collections::HashMap;

use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use newtypes::put_data_request::PutDataRequest;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Vault, PublicApi, Businesses)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    request.into_inner().decompose(true)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Vault, PublicApi, Businesses)
)]
#[actix::put("/hosted/business/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let request = request.into_inner().decompose(true)?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let scoped_business_id = user_auth
                .scoped_business_id()
                .ok_or(UserError::NotAllowedWithoutBusiness)?;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_business_id)?;

            // TODO fingerprints
            // TODO make this do something with business data
            uvw.put_data(conn, request, HashMap::new(), true)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
