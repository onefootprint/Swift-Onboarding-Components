use super::BiometricChallengeState;
use crate::{
    ChallengeData,
    ChallengeState,
    GetIdentifyChallengeArgs,
    IdentifyChallengeContext,
    State,
    UserChallengeContext,
};
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiError;
use api_core::telemetry::RootSpan;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use api_wire_types::{
    LoginChallengeRequest,
    LoginChallengeResponse,
    UserChallengeData,
};
use crypto::serde_cbor;
use db::models::webauthn_credential::WebauthnCredential;
use newtypes::{
    ChallengeKind,
    VaultId,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};
use webauthn_rs_core::proto::{
    Base64UrlSafeData,
    Credential,
    ParsedAttestation,
    ParsedAttestationData,
};
use webauthn_rs_proto::{
    RegisteredExtensions,
    UserVerificationPolicy,
};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Sends a challenge to the phone number and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can get or create \
    the user with this phone number."
)]
#[actix::post("/hosted/identify/login_challenge")]
pub async fn post(
    request: Json<LoginChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
    root_span: RootSpan,
) -> JsonApiResponse<LoginChallengeResponse> {
    let LoginChallengeRequest { challenge_kind } = request.into_inner();
    let user_auth = user_auth.check_guard(Any)?;
    let token = user_auth.auth_token.clone();

    // Look up existing user vault by identifier
    let args = GetIdentifyChallengeArgs {
        user_auth: Some(user_auth),
        identifiers: vec![],
        sandbox_id: None,
        obc: None,
        root_span: root_span.clone(),
    };
    let Some(ctx) = crate::get_identify_challenge_context(&state, args).await? else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Err(ErrorWithCode::LoginChallengeUserNotFound.into());
    };
    let IdentifyChallengeContext { ctx, tenant, .. } = ctx;
    let UserChallengeContext {
        vw,
        webauthn_creds: creds,
        available_challenge_kinds,
        ..
    } = ctx;

    // If we need to create a challenge, extract the phone number for the user
    let sandbox_id = vw.vault.sandbox_id.clone();
    let vault_id = vw.vault.id.clone();

    let challenge_kind = match challenge_kind {
        // Fall back to SMS if the user requested webauthn but doesn't have any creds
        // TODO let's remove this weird fallback logic... I don't think anyone is ever using it
        ChallengeKind::Passkey => {
            if creds.is_empty() {
                tracing::info!("Falling back to SMS");
                ChallengeKind::Sms
            } else {
                tracing::info!("Not falling back to SMS");
                ChallengeKind::Passkey
            }
        }
        ck => ck,
    };
    if !available_challenge_kinds.contains(&challenge_kind) {
        return Err(ErrorWithCode::UnsupportedChallengeKind(challenge_kind.to_string()).into());
    }

    let (rx, challenge_state_data, time_before_retry_s, biometric_challenge_json) = match challenge_kind {
        ChallengeKind::Passkey => {
            let challenge = initiate_passkey_login_challenge(&state, &vw.vault.id, creds).await?;
            let challenge_data = ChallengeData::Passkey(challenge.state);
            (None, challenge_data, 0, Some(challenge.challenge_json))
        }
        ChallengeKind::Sms => {
            let phone_number = vw.get_decrypted_phone(&state).await?;
            let t = tenant.as_ref();
            let (rx, challenge_state, time_before_retry_s) = state
                .sms_client
                .send_challenge_non_blocking(&state, t, phone_number.clone(), vault_id, sandbox_id)
                .await?;
            let challenge_data = ChallengeData::Sms(challenge_state);
            (Some(rx), challenge_data, time_before_retry_s.num_seconds(), None)
        }
        ChallengeKind::Email => {
            let email = vw.get_decrypted_email(&state).await?;
            let tenant = tenant.ok_or(OnboardingError::NoTenantForEmailChallenge)?;

            let challenge_data =
                send_email_challenge_non_blocking(&state, &email, vault_id, &tenant, sandbox_id)?;

            let challenge_data = ChallengeData::Email(challenge_data);
            (None, challenge_data, state.config.time_s_between_challenges, None)
        }
    };

    let err = if let Some(rx) = rx {
        rx_background_error(rx, 3).await.err()
    } else {
        None
    };
    // Since these errors return an HTTP 200, log something special on the root span if there's an error
    match err {
        Some(_) => root_span.record("meta", "error"),
        None => root_span.record("meta", "no_error"),
    };

    let data = ChallengeState {
        data: challenge_state_data,
    };
    let challenge_token = Challenge::new(data).seal(&state.challenge_sealing_key)?;

    let challenge_data = UserChallengeData {
        token,
        challenge_kind,
        challenge_token,
        biometric_challenge_json,
        time_before_retry_s,
    };
    let response = LoginChallengeResponse {
        challenge_data,
        error: err.map(|e| e.to_string()),
    };
    Ok(response)
}

struct BiometricChallenge {
    state: BiometricChallengeState,
    challenge_json: String,
}

async fn initiate_passkey_login_challenge(
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
                    transports: None,
                    attestation: ParsedAttestation {
                        data: ParsedAttestationData::None,
                        metadata: webauthn_rs_core::proto::AttestationMetadata::None,
                    }, // this doesn't matter for auth now
                    attestation_format: webauthn_rs_core::AttestationFormat::None, /* also doesn't matter
                                                                                    * for auth */
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
    let (challenge, auth_state) = webauthn.webauthn().generate_challenge_authenticate(creds, None)?;

    Ok(BiometricChallenge {
        state: BiometricChallengeState {
            state: auth_state,
            user_vault_id: user_id.clone(),
            non_synced_cred_ids,
        },
        challenge_json: serde_json::to_string(&challenge)?,
    })
}
