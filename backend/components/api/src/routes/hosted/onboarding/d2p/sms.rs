use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::user_vault::UserVault;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pSmsRequest {
    url: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct D2pSmsResponse {
    time_before_retry_s: i64,
}

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-sms",
    tags(Hosted),
    description = "Send an SMS with a link to the phone onboarding page."
)]
#[post("/hosted/onboarding/d2p/sms")]
pub async fn handler(
    user_auth: UserAuthContext,
    request: Json<D2pSmsRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<D2pSmsResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::Handoff])?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let ob_info = user_auth.onboarding(conn)?;
            let uvw = if let Some(ob_info) = ob_info {
                // If the auth token is during an onboarding session, create a UVW that sees all
                // speculative data for the tenant in order to see an uncommitted phone number
                // that was added by this tenant.
                UserVaultWrapper::get_for_tenant(conn, &ob_info.scoped_user.id)?
            } else {
                // Otherwise, create a UVW that only sees committed data
                let uv = UserVault::get(conn, &user_auth.user_vault_id())?;
                UserVaultWrapper::get_committed(conn, uv)?
            };
            Ok(uvw)
        })
        .await??;
    let phone_number = uvw.get_decrypted_primary_phone(&state).await?;

    let time_before_retry_s = state
        .twilio_client
        .send_d2p(&state, &phone_number, request.url.clone())
        .await?;

    Ok(Json(ResponseData::ok(D2pSmsResponse {
        time_before_retry_s: time_before_retry_s.num_seconds(),
    })))
}
