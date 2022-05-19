use std::str::FromStr;

use crate::{
    auth::logged_in_session::LoggedInSessionContext,
    errors::ApiError,
    liveness::LivenessWebauthnConfig,
    types::{success::ApiResponseData, Empty},
    State,
};
use crypto::b64::Base64Data;
use db::models::webauthn_credential::NewWebauthnCredential;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};
use webauthn_rs::{proto::UserVerificationPolicy, RegistrationState};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    // TODO do we have to explicitly convert this to JSON?
    challenge_json: String,
    e_challenge_data: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WebauthnChallengeState {
    pub state: RegistrationState,
    // TODO do we need a created_at/expiration time?
}

// TODO base implementation for anything serializable
impl WebauthnChallengeState {
    pub fn seal(self, _state: &web::Data<State>) -> Result<String, ApiError> {
        // TODO encrypt
        let serialized = serde_json::to_string(&self)?;
        let encoded = Base64Data(serialized.as_bytes().to_vec()).to_string();
        Ok(encoded)
    }

    pub fn unseal(sealed: &str, _state: &web::Data<State>) -> Result<Self, ApiError> {
        // TODO decrypt
        let decoded = Base64Data::from_str(sealed).map_err(crypto::Error::from)?;
        let decoded = std::str::from_utf8(&decoded.0)?.to_string();
        let deserialized = serde_json::from_str(&decoded)?;
        Ok(deserialized)
    }
}

/// Get a registration challenge
#[api_v2_operation]
#[post("/register/init")]
pub fn init(
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<WebAuthnInitResponse>>, ApiError> {
    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));
    let user_id = user_auth.user_vault().id.to_string().as_bytes().to_vec();
    // TODO: fix usernames here
    let (challenge, reg_state) = webauthn.generate_challenge_register_options(
        user_id,
        "Footprint".into(),
        "Footprint".into(),
        None,
        Some(UserVerificationPolicy::Required),
        None,
    )?;

    let response = ApiResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        e_challenge_data: WebauthnChallengeState { state: reg_state }.seal(&state)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnRegisterRequest {
    device_response_json: String,
    e_challenge_data: String,
}

/// Response to a registration challenge
#[api_v2_operation]
#[post("/register")]
async fn complete(
    request: Json<WebauthnRegisterRequest>,
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let challenge_data = WebauthnChallengeState::unseal(&request.e_challenge_data, &state)?;
    let reg_state = challenge_data.state;

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));

    let reg = serde_json::from_str(&request.device_response_json)?;
    let (cred, _authenticator_data) =
        webauthn.register_credential(&reg, &reg_state, |_| Ok(false))?;

    NewWebauthnCredential {
        user_vault_id: user_auth.user_vault().id.clone(),
        credential_id: cred.cred_id,
        public_key: crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?,
        attestation_data: Vec::new(), // TODO
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData::ok(Empty)))
}
