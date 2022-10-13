use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::webauthn_credential::WebauthnCredential;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type LivenessResponse = Vec<api_wire_types::LivenessEvent>;

#[api_v2_operation(
    summary = "/hosted/user/liveness",
    operation_id = "hosted-user-liveness",
    tags(Hosted),
    description = "Allows a user to view their registered webauthn credentials"
)]
#[get("/liveness")]
fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<LivenessResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &user_auth.user_vault_id()))
        .await??;

    let response = creds
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
