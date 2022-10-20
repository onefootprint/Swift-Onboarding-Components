use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::identity_data_request::IdentityDataRequest;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::types::response::ResponseData;
use crate::types::EmptyResponse;
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
    let fingerprints = update.fingerprints(&state).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let mut uvw = UserVaultWrapper::lock(conn, &user_auth.user_vault_id())?;
            uvw.update_identity_data(conn, update.clone(), fingerprints)?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
