use super::ChallengeKind;
use crate::errors::ApiError;
use crate::identify::{signed_hash, BiometricChallengeState, PhoneChallengeState};
use crate::liveness::LivenessWebauthnConfig;
use crate::types::success::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::State;
use aws_sdk_kms::model::DataKeyPairSpec;
use chrono::{Duration, Utc};
use crypto::sha256;
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use db::models::user_vaults::{NewUserVaultReq, UserVault};
use newtypes::{DataKind, Status, UserVaultId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::seal;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct VerifyRequest {
    challenge_token: ChallengeToken, // Sealed Challenge<PhoneChallengeState>
    challenge_kind: ChallengeKind,
    challenge_response: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
enum VerifyKind {
    UserCreated,
    UserInherited,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
struct VerifyResponse {
    kind: VerifyKind,
    auth_token: String,
}

#[api_v2_operation(tags(Identify))]
#[post("/verify")]
/// Verifies the response to either an SMS or biometric challenge.
/// When the challenge response is verified, we will return an auth token for the user.
/// If no user exists (which may only happen after a phone challenge), we will create a new user
/// with the provided phone number
async fn handler(
    state: web::Data<State>,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let (user_vault_id, kind) = match request.challenge_kind {
        ChallengeKind::Biometric => validate_biometric_challenge(
            &state,
            &request.challenge_token,
            &request.challenge_response,
        )?,
        ChallengeKind::Sms => {
            validate_sms_challenge(
                &state,
                &request.challenge_token,
                &request.challenge_response,
            )
            .await?
        }
    };

    // Save logged in session data into the DB
    let login_expires_at = Utc::now().naive_utc() + Duration::minutes(15);
    let (_, auth_token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: user_vault_id,
    })
    .create(&state.db_pool, login_expires_at)
    .await?;

    Ok(Json(ApiResponseData {
        data: VerifyResponse { kind, auth_token },
    }))
}

fn validate_biometric_challenge(
    state: &web::Data<State>,
    challenge_token: &ChallengeToken,
    challenge_response: &str,
) -> Result<(UserVaultId, VerifyKind), ApiError> {
    // Decode and validate the response to the biometric challenge
    let challenge =
        Challenge::<BiometricChallengeState>::unseal(&state.session_sealing_key, challenge_token)?;
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));
    let auth_resp = serde_json::from_str(challenge_response)?;
    let (_, _authenticator_data) = webauthn
        .authenticate_credential(&auth_resp, &challenge.data.state)
        .map_err(|_| ApiError::ChallengeNotValid)?;

    Ok((challenge.data.user_vault_id, VerifyKind::UserInherited))
}

async fn validate_sms_challenge(
    state: &web::Data<State>,
    challenge_token: &ChallengeToken,
    challenge_response: &str,
) -> Result<(UserVaultId, VerifyKind), ApiError> {
    // Decode and validate the response to the SMS challenge
    let challenge_data =
        Challenge::<PhoneChallengeState>::unseal(&state.session_sealing_key, challenge_token)?;

    let now = Utc::now().naive_utc();
    // TODO don't need to check expiry time here
    if (challenge_data.data.h_code != sha256(challenge_response.as_bytes()).to_vec())
        || (challenge_data.expires_at < now)
    {
        return Err(ApiError::ChallengeNotValid);
    }

    // Fetch the user associated with this phone number
    let phone_number = challenge_data.data.phone_number;
    let sh_phone_number = signed_hash(&state, phone_number.clone()).await?;
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
            let user = create_new_user_vault(&state, phone_number.clone()).await?;
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
    let ec_pk_uncompressed =
        crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)?;
    let _pk = crypto::hex::encode(&ec_pk_uncompressed);

    let new_user = NewUserVaultReq {
        e_private_key: new_key_pair
            .private_key_ciphertext_blob
            .unwrap()
            .into_inner(),
        public_key: ec_pk_uncompressed.clone(),
        id_verified: Status::Incomplete,
        e_phone_number: seal(phone_number.clone(), &ec_pk_uncompressed)?,
        sh_phone_number: signed_hash(state, phone_number.clone()).await?,
    };
    let user = db::user_vault::create(&state.db_pool, new_user).await?;

    Ok(user)
}
