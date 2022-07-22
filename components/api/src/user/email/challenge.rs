use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_context::SessionContext;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::utils::email::send_email_challenge;
use crate::State;
use db::models::user_data::UserData;
use newtypes::UserDataId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct RequestEmailVerifyRequest {
    id: UserDataId,
}

#[api_v2_operation(tags(User))]
#[post("/challenge")]
/// Re-send the email verification email for the given user data
async fn post(
    state: web::Data<State>,
    auth: SessionContext<My1fpBasicSession>,
    request: Json<RequestEmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let (user_data, user_vault) = state
        .db_pool
        .db_query(move |conn| UserData::get(conn, &request.id, &auth.user_vault_id()))
        .await??;
    // TODO make sure the user data isn't verified
    let email = crate::enclave::decrypt_bytes(
        &state,
        &user_data.e_data,
        &user_vault.e_private_key,
        enclave_proxy::DataTransform::Identity,
    )
    .await?;

    send_email_challenge(&state, user_data.id, &email).await?;

    Ok(Json(ApiResponseData::ok(Empty {})))
}
