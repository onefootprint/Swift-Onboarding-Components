use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::crypto::signed_hash;
use crate::utils::email::clean_email;
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::utils::phone::clean_phone_number;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use chrono::{Duration, Utc};
use crypto::serde_cbor;
use db::models::user_vaults::UserVault;
use db::models::webauthn_credential::WebauthnCredential;
use db::webauthn_credentials::get_webauthn_creds;
use newtypes::{DataKind, UserVaultId};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};
use webauthn_rs_core::proto::{Base64UrlSafeData, Credential, ParsedAttestationData};
use webauthn_rs_proto::{RegisteredExtensions, UserVerificationPolicy};

use super::{send_phone_challenge, BiometricChallengeState, ChallengeKind};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    identifier: Identifier,
    preferred_challenge_kind: ChallengeKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Identifier {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    user_found: bool,
    challenge_data: Option<UserChallengeData>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    challenge_kind: ChallengeKind,
    challenge_token: ChallengeToken,
    phone_number_last_two: String,
    biometric_challenge_json: Option<String>,
}

#[api_v2_operation(tags(Identify))]
/// Tries to identify an existing user by either phone number or email. If the user is found,
/// initiates a challenge of the requested type and returns relevant challenge data.
pub async fn handler(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    let IdentifyRequest {
        identifier,
        preferred_challenge_kind,
    } = request.into_inner();

    // Look up existing user vault by identifier
    let existing_user = if let Some(existing_user) = get_user_by_identifier(&state, identifier).await? {
        existing_user
    } else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Ok(Json(ApiResponseData {
            data: IdentifyResponse {
                user_found: false,
                challenge_data: None,
            },
        }));
    };

    // The user vault exists. Extract the phone number for the user
    let user_id = existing_user.id.clone();
    let uvw = UserVaultWrapper::from(&state.db_pool, existing_user).await?;
    let phone_number = uvw
        .get_decrypted_field(&state, DataKind::PhoneNumber)
        .await?
        .ok_or(ApiError::NoPhoneNumberForVault)?;

    // Initiate the challenge of the requested type
    let (challenge_kind, challenge_token, biometric_challenge_json) = match preferred_challenge_kind {
        ChallengeKind::Biometric => {
            let creds = get_webauthn_creds(&state.db_pool, user_id.clone()).await?;
            if !creds.is_empty() {
                let (challenge_token, json) =
                    initiate_biometric_challenge_for_user(&state, &user_id, creds).await?;
                (ChallengeKind::Biometric, challenge_token, Some(json))
            } else {
                // Fall back to SMS if the user requested webauthn but doesn't have any creds
                let challenge_token = send_phone_challenge(&state, phone_number.clone()).await?;
                (ChallengeKind::Sms, challenge_token, None)
            }
        }
        ChallengeKind::Sms => {
            let challenge_token = send_phone_challenge(&state, phone_number.clone()).await?;
            (ChallengeKind::Sms, challenge_token, None)
        }
    };

    Ok(Json(ApiResponseData {
        data: IdentifyResponse {
            user_found: true,
            challenge_data: Some(UserChallengeData {
                challenge_kind,
                challenge_token,
                phone_number_last_two: phone_number_last_two(phone_number),
                biometric_challenge_json,
            }),
        },
    }))
}

async fn get_user_by_identifier(
    state: &web::Data<State>,
    identifier: Identifier,
) -> Result<Option<UserVault>, ApiError> {
    let (data_kind, data) = match identifier {
        Identifier::PhoneNumber(phone_number) => {
            let phone_number = clean_phone_number(state, &phone_number).await?;
            (DataKind::PhoneNumber, phone_number)
        }
        Identifier::Email(email) => {
            let email = clean_email(email);
            (DataKind::Email, email)
        }
    };
    let sh_data = signed_hash(state, data).await?;
    // TODO should we only look for verified emails?
    let existing_user = db::user_vault::get_by_fingerprint(&state.db_pool, data_kind, sh_data, false)
        .await?
        .map(|x| x.0);
    Ok(existing_user)
}

async fn initiate_biometric_challenge_for_user(
    state: &web::Data<State>,
    user_id: &UserVaultId,
    creds: Vec<WebauthnCredential>,
) -> Result<(ChallengeToken, String), ApiError> {
    if creds.is_empty() {
        return Err(ApiError::WebauthnCredentialsNotSet);
    }

    // convert these creds to webauthn rs type
    let creds = creds
        .into_iter()
        .map(|cred| {
            serde_cbor::from_slice(&cred.public_key)
                .map(|public_key| Credential {
                    counter: 0,
                    cred_id: Base64UrlSafeData(cred.credential_id),
                    registration_policy: UserVerificationPolicy::Required,
                    user_verified: true,
                    cred: public_key,
                    backup_eligible: cred.backup_eligible,
                    backup_state: false, // ignore
                    extensions: RegisteredExtensions::none(),
                    attestation: ParsedAttestationData::None, // this doesn't matter for auth now
                    attestation_format: None,                 // also doesnt matter for auth
                })
                .map_err(crypto::Error::from)
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(state);
    let (challenge, auth_state) = webauthn
        .webauthn()
        .generate_challenge_authenticate_options(creds, None)?;

    let challenge_data = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(5),
        data: BiometricChallengeState {
            state: auth_state,
            user_vault_id: user_id.clone(),
        },
    };
    let challenge_token = challenge_data.seal(&state.session_sealing_key)?;
    let challenge_json = serde_json::to_string(&challenge)?;

    Ok((challenge_token, challenge_json))
}

fn phone_number_last_two(phone_number: String) -> String {
    let mut phone_number = phone_number;
    let len = phone_number.len();
    phone_number.drain((len - 2)..len).into_iter().collect()
}
