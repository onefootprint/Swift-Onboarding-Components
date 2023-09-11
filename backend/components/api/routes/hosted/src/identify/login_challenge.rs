use super::{BiometricChallengeState, ChallengeKind, UserChallengeData};
use crate::errors::challenge::ChallengeError;
use crate::errors::onboarding::OnboardingError;
use crate::identify;
use crate::identify::get_user_challenge_context;
use crate::identify::ChallengeData;
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::utils::liveness::WebauthnConfig;
use crate::State;
use crate::{errors::ApiError, identify::ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::user::UserAuth;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::fingerprinter::VaultIdentifier;
use api_core::utils::headers::SandboxId;
use api_wire_types::IdentifyId;
use crypto::serde_cbor;
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::VaultId;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use webauthn_rs_core::proto::{Base64UrlSafeData, Credential, ParsedAttestation, ParsedAttestationData};
use webauthn_rs_proto::{RegisteredExtensions, UserVerificationPolicy};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct AuthChallengeRequest {
    identifier: Option<IdentifyId>,
    preferred_challenge_kind: ChallengeKind,
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
    request: Json<AuthChallengeRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
    // When provided, is used to identify the currently authed user. Will generate a challenge
    // for the authed user
    user_auth: Option<UserAuthContext>,
) -> actix_web::Result<Json<ResponseData<LoginChallengeResponse>>, ApiError> {
    let tenant = ob_context.as_ref().map(|obc| obc.tenant());

    // clean phone number
    let AuthChallengeRequest {
        identifier,
        preferred_challenge_kind,
    } = request.into_inner();

    // Require one of user_auth or identifier
    let identifier = match (user_auth, identifier) {
        (Some(user_auth), None) => {
            let user_auth = user_auth.check_guard(Any)?;
            VaultIdentifier::AuthenticatedId(user_auth.user_vault_id().clone())
        }
        (None, Some(id)) => VaultIdentifier::IdentifyId(id, sandbox_id.0),
        (None, None) | (Some(_), Some(_)) => return Err(ChallengeError::OnlyOneIdentifier.into()),
    };

    // Fall back to SMS if the user requested webauthn but doesn't have any creds
    let twilio_client = &state.twilio_client;

    // Look up existing user vault by identifier
    let t_id = tenant.map(|t| &t.id);
    let (uvw, creds, _) =
        if let Some(user_challenge_context) = get_user_challenge_context(&state, identifier, t_id).await? {
            user_challenge_context
        } else {
            // The user vault doesn't exist. Just return that the user wasn't found
            return Err(ChallengeError::LoginChallengeUserNotFound.into());
        };

    // If we need to create a challenge, extract the phone number for the user
    let sandbox_id = uvw.vault.sandbox_id.clone();

    let challenge_kind = match preferred_challenge_kind {
        // Fall back to SMS if the user requested webauthn but doesn't have any creds
        ChallengeKind::Biometric => {
            if creds.is_empty() {
                ChallengeKind::Sms
            } else {
                ChallengeKind::Biometric
            }
        }
        ck => ck,
    };

    let (challenge_state_data, time_before_retry_s, phone_number, biometric_challenge_json) =
        match challenge_kind {
            ChallengeKind::Biometric => {
                // NOTE: it's possible we don't have a phone number, so don't fail here outright
                let phone_number = uvw.get_decrypted_verified_primary_phone(&state).await.ok();
                let challenge = initiate_biometric_challenge_for_user(&state, &uvw.vault.id, creds).await?;
                let challenge_data = ChallengeData::Passkey(challenge.state);
                (challenge_data, 0, phone_number, Some(challenge.challenge_json))
            }
            ChallengeKind::Sms => {
                let phone_number = uvw.get_decrypted_verified_primary_phone(&state).await?;
                let tenant_name = tenant.map(|t| t.name.clone());
                let (challenge_state, time_before_retry_s) = twilio_client
                    .send_challenge(&state, tenant_name, &phone_number, sandbox_id)
                    .await?;
                let challenge_data = ChallengeData::Sms(challenge_state);
                (
                    challenge_data,
                    time_before_retry_s.num_seconds(),
                    Some(phone_number),
                    None,
                )
            }
            ChallengeKind::Email => {
                let email = uvw.get_decrypted_verified_email(&state).await?;
                let tenant = tenant.ok_or(OnboardingError::MissingObPkAuth)?;

                let challenge_data =
                    identify::send_email_challenge(&state, &email, tenant, sandbox_id).await?;

                (
                    challenge_data,
                    state.config.time_s_between_sms_challenges,
                    None,
                    None,
                )
            }
        };

    let challenge_state = ChallengeState {
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
                scrubbed_phone_number: phone_number.map(|p| p.last_two()),
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
    user_id: &VaultId,
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

    // separately keep tracked of devices not backed up
    let non_synced_cred_ids = creds
        .iter()
        .filter(|c| !c.backup_state)
        .map(|c| c.cred_id.clone())
        .collect();

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let (challenge, auth_state) = webauthn
        .webauthn()
        .generate_challenge_authenticate_options(creds, None)?;

    Ok(BiometricChallenge {
        state: BiometricChallengeState {
            state: auth_state,
            user_vault_id: user_id.clone(),
            non_synced_cred_ids,
        },
        challenge_json: serde_json::to_string(&challenge)?,
    })
}
