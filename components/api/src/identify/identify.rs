use super::{
    BiometricChallengeState, ChallengeKind, IdentifyChallengeData, IdentifyChallengeState, IdentifyType,
};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::email::clean_email;
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::utils::twilio::TwilioClient;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use crypto::serde_cbor;
use db::models::user_vaults::UserVault;
use db::models::webauthn_credential::WebauthnCredential;
use db::webauthn_credentials::get_webauthn_creds;
use newtypes::{DataKind, Fingerprinter, PhoneNumber, UserVaultId, ValidatedPhoneNumber};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};
use webauthn_rs_core::proto::{Base64UrlSafeData, Credential, ParsedAttestation, ParsedAttestationData};
use webauthn_rs_proto::{RegisteredExtensions, UserVerificationPolicy};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    identifier: Identifier,
    preferred_challenge_kind: ChallengeKind,
    #[serde(default)]
    identify_type: IdentifyType,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Identifier {
    Email(String),
    PhoneNumber(PhoneNumber),
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
    time_before_retry_s: i64,
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
        identify_type,
    } = request.into_inner();

    // Fall back to SMS if the user requested webauthn but doesn't have any creds
    let twilio_client = &state.twilio_client;

    // Look up existing user vault by identifier
    let existing_user =
        if let Some(existing_user) = get_user_by_identifier(&state, identifier, twilio_client).await? {
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
    let e164_phone_number = ValidatedPhoneNumber::__build_from_vault(phone_number.clone());

    // Initiate the challenge of the requested type
    let (challenge_kind, challenge_state_data, time_before_retry_s, biometric_challenge_json) =
        match preferred_challenge_kind {
            ChallengeKind::Biometric => {
                let creds = get_webauthn_creds(&state.db_pool, user_id.clone()).await?;
                if !creds.is_empty() {
                    let challenge = initiate_biometric_challenge_for_user(&state, &user_id, creds).await?;
                    (
                        ChallengeKind::Biometric,
                        IdentifyChallengeData::Biometric(challenge.state),
                        0,
                        Some(challenge.challenge_json),
                    )
                } else {
                    let (challenge_state, time_before_retry_s) =
                        twilio_client.send_challenge(&state, e164_phone_number).await?;
                    (
                        ChallengeKind::Sms,
                        IdentifyChallengeData::Sms(challenge_state),
                        time_before_retry_s,
                        None,
                    )
                }
            }
            ChallengeKind::Sms => {
                // Fall back to SMS if the user requested webauthn but doesn't have any creds
                let (challenge_state, time_before_retry_s) =
                    twilio_client.send_challenge(&state, e164_phone_number).await?;
                (
                    ChallengeKind::Sms,
                    IdentifyChallengeData::Sms(challenge_state),
                    time_before_retry_s,
                    None,
                )
            }
        };

    let challenge_state = IdentifyChallengeState {
        identify_type,
        data: challenge_state_data,
    };

    let challenge_token = Challenge {
        expires_at: challenge_state.expires_at(),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(Json(ApiResponseData {
        data: IdentifyResponse {
            user_found: true,
            challenge_data: Some(UserChallengeData {
                challenge_kind,
                challenge_token,
                phone_number_last_two: phone_number_last_two(phone_number),
                biometric_challenge_json,
                time_before_retry_s,
            }),
        },
    }))
}

async fn get_user_by_identifier(
    state: &web::Data<State>,
    identifier: Identifier,
    twilio_client: &TwilioClient,
) -> Result<Option<UserVault>, ApiError> {
    let (data_kind, data) = match identifier {
        Identifier::PhoneNumber(phone_number) => {
            let phone_number = twilio_client.standardize(&phone_number).await?;
            (DataKind::PhoneNumber, phone_number.e164)
        }
        Identifier::Email(email) => {
            let email = clean_email(email);
            (DataKind::Email, email)
        }
    };
    let sh_data = state.compute_fingerprint(data_kind, &data).await?;
    // TODO should we only look for verified emails?
    let existing_user = db::user_vault::get_by_fingerprint(&state.db_pool, data_kind, sh_data, false)
        .await?
        .map(|x| x.0);
    Ok(existing_user)
}

struct BiometricChallenge {
    state: BiometricChallengeState,
    challenge_json: String,
}

async fn initiate_biometric_challenge_for_user(
    state: &web::Data<State>,
    user_id: &UserVaultId,
    creds: Vec<WebauthnCredential>,
) -> Result<BiometricChallenge, ApiError> {
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
                    attestation: ParsedAttestation {
                        data: ParsedAttestationData::None,
                        metadata: webauthn_rs_core::proto::AttestationMetadata::None,
                    }, // this doesn't matter for auth now
                    attestation_format: webauthn_rs_core::AttestationFormat::None, // also doesn't matter for auth
                })
                .map_err(crypto::Error::from)
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(state);
    let (challenge, auth_state) = webauthn
        .webauthn()
        .generate_challenge_authenticate_options(creds, None)?;

    Ok(BiometricChallenge {
        state: BiometricChallengeState {
            state: auth_state,
            user_vault_id: user_id.clone(),
        },
        challenge_json: serde_json::to_string(&challenge)?,
    })
}

fn phone_number_last_two(phone_number: String) -> String {
    let mut phone_number = phone_number;
    let len = phone_number.len();
    phone_number.drain((len - 2)..len).into_iter().collect()
}
