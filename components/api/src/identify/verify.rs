use super::{BiometricChallengeState, PhoneChallengeState};
use crate::auth::session_data::user::my_fp::{My1fpBasicSession, UserAuthMethod};
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::ApiError;
use crate::identify::{IdentifyChallengeData, IdentifyChallengeState, IdentifyType};
use crate::types::success::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::crypto::seal_to_vault_pkey;
use crate::utils::crypto::signed_hash;
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::State;
use aws_sdk_kms::model::DataKeyPairSpec;
use chrono::Duration;
use crypto::sha256;
use db::models::user_vaults::{NewUserVaultReq, UserVault};
use newtypes::{DataKind, SessionAuthToken, Status, UserVaultId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct VerifyRequest {
    /// Opaque challenge state token
    challenge_token: ChallengeToken,
    challenge_response: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum VerifyKind {
    UserCreated,
    UserInherited,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct VerifyResponse {
    kind: VerifyKind,
    auth_token: SessionAuthToken,
}

#[api_v2_operation(tags(Identify))]
#[post("/verify")]
/// Verifies the response to either an SMS or biometric challenge.
/// When the challenge response is verified, we will return an auth token for the user.
/// If no user exists (which may only happen after a phone challenge), we will create a new user
/// with the provided phone number
pub async fn handler(
    state: web::Data<State>,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge_state =
        Challenge::<IdentifyChallengeState>::unseal(&state.challenge_sealing_key, &request.challenge_token)?
            .data;

    let (user_vault_id, user_kind, user_auth_method) = match challenge_state.data {
        IdentifyChallengeData::Sms(challenge_state) => {
            let (uv_id, user_kind) =
                validate_sms_challenge(&state, challenge_state, &request.challenge_response).await?;

            (uv_id, user_kind, UserAuthMethod::SmsOnly)
        }
        IdentifyChallengeData::Biometric(challenge_state) => {
            let (uv_id, user_kind) =
                validate_biometric_challenge(&state, challenge_state, &request.challenge_response)?;
            (uv_id, user_kind, UserAuthMethod::BiometricsOnly)
        }
    };

    // create the session and token
    let auth_token = match challenge_state.identify_type {
        IdentifyType::Onboarding => {
            let data = SessionData::Onboarding(OnboardingSession { user_vault_id });
            ServerSession::create(&state, data, Duration::minutes(15)).await?
        }
        IdentifyType::My1fp => {
            let data = SessionData::My1fp(My1fpBasicSession {
                user_vault_id,
                auth_method: user_auth_method,
            });
            ServerSession::create(&state, data, Duration::hours(24)).await?
        }
    };

    Ok(Json(ApiResponseData {
        data: VerifyResponse {
            kind: user_kind,
            auth_token,
        },
    }))
}

fn validate_biometric_challenge(
    state: &web::Data<State>,
    challenge_state: BiometricChallengeState,
    challenge_response: &str,
) -> Result<(UserVaultId, VerifyKind), ApiError> {
    // Decode and validate the response to the biometric challenge
    let webauthn = LivenessWebauthnConfig::new(state);
    let auth_resp = serde_json::from_str(challenge_response)?;
    let _ = webauthn
        .webauthn()
        .authenticate_credential(&auth_resp, &challenge_state.state)?;

    Ok((challenge_state.user_vault_id, VerifyKind::UserInherited))
}

async fn validate_sms_challenge(
    state: &web::Data<State>,
    challenge_state: PhoneChallengeState,
    challenge_response: &str,
) -> Result<(UserVaultId, VerifyKind), ApiError> {
    if challenge_state.h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_state.phone_number;
    let sh_phone_number = signed_hash(state, phone_number.e164.clone()).await?;
    let existing_user = db::user_vault::get_by_fingerprint(
        &state.db_pool,
        DataKind::PhoneNumber,
        sh_phone_number.clone(),
        true,
    )
    .await?
    .map(|x| x.0);
    let result = match existing_user {
        Some(uv) => (uv.id, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault
            let user = create_new_user_vault(state, phone_number.e164.clone()).await?;
            (user.id, VerifyKind::UserCreated)
        }
    };
    Ok(result)
}

async fn create_new_user_vault(
    state: &web::Data<State>,
    phone_number: String,
) -> Result<UserVault, ApiError> {
    let new_key_pair = state
        .kms_client
        .generate_data_key_pair_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_pair_spec(DataKeyPairSpec::EccNistP256)
        .send()
        .await?;

    let der_public_key = new_key_pair.public_key.unwrap().into_inner();
    let ec_pk_uncompressed = crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)?;
    let _pk = crypto::hex::encode(&ec_pk_uncompressed);

    let new_user = NewUserVaultReq {
        e_private_key: new_key_pair.private_key_ciphertext_blob.unwrap().into_inner(),
        public_key: ec_pk_uncompressed.clone(),
        id_verified: Status::Incomplete,
        e_phone_number: seal_to_vault_pkey(phone_number.clone(), &ec_pk_uncompressed)?,
        sh_phone_number: signed_hash(state, phone_number.clone()).await?,
    };
    let user = db::user_vault::create(&state.db_pool, new_user).await?;

    Ok(user)
}
