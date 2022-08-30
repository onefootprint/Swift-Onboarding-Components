use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::types::identity_data_request::IdentityDataRequest;
use crate::types::identity_data_request::IdentityDataUpdate;
use crate::types::response::ApiResponseData;
use crate::types::EmptyResponse;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(tags(Hosted))]
#[post("/data/identity")]
/// Operates as a PATCH request to update data in the user vault
async fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: web::Json<IdentityDataRequest>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
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
            uvw.update_identity_data(conn, update, fingerprints)?;
            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
