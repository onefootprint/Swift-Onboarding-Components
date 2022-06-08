use crate::{
    auth::{either::Either, session_context::SessionContext, AuthError},
    errors::ApiError,
    types::{success::ApiResponseData, Empty},
    utils::{
        challenge::{Challenge, ChallengeToken},
        insight_headers::InsightHeaders,
        liveness::LivenessWebauthnConfig,
    },
    State,
};
use chrono::{Duration, Utc};
use db::models::insight_event::CreateInsightEvent;
use db::models::webauthn_credential::NewWebauthnCredential;
use newtypes::user::{d2p::D2pSession, onboarding::OnboardingSession};
use newtypes::AttestationType;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};
use webauthn_rs_core::{proto::AttestationCaList, AttestationFormat};
use webauthn_rs_proto::{
    AttestationConveyancePreference, AuthenticatorAttachment, COSEAlgorithm, UserVerificationPolicy,
};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    // TODO do we have to explicitly convert this to JSON?
    challenge_json: String,
    challenge_token: ChallengeToken,
}

/// Get a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/biometric/init")]
pub fn init(
    // TODO only allow registering webauthn credentials if you have no previous credentials OR if
    // you logged into this session via webauthn. Otherwise, someone who SIM swaps you can register
    // their own webauthn creds
    user_auth: Either<SessionContext<D2pSession>, SessionContext<OnboardingSession>>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<WebAuthnInitResponse>>, ApiError> {
    // checks if we're either in a d2p session & it's in progress, or it's an onboarding session
    if !user_auth.is_valid_biometric_session() {
        return Err(AuthError::SessionTypeError).map_err(ApiError::from);
    };
    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(&state);
    let user_id = user_auth.user_vault_id();

    let (challenge, reg_state) = webauthn.webauthn().generate_challenge_register_options(
        user_id.to_string(),
        "Footprint".into(), // todo: fix this
        AttestationConveyancePreference::Direct,
        Some(UserVerificationPolicy::Required),
        None,
        None,
        COSEAlgorithm::secure_algs(),
        true,
        Some(AuthenticatorAttachment::Platform),
        false,
    )?;

    let challenge_data = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(5),
        data: reg_state,
    };
    let response = ApiResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.session_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnRegisterRequest {
    device_response_json: String,
    challenge_token: ChallengeToken,
}

/// Response to a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/biometric")]
async fn complete(
    request: Json<WebauthnRegisterRequest>,
    user_auth: Either<SessionContext<D2pSession>, SessionContext<OnboardingSession>>,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let challenge_data = Challenge::unseal(&state.session_sealing_key, &request.challenge_token)?;
    let reg_state = challenge_data.data;

    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(&state);
    let cas = AttestationCaList::apple_and_android();

    let reg = serde_json::from_str(&request.device_response_json)?;
    let cred = webauthn
        .webauthn()
        .register_credential(&reg, &reg_state, Some(&cas))?;

    let attestation_type = match cred.attestation_format {
        None => AttestationType::Unknown,
        Some(format) => match format {
            AttestationFormat::AppleAnonymous => AttestationType::Apple,
            AttestationFormat::AndroidKey => AttestationType::AndroidKey,
            AttestationFormat::AndroidSafetyNet => AttestationType::AndroidSafetyNet,
            AttestationFormat::None => AttestationType::None,
            _ => AttestationType::Unknown,
        },
    };

    let insight_event = CreateInsightEvent::from(insights).insert(&state.db_pool).await?;

    NewWebauthnCredential {
        user_vault_id: user_auth.user_vault_id(),
        credential_id: cred.cred_id.0,
        public_key: crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?,
        attestation_data: Vec::new(), // TODO
        backup_eligible: cred.backup_eligible,
        attestation_type,
        insight_event_id: insight_event.id,
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData::ok(Empty)))
}
