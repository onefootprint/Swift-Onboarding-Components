use crate::{
    auth::AuthError,
    errors::ApiError,
    liveness::LivenessWebauthnConfig,
    response::{success::ApiResponseData, Empty},
    State,
};
use actix_session::Session;
use db::models::webauthn_credential::NewWebauthnCredential;
use paperclip::{
    actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema},
    v2::schema::Apiv2Schema,
};
use serde::{Deserialize, Serialize};
use webauthn_rs::{proto::UserVerificationPolicy, WebauthnConfig};

use super::auth_context::{LivenessVerificationAuthContext, RegisterState, WebAuthnState};

/// Contains the payload for the frontend to communicate to the device via webauthm
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct GetWebauthnRegisterChallengeResponse {
    challenge_json: String,
}

/// Get a registration challenge
#[api_v2_operation]
#[get("/register")]
pub async fn get_register_challenge(
    mut auth: LivenessVerificationAuthContext,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<GetWebauthnRegisterChallengeResponse>>, ApiError> {
    // ensure we're in allowed state
    match auth.local_state.state {
        WebAuthnState::Register(RegisterState::NotStarted)
        | WebAuthnState::Register(RegisterState::RegisterChallenge(_)) => {}
        _ => return Err(AuthError::InvalidSessionState.into()),
    };

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));
    let user_id = auth.local_state.user_vault_id.as_bytes();
    // TODO: fix usernames here
    let (challenge, reg_state) = webauthn.generate_challenge_register_options(
        user_id.to_vec(),
        "Footprint".into(),
        "Footprint".into(),
        None,
        Some(UserVerificationPolicy::Required),
        None,
    )?;

    // store the local state in our cookie
    auth.local_state.state = WebAuthnState::Register(RegisterState::RegisterChallenge(reg_state));
    auth.local_state.set(&session)?;

    let response = ApiResponseData::ok(GetWebauthnRegisterChallengeResponse {
        challenge_json: serde_json::to_string(&challenge)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnRegisterRequest {
    device_response_json: String,
}

/// Response to a registration challenge
#[api_v2_operation]
#[post("/register")]
async fn post_register_challenge(
    request: Json<WebauthnRegisterRequest>,
    mut auth: LivenessVerificationAuthContext,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    // ensure we're in reg state
    let reg_state = match auth.local_state.state {
        WebAuthnState::Register(RegisterState::RegisterChallenge(reg_state)) => reg_state,
        _ => return Err(AuthError::InvalidSessionState.into()),
    };

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(super::LivenessWebauthnConfig::new(&state));

    let reg = serde_json::from_str(&request.device_response_json)?;
    let (cred, _authenticator_data) =
        webauthn.register_credential(&reg, &reg_state, |_| Ok(false))?;

    NewWebauthnCredential {
        user_vault_id: auth.local_state.user_vault_id.clone(),
        credential_id: cred.cred_id,
        public_key: crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?,
        attestation_data: Vec::new(),
    }
    .save(&state.db_pool)
    .await?;

    auth.local_state.state = WebAuthnState::Register(RegisterState::RegisterSuccess);
    auth.local_state.set(&session)?;

    Ok(Json(ApiResponseData::ok(Empty)))
}
