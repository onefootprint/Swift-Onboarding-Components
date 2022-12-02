use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::identity_data_request::IdentityDataRequest;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(tags(Hosted), description = "Updates data in the user vault.")]
#[actix::post("/hosted/user/data/identity")]
async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: web::Json<IdentityDataRequest>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    if request.speculative {
        // We've already parsed the request and done validation on the input. Return a successful
        // response before writing anything to the DB
        return Ok(Json(EmptyResponse::ok()));
    }

    let request = request.into_inner();
    let update = IdentityDataUpdate::try_from(request)?;
    let fingerprints = FingerprintBuilder::fingerprints(&state, update.clone()).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // TODO For now, we only allow adding an data during onboarding since we otherwise
            // don't know which scoped user to associate the data with.
            // We might one day want to support this outside of onboarding for my1fp, but without
            // the data being portable
            let ob_info = user_auth.assert_onboarding(conn)?;
            let uvw = UserVaultWrapper::lock_for_tenant(conn, &ob_info.scoped_user.id)?;
            uvw.update_identity_data(conn, update, fingerprints, ob_info.onboarding.id)?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
