use crate::types::success::ApiResponseData;
use crate::State;
use crate::{errors::ApiError, utils::email::EmailVerifyData};
use chrono::{NaiveDateTime, Utc};
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct EmailVerifyRequest {
    data: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyChallenge {
    pub expires_at: NaiveDateTime,
    pub email: String,
}

#[api_v2_operation(tags(User))]
#[post("/email/verify")]
/// Used to asynchronously verify a user's email address.
/// Requires the hash of the email and the encrypted email challenge, which are sent to the user's
/// email.
async fn handler(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // Extract sh email, look up the user vault, and attempt to decrypt with the associated user's keys.
    // Note that we get nice security guarantees from this model:
    // 1. if the email associated with the user has changed, we won't be able to look it up (prevents swapping emails)
    // 2. bad data / a different sh email will not properly decrypt
    let EmailVerifyData {
        sh_email,
        e_email_challenge,
    } = EmailVerifyData::deserialize(request.into_inner().data)?;
    // TODO what happens if multiple user vaults have this email?
    let (existing_user_vault, email_user_data) =
        db::user_vault::get_by_fingerprint(&state.db_pool, DataKind::Email, sh_email, false)
            .await?
            .ok_or(ApiError::UserDoesntExistForEmailChallenge)?;

    let decrypted_challenge = crate::enclave::decrypt_bytes(
        &state,
        &e_email_challenge,
        existing_user_vault.e_private_key.clone(),
        enclave_proxy::DataTransform::Identity,
    )
    .await?;

    // Decrypt the challenge & check validity
    let challenge_data: EmailVerifyChallenge = serde_json::from_str(&decrypted_challenge)
        .map_err(|_| ApiError::EmailChallengeDecryptionError)?;
    if challenge_data.expires_at < Utc::now().naive_utc() {
        return Err(ApiError::EmailChallengeExpired);
    }

    // Challenge is valid, let's mark the email as valid in user vault
    email_user_data.mark_verified(&state.db_pool).await?;

    Ok(Json(ApiResponseData {
        data: "updated successfully".to_owned(),
    }))
}
