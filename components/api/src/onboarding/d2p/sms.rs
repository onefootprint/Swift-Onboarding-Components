use crate::auth::session_context::SessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::utils::phone::{rate_limit, send_sms};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use newtypes::user::d2p::D2pSession;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pSmsRequest {
    base_url: String,
}

#[api_v2_operation(tags(D2p))]
#[post("sms")]
/// Send an SMS with a link to the phone onboarding page
pub fn handler(
    user_auth: SessionContext<D2pSession>,
    request: Json<D2pSmsRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let uvw = UserVaultWrapper::from(&state.db_pool, user_vault).await?;
    let phone_number = uvw
        .get_decrypted_field(&state, DataKind::PhoneNumber)
        .await?
        .ok_or(ApiError::NoPhoneNumberForVault)?;

    rate_limit(&state, phone_number.clone(), "d2p_session").await?;

    let message_body = format!(
        "Hello from Footprint! Continue signing up for your account here: {}/biometric#{}",
        request.base_url, user_auth.auth_token
    );
    send_sms(&state, phone_number, message_body).await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
