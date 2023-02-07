use super::{BiometricChallengeState, PhoneChallengeState};
use crate::auth::tenant::ObPkAuth;
use crate::auth::user::{UserAuthScope, UserSession};
use crate::errors::challenge::ChallengeError;

use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::hosted::identify::{ChallengeData, ChallengeState};
use crate::types::response::ResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::utils::session::AuthSession;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;

use chrono::Duration;
use crypto::sha256;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::NewPhoneNumberArgs;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::{NewUserInfo, UserVault};
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::{Fingerprinter, IdentityDataKind, SessionAuthToken, UserVaultId, ValidatedPhoneNumber};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

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

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Verifies the response to either an SMS or biometric challenge. When the \
    challenge response is verified, we will return an auth token for the user. If no user exists \
    (which may only happen after a phone challenge), we will create a new user with the provided \
    phone number"
)]
#[actix::post("/hosted/identify/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<VerifyRequest>,
    ob_pk_auth: Option<ObPkAuth>,
) -> actix_web::Result<Json<ResponseData<VerifyResponse>>, ApiError> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &request.challenge_token)?.data;

    let ob_config = ob_pk_auth.map(|ob| (ob.ob_config().clone()));
    let (user_vault_id, user_kind) = match challenge_state.data {
        ChallengeData::Sms(c_state) => {
            validate_sms_challenge(&state, c_state, &request.challenge_response, ob_config.clone()).await?
        }
        ChallengeData::Biometric(challenge_state) => {
            validate_biometric_challenge(&state, challenge_state, &request.challenge_response).await?
        }
    };

    // If a tenant PK is provided, create the ScopedUser if it doesn't yet exist
    let (token_scopes, duration) = if let Some(ob_config) = ob_config {
        // Tenant ob config public key is provided - we are in the identify flow for bifrost.
        let user_vault_id = user_vault_id.clone();
        let su = state
            .db_pool
            // This already happens if we make a UserVault. But if we are logging into an existing
            // user vault to onboard onto a new ob config, we need to make the ScopedUser
            .db_transaction(move |conn| -> ApiResult<_> {
                let uv = UserVault::lock(conn, &user_vault_id)?;
                let result = ScopedUser::get_or_create(conn, &uv, ob_config.id)?;
                Ok(result)
            })
            .await?;
        let token_scopes = vec![
            UserAuthScope::SignUp,
            UserAuthScope::OrgOnboardingInit { id: su.id },
        ];
        (token_scopes, Duration::minutes(20))
    } else {
        // No tenant public key is provided - we are in the my1fp identify flow
        let token_scopes = vec![UserAuthScope::SignUp, UserAuthScope::BasicProfile];
        (token_scopes, Duration::hours(24))
    };

    // Create the auth session and save it in the database
    let data = UserSession::make(user_vault_id, token_scopes);
    let auth_token = AuthSession::create(&state, data, duration).await?;

    Ok(Json(ResponseData {
        data: VerifyResponse {
            kind: user_kind,
            auth_token,
        },
    }))
}

async fn validate_biometric_challenge(
    state: &web::Data<State>,
    challenge_state: BiometricChallengeState,
    challenge_response: &str,
) -> ApiResult<(UserVaultId, VerifyKind)> {
    // Decode and validate the response to the biometric challenge
    let webauthn = LivenessWebauthnConfig::new(state);
    let auth_resp = serde_json::from_str(challenge_response)?;

    let result = webauthn
        .webauthn()
        .authenticate_credential(&auth_resp, &challenge_state.state)?;

    // if the credential's backup state has changed:
    // update the backup state to learn that a credential is now portable across devices
    if result.backup_state && challenge_state.non_synced_cred_ids.contains(&result.cred_id) {
        let uv_id = challenge_state.user_vault_id.clone();

        state
            .db_pool
            .db_query(move |conn| WebauthnCredential::update_backup_state(conn, &uv_id, &result.cred_id.0))
            .await??;
    }

    Ok((challenge_state.user_vault_id, VerifyKind::UserInherited))
}

async fn validate_sms_challenge(
    state: &web::Data<State>,
    challenge_state: PhoneChallengeState,
    challenge_response: &str,
    ob_config: Option<ObConfiguration>,
) -> Result<(UserVaultId, VerifyKind), ApiError> {
    if challenge_state.h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ChallengeError::IncorrectPin.into());
    }

    let phone_number = challenge_state.phone_number;
    let sh_phone_number = state
        .compute_fingerprint(IdentityDataKind::PhoneNumber, phone_number.to_piistring())
        .await?;
    let existing_user = state
        .db_pool
        .db_query(|conn| UserVault::find_portable(conn, sh_phone_number))
        .await??;
    let result = match existing_user {
        Some(uv) => (uv.id, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault
            let user = create_new_user_vault(state, &phone_number, ob_config).await?;
            (user.id, VerifyKind::UserCreated)
        }
    };
    Ok(result)
}

async fn create_new_user_vault(
    state: &web::Data<State>,
    phone_number: &ValidatedPhoneNumber,
    ob_config: Option<ObConfiguration>,
) -> ApiResult<UserVault> {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    if let Some(ob_config) = ob_config.as_ref() {
        // If we are making a ScopedUser here, verify that the ob config is_live matches the user vault
        if ob_config.is_live != phone_number.is_live() {
            return Err(UserError::SandboxMismatch.into());
        }
    }

    let phone_info = NewPhoneNumberArgs {
        e_phone_number: public_key.seal_pii(&phone_number.to_piistring())?,
        e_phone_country: public_key.seal_pii(&phone_number.iso_country_code)?,
        sh_phone_number: state
            .compute_fingerprint(IdentityDataKind::PhoneNumber, phone_number.to_piistring())
            .await?,
    };
    let user_info = NewUserInfo {
        e_private_key,
        public_key,
        is_live: phone_number.is_live(),
    };
    let user = state
        .db_pool
        .db_transaction(|conn| -> ApiResult<_> {
            let uv = UserVaultWrapper::create_user_vault(conn, user_info, ob_config, phone_info)?;
            Ok(uv.into_inner())
        })
        .await?;

    Ok(user)
}
