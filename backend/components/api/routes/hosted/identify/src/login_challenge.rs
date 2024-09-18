use super::BiometricChallengeState;
use crate::ChallengeData;
use crate::ChallengeState;
use crate::GetIdentifyChallengeArgs;
use crate::IdentifyChallengeContext;
use crate::State;
use crate::UserAuthMethodsContext;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::errors::onboarding::OnboardingError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::identify::AuthMethodInfo;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use api_core::utils::sms::send_sms_challenge_non_blocking;
use api_core::FpResult;
use api_wire_types::LoginChallengeRequest;
use api_wire_types::LoginChallengeResponse;
use api_wire_types::UserChallengeData;
use crypto::serde_cbor;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::ChallengeKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use webauthn_rs_core::proto::Base64UrlSafeData;
use webauthn_rs_core::proto::Credential;
use webauthn_rs_core::proto::ParsedAttestation;
use webauthn_rs_core::proto::ParsedAttestationData;
use webauthn_rs_proto::RegisteredExtensions;
use webauthn_rs_proto::UserVerificationPolicy;

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
) -> ApiResponse<LoginChallengeResponse> {
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
    let UserAuthMethodsContext { vw, auth_methods, .. } = ctx;

    // If we need to create a challenge, extract the phone number for the user
    let sandbox_id = vw.vault.sandbox_id.clone();

    let Some(auth_method) = auth_methods
        .into_iter()
        .filter(|am| am.can_initiate_challenge)
        .find(|am| ChallengeKind::from(am.kind()) == challenge_kind)
    else {
        return Err(ErrorWithCode::UnsupportedChallengeKind(challenge_kind.to_string()).into());
    };

    let (rx, challenge_data, time_before_retry_s, biometric_challenge_json) = match auth_method.info {
        AuthMethodInfo::Passkey { passkeys } => {
            let challenge = initiate_passkey_login_challenge(&state, passkeys).await?;
            let challenge_data = ChallengeData::Passkey(challenge.state);
            (None, challenge_data, 0, Some(challenge.challenge_json))
        }
        AuthMethodInfo::Phone { phone, .. } => {
            let t = tenant.as_ref();
            let (rx, challenge_state) =
                send_sms_challenge_non_blocking(&state, t, phone, sandbox_id, Some(vw.vault.id)).await?;
            let challenge_data = ChallengeData::Sms(challenge_state);
            let time_before_retry = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_before_retry, None)
        }
        AuthMethodInfo::Email { email, .. } => {
            let tenant = tenant.ok_or(OnboardingError::NoTenantForEmailChallenge)?;
            let (rx, challenge_data) =
                send_email_challenge_non_blocking(&state, &email, &tenant, sandbox_id)?;
            let challenge_data = ChallengeData::Email(challenge_data);
            let time_before_retry = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_before_retry, None)
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

    let data = ChallengeState { data: challenge_data };
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
    creds: Vec<WebauthnCredential>,
) -> FpResult<BiometricChallenge> {
    if creds.is_empty() {
        return Err(OnboardingError::WebauthnCredentialsNotSet)?;
    }

    // convert these creds to webauthn rs type
    let creds = creds
        .into_iter()
        .map(|cred| {
            let pub_key = serde_cbor::from_slice(&cred.public_key).map_err(crypto::Error::from)?;
            Ok((cred, pub_key))
        })
        .map_ok(|(cred, public_key)| Credential {
            counter: 0,
            cred_id: Base64UrlSafeData(cred.credential_id),
            registration_policy: UserVerificationPolicy::Required,
            user_verified: true,
            cred: public_key,
            backup_eligible: cred.backup_eligible,
            backup_state: false, // ignore
            extensions: RegisteredExtensions::none(),
            transports: None,
            // These don't matter for now
            attestation: ParsedAttestation {
                data: ParsedAttestationData::None,
                metadata: webauthn_rs_core::proto::AttestationMetadata::None,
            },
            attestation_format: webauthn_rs_core::AttestationFormat::None,
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let (challenge, auth_state) = webauthn.webauthn().generate_challenge_authenticate(creds, None)?;

    Ok(BiometricChallenge {
        state: BiometricChallengeState { state: auth_state },
        challenge_json: serde_json::to_string(&challenge)?,
    })
}
