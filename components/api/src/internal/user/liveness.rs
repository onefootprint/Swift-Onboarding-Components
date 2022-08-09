use crate::auth::session_data::user::UserAuthScope;
use crate::auth::{UserAuth, VerifiedUserAuth};
use crate::errors::ApiError;
use crate::types::liveness::ApiLiveness;
use crate::types::response::ApiResponseData;
use crate::State;
use db::models::webauthn_credential::WebauthnCredential;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type LivenessResponse = Vec<ApiLiveness>;

#[api_v2_operation(tags(User))]
#[get("/liveness")]
/// Allows a user to view their registered webauthn credentials
fn get(
    state: web::Data<State>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ApiResponseData<LivenessResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &user_auth.user_vault_id()))
        .await??;

    let response = creds.into_iter().map(ApiLiveness::from).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
