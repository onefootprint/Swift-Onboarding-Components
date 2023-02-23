use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::user_vault_wrapper::checks::pre_add_data_checks;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use newtypes::fields::put_data_request::PutDataRequest;
use newtypes::IdentityDataUpdate;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Hosted),
    description = "Validates an identity data update's contents without applying it."
)]
#[actix::post("/hosted/user/data/identity/validate")]
async fn post_speculative(
    user_auth: UserAuthContext,
    request: web::Json<PutDataRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    user_auth.check_permissions(vec![UserAuthScope::SignUp])?;

    // TODO filter out email, phone number - data not stored in UvData
    IdentityDataUpdate::new(request.into_inner().into(), true)?;

    // We've already parsed the request and done validation on the input. Return a successful
    // response before writing anything to the DB
    Ok(Json(EmptyResponse::ok()))
}

#[api_v2_operation(tags(Hosted), description = "Updates data in the user vault.")]
#[actix::post("/hosted/user/data/identity")]
async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: web::Json<PutDataRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;

    let request = request.into_inner();
    let (update, _) = IdentityDataUpdate::new(request.into(), true)?;
    let fingerprints = build_fingerprints(&state, update.clone().into_inner()).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let scoped_user_id = pre_add_data_checks(&user_auth, conn)?;
            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user_id)?;
            uvw.update_identity_data(conn, update, fingerprints)?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
