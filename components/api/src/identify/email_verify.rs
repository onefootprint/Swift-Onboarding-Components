use std::str::FromStr;

use crate::errors::ApiError;
use crate::response::success::ApiResponseData;
use crate::State;
use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use chrono::{NaiveDateTime, Utc};
use crypto::b64::Base64Data;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct EmailVerifyRequest {
    sh_email: String,
    e_email_challenge: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyChallenge {
    pub expires_at: NaiveDateTime,
    pub email: String,
}

#[api_v2_operation]
#[post("/email/verify")]
/// Async verification of user email address. This endpoint will not be used by the client and instead
/// will be accessed via a user to validate their email
async fn handler(
    state: web::Data<State>,
    request: Json<EmailVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // Extract sh email, look up the user vault, and attempt to decrypt with the associated user's keys.
    // Note that we get nice security guarantees from this model:
    // 1. if the email associated with the user has changed, we won't be able to look it up (prevents swapping emails)
    // 2. bad data / a different sh email will not properly decrypt
    let sh_email = Base64Data::from_str(&request.sh_email).map_err(crypto::Error::from)?;
    let existing_user_vault = db::user_vault::get_by_email(&state.db_pool, sh_email.0)
        .await?
        .ok_or(ApiError::UserDoesntExistForEmailChallenge)?;
    let decrypted_challenge = crate::enclave::lib::decrypt_string(
        &state,
        &request.e_email_challenge,
        existing_user_vault.e_private_key.clone(),
        enclave_proxy::DataTransform::Identity,
    )
    .await?;

    // Decrypt the challenge & check validity
    let decrypted_challenge = std::str::from_utf8(&decrypted_challenge)?.to_string();
    let challenge_data: EmailVerifyChallenge = serde_json::from_str(&decrypted_challenge)
        .map_err(|_| ApiError::EmailChallengeDecryptionError)?;
    if challenge_data.expires_at < Utc::now().naive_utc() {
        return Err(ApiError::EmailChallengeExpired);
    }

    // Challenge is valid, let's mark the email as valid in user vault
    let updates = db::user_vault::update(
        &state.db_pool,
        db::models::user_vaults::UpdateUserVault {
            id: existing_user_vault.id.clone(),
            is_email_verified: Some(true),
            ..Default::default()
        },
    )
    .await?;

    Ok(Json(ApiResponseData {
        data: format!("updated {} rows", updates),
    }))
}
