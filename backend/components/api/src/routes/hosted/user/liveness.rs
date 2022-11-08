use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use db::models::liveness_event::LivenessEvent;

use paperclip::actix::{self, api_v2_operation, web, web::Json};

type LivenessResponse = Vec<api_wire_types::LivenessEvent>;

#[api_v2_operation(
    tags(Hosted),
    description = "Allows a user to view their registered webauthn credentials"
)]
#[actix::get("/hosted/user/liveness")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<LivenessResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let creds = state
        .db_pool
        .db_query(move |conn| LivenessEvent::get_by_user_vault_id(conn, &user_auth.user_vault_id()))
        .await??;

    let response = creds
        .into_iter()
        .map(api_wire_types::LivenessEvent::from_db)
        .collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
