use super::{BiometricChallengeState, ChallengeKind, Identifier, IdentifyType, UserChallengeData};
use crate::errors::challenge::ChallengeError;
use crate::errors::onboarding::OnboardingError;
use crate::hosted::identify::get_user_challenge_context;
use crate::hosted::identify::ChallengeData;
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::State;
use crate::{errors::ApiError, hosted::identify::ChallengeState};
use crypto::serde_cbor;
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::UserVaultId;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use webauthn_rs_core::proto::{Base64UrlSafeData, Credential, ParsedAttestation, ParsedAttestationData};
use webauthn_rs_proto::{RegisteredExtensions, UserVerificationPolicy};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct LoginChallengeRequest {
    identifier: Identifier,
    preferred_challenge_kind: ChallengeKind,
    identify_type: IdentifyType,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct LoginChallengeResponse {
    challenge_data: UserChallengeData,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Sends a challenge to the phone number and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can get or create \
    the user with this phone number."
)]
#[actix::post("/hosted/identify/login_challenge")]
pub async fn post(
    request: Json<LoginChallengeRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<LoginChallengeResponse>>, ApiError> {
    // clean phone number
    let LoginChallengeRequest {
        identifier,
        preferred_challenge_kind,
        identify_type,
    } = request.into_inner();

    // Fall back to SMS if the user requested webauthn but doesn't have any creds
    let twilio_client = &state.twilio_client;

    // Look up existing user vault by identifier
    let (uvw, creds, _) =
        if let Some(user_challenge_context) = get_user_challenge_context(&state, &identifier).await? {
            user_challenge_context
        } else {
            // The user vault doesn't exist. Just return that the user wasn't found
            return Err(ChallengeError::LoginChallengeUserNotFound.into());
        };

    // If we need to create a challenge, extract the phone number for the user
    let validated_phone_number = uvw.get_decrypted_primary_phone(&state).await?;

    // Initiate the challenge of the requested type
    let (challenge_kind, challenge_state_data, time_before_retry_s, biometric_challenge_json) =
        match preferred_challenge_kind {
            ChallengeKind::Biometric => {
                if !creds.is_empty() {
                    let challenge =
                        initiate_biometric_challenge_for_user(&state, &uvw.user_vault.id, creds).await?;
                    (
                        ChallengeKind::Biometric,
                        ChallengeData::Biometric(challenge.state),
                        0,
                        Some(challenge.challenge_json),
                    )
                } else {
                    let (challenge_state, time_before_retry_s) = twilio_client
                        .send_challenge(&state, &validated_phone_number)
                        .await?;
                    (
                        ChallengeKind::Sms,
                        ChallengeData::Sms(challenge_state),
                        time_before_retry_s.num_seconds(),
                        None,
                    )
                }
            }
            ChallengeKind::Sms => {
                // Fall back to SMS if the user requested webauthn but doesn't have any creds
                let (challenge_state, time_before_retry_s) = twilio_client
                    .send_challenge(&state, &validated_phone_number)
                    .await?;
                (
                    ChallengeKind::Sms,
                    ChallengeData::Sms(challenge_state),
                    time_before_retry_s.num_seconds(),
                    None,
                )
            }
        };

    let challenge_state = ChallengeState {
        identify_type,
        data: challenge_state_data,
    };

    let challenge_token = Challenge {
        expires_at: challenge_state.expires_at(),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(Json(ResponseData {
        data: LoginChallengeResponse {
            challenge_data: UserChallengeData {
                challenge_kind,
                challenge_token,
                phone_number_last_two: validated_phone_number.leak_last_two(),
                phone_country: validated_phone_number.iso_country_code.leak_to_string(),
                biometric_challenge_json,
                time_before_retry_s,
            },
        },
    }))
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
        return Err(OnboardingError::WebauthnCredentialsNotSet)?;
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
