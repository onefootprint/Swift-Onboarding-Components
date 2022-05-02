use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_token::OnboardingSessionTokenContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum ChallengeKind {
    Sms,
    Email,
    // TODO biometric
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeInitRequest {
    kind: ChallengeKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct CreateChallengeResponse {
    id: Uuid,
}

#[api_v2_operation]
pub async fn handler(
    state: web::Data<State>,
    onboarding_token_auth: OnboardingSessionTokenContext,
    request: Json<ChallengeInitRequest>,
) -> actix_web::Result<Json<ApiResponseData<CreateChallengeResponse>>, ApiError> {
    let user_vault = onboarding_token_auth.user_vault();
    let (db_kind, sh_data, e_data) = match request.kind {
        ChallengeKind::Email => (
            db::models::types::ChallengeKind::Email,
            user_vault.sh_email.clone(),
            user_vault.e_email.clone(),
        ),
        ChallengeKind::Sms => (
            db::models::types::ChallengeKind::PhoneNumber,
            user_vault.sh_phone_number.clone(),
            user_vault.e_phone_number.clone(),
        ),
    };
    db::challenge::expire_old(&state.db_pool, user_vault.id.clone(), db_kind).await?;

    // Decrypt user data from vault
    let sh_data = match sh_data {
        Some(sh_data) => sh_data,
        None => return Err(ApiError::UserDataNotPopulated(db_kind)),
    };
    let e_data = e_data.ok_or_else(|| ApiError::UserDataNotPopulated(db_kind))?;
    let decrypted_data = crate::enclave::lib::decrypt_bytes(
        &state,
        &e_data,
        user_vault.e_private_key.clone(),
        enclave_proxy::DataTransform::Identity,
    )
    .await?;
    let decrypted_data = std::str::from_utf8(&decrypted_data)?;

    let challenge_id = crate::onboarding::challenge::lib::initiate(
        &state,
        user_vault,
        decrypted_data.to_string(),
        sh_data,
        db_kind,
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: CreateChallengeResponse { id: challenge_id },
    }))
}
