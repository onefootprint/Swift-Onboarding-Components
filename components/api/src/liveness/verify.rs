use crate::{
    errors::ApiError,
    identify::{clean_email, signed_hash},
    liveness::{get_webauthn_creds, LivenessWebauthnConfig},
    types::success::ApiResponseData,
    utils::challenge::Challenge,
    State,
};
use chrono::{Duration, Utc};
use crypto::serde_cbor;
use db::models::session_data::LoggedInSessionData;
use db::models::session_data::SessionState as DbSessionState;
use newtypes::UserVaultId;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};
use webauthn_rs::{
    proto::{Credential, UserVerificationPolicy},
    AuthenticationState,
};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    challenge_json: String,
    challenge_token: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LoginChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: UserVaultId,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct LoginRequest {
    email: String,
}

#[api_v2_operation]
#[post("/login/init")]
pub async fn init(
    request: Json<LoginRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<WebAuthnInitResponse>>, ApiError> {
    let cleaned_email = clean_email(request.email.clone());
    let sh_email = signed_hash(&state, cleaned_email.clone()).await?;
    // TODO only look up by verified email
    let existing_user = db::user_vault::get_by_email(&state.db_pool, sh_email, false)
        .await?
        .map(|x| x.0)
        .ok_or(ApiError::UserDoesntExistForEmailChallenge)?;
    // look up webauthn credentials
    let creds = get_webauthn_creds(&state, existing_user.id.clone()).await?;

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
                    cred_id: cred.credential_id,
                    registration_policy: UserVerificationPolicy::Required,
                    verified: true,
                    cred: public_key,
                })
                .map_err(crypto::Error::from)
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));

    let (challenge, auth_state) = webauthn.generate_challenge_authenticate_options(creds, None)?;

    let challenge_data = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(5),
        data: LoginChallengeState {
            state: auth_state,
            user_vault_id: existing_user.id,
        },
    };
    let response = ApiResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.session_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnVerifyRequest {
    device_response_json: String,
    challenge_token: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
struct VerifyResponse {
    auth_token: String,
}

#[api_v2_operation]
#[post("/login")]
async fn complete(
    request: Json<WebauthnVerifyRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge = Challenge::<LoginChallengeState>::unseal(
        &state.session_sealing_key,
        &request.challenge_token,
    )?;

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(super::LivenessWebauthnConfig::new(&state));

    let auth_resp = serde_json::from_str(&request.device_response_json)?;
    let (_, _authenticator_data) =
        webauthn.authenticate_credential(&auth_resp, &challenge.data.state)?;

    // Save logged in session data into the DB
    let login_expires_at = Utc::now().naive_utc() + Duration::minutes(15);
    let (_, auth_token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: challenge.data.user_vault_id,
    })
    .create(&state.db_pool, login_expires_at)
    .await?;

    Ok(Json(ApiResponseData {
        data: VerifyResponse { auth_token },
    }))
}
