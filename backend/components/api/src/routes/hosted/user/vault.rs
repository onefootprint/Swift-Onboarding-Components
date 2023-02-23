use crate::auth::user::{UserAuthContext, UserAuthScope};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::user_vault_wrapper::checks::pre_add_data_checks;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use newtypes::put_data_request::PutDataRequest;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Vault, PublicApi, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    request.into_inner().decompose(true)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a user vault. Can be used to update `id.` data or `custom.` data.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/hosted/user/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<PutDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    let request = request.into_inner();
    let (request, fingerprintable_data) = request.decompose(true)?;
    let fingerprints = build_fingerprints(&state, fingerprintable_data).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user_id = pre_add_data_checks(&user_auth, conn)?;
            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user_id)?;
            uvw.put_all_data(conn, request, fingerprints, true)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
