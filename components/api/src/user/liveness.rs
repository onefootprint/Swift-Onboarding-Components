use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::types::liveness::ApiLiveness;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use db::models::webauthn_credential::WebauthnCredential;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type LivenessResponse = Vec<ApiLiveness>;

#[api_v2_operation(tags(User))]
#[get("/liveness")]
/// Allows a user to view their registered webauthn credentials
fn get(
    state: web::Data<State>,
    auth: SessionContext<My1fpBasicSession>,
) -> actix_web::Result<Json<ApiResponseData<LivenessResponse>>, ApiError> {
    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &auth.user_vault_id()))
        .await??;

    let response = creds.into_iter().map(ApiLiveness::from).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
