use crate::auth::session_data::user::UserAuthScope;
use crate::auth::{UserAuth, VerifiedUserAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use newtypes::PhoneNumber;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::str::FromStr;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pSmsRequest {
    base_url: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct D2pSmsResponse {
    time_before_retry_s: i64,
}

#[api_v2_operation(tags(D2p))]
#[post("sms")]
/// Send an SMS with a link to the phone onboarding page
pub fn handler(
    user_auth: UserAuth,
    request: Json<D2pSmsRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<D2pSmsResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::Handoff])?;

    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let uvw = UserVaultWrapper::from(&state.db_pool, user_vault).await?;
    let (phone_number, _) = uvw.get_decrypted_primary_phone(&state).await?;

    let twilio_client = &state.twilio_client;
    let phone_number: PhoneNumber = PhoneNumber::from_str(phone_number.leak())?;
    let phone_number = twilio_client.standardize(&phone_number).await?;
    let time_before_retry_s = twilio_client
        .send_d2p(
            &state,
            &phone_number,
            request.base_url.clone(),
            user_auth.auth_token,
        )
        .await?;

    Ok(Json(ApiResponseData::ok(D2pSmsResponse {
        time_before_retry_s: time_before_retry_s.num_seconds(),
    })))
}
