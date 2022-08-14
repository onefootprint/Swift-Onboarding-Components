use super::{BiometricChallengeState, PhoneChallengeState};
use crate::auth::session_data::user::{UserAuthScope, UserSession};
use crate::errors::challenge::ChallengeError;

use crate::errors::ApiError;
use crate::hosted::identify::{IdentifyChallengeData, IdentifyChallengeState, IdentifyType};
use crate::types::response::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::utils::session::AuthSession;
use crate::State;

use chrono::Duration;
use crypto::sha256;
use db::models::user_vaults::{NewPortableUserVaultReq, UserVault};
use newtypes::{DataKind, Fingerprinter, SessionAuthToken, UserVaultId, ValidatedPhoneNumber};
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

#[api_v2_operation(tags(Hosted, Bifrost))]
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

    let (user_vault_id, user_kind) = match challenge_state.data {
        IdentifyChallengeData::Sms(c_state) => {
            validate_sms_challenge(&state, c_state, &request.challenge_response).await?
        }
        IdentifyChallengeData::Biometric(challenge_state) => {
            validate_biometric_challenge(&state, challenge_state, &request.challenge_response)?
        }
    };

    // create the session and token
    let (scopes, duration) = match challenge_state.identify_type {
        IdentifyType::Onboarding => (
            vec![UserAuthScope::SignUp, UserAuthScope::OrgOnboarding],
            Duration::minutes(15),
        ),
        IdentifyType::My1fp => (
            vec![UserAuthScope::SignUp, UserAuthScope::BasicProfile],
            Duration::hours(24),
        ),
        IdentifyType::Unspecified => return Err(ApiError::NotImplemented),
    };
    let data = UserSession::create(user_vault_id, scopes);
    let auth_token = AuthSession::create(&state, data, duration).await?;

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
    webauthn
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
        return Err(ChallengeError::IncorrectPin.into());
    }

    let phone_number = challenge_state.phone_number;
    let sh_phone_number = state
        .compute_fingerprint(DataKind::PhoneNumber, &phone_number.to_piistring())
        .await?;
    let existing_user = db::user_vault::get_by_fingerprint(&state.db_pool, sh_phone_number).await?;
    let result = match existing_user {
        Some(uv) => (uv.id, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault
            let user = create_new_user_vault(state, &phone_number).await?;
            (user.id, VerifyKind::UserCreated)
        }
    };
    Ok(result)
}

async fn create_new_user_vault(
    state: &web::Data<State>,
    phone_number: &ValidatedPhoneNumber,
) -> Result<UserVault, ApiError> {
    let (public_key, e_private_key) = crate::enclave::gen_keypair(state).await?;

    let new_user = NewPortableUserVaultReq {
        e_private_key,
        e_phone_number: public_key.seal_pii(&phone_number.to_piistring())?,
        e_phone_country: public_key.seal_pii(&phone_number.iso_country_code)?,
        public_key,
        sh_phone_number: state
            .compute_fingerprint(DataKind::PhoneNumber, &phone_number.to_piistring())
            .await?,
        sh_phone_country: state
            .compute_fingerprint(DataKind::PhoneCountry, &phone_number.iso_country_code)
            .await?,
        is_live: phone_number.is_live(),
    };
    let user = db::user_vault::create(&state.db_pool, new_user).await?;

    Ok(user)
}
