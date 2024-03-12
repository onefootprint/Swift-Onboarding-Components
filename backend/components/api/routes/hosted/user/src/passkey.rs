use crate::{
    auth::user::{UserAuth, UserAuthContext},
    errors::{error_with_code::ErrorWithCode, ApiError},
    types::{response::ResponseData, EmptyResponse},
    utils::{challenge::Challenge, headers::InsightHeaders},
    State,
};
use api_core::{
    auth::{user::UserAuthGuard, IsGuardMet},
    errors::{ApiResult, AssertionError},
    utils::passkey::WebauthnConfig,
};
use chrono::{Duration, Utc};
use db::models::{
    auth_event::{AuthEvent, NewAuthEventArgs},
    insight_event::CreateInsightEvent,
    vault::Vault,
    webauthn_credential::WebauthnCredential,
};
use macros::route_alias;
use newtypes::{ActionKind, AuthEventKind, ChallengeToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    /// NOTE: this json needs to be a string as we need to be able to compute it's hash    
    challenge_json: String,
    challenge_token: ChallengeToken,
}

//TODO: remove alias once frontend updates
#[route_alias(post(
    "/hosted/user/biometric/init",
    tags(Passkey, Deprecated),
    description = "Generates a passkey registration challenge",
))]
#[api_v2_operation(
    description = "Generates a passkey registration challenge.",
    tags(Passkey, Hosted)
)]
#[post("/hosted/user/passkey/register")]
pub async fn init_post(
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<WebAuthnInitResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp.or(UserAuthGuard::Handoff))?;
    let vault_id = user_auth.user_vault_id().clone();
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let creds = WebauthnCredential::list(conn, user_auth.user_vault_id())?;
            let did_use_passkey = user_auth.did_use_passkey(conn)?;
            if !creds.is_empty() && !did_use_passkey {
                // Don't allow replacing a passkey unless you logged in with a passkey.
                // Otherwise could replace a passkey using a SIM swap
                return Err(ErrorWithCode::CannotRegisterPasskey.into());
            }
            Ok(())
        })
        .await?;

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let (challenge, reg_state) = webauthn.initiate_challenge(vault_id)?;

    let challenge_data = Challenge {
        expires_at: Utc::now() + Duration::minutes(5),
        data: reg_state,
    };
    let response = ResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.challenge_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebauthnRegisterRequest {
    device_response_json: String,
    challenge_token: ChallengeToken,
}

//TODO: remove alias once frontend updates
#[route_alias(post(
    "/hosted/user/biometric",
    tags(Passkey, Deprecated),
    description = "Accepts a response to a passkey registration challenge",
))]
#[api_v2_operation(
    tags(Passkey, Hosted),
    description = "Accepts a response to a passkey registration challenge"
)]
#[post("/hosted/user/passkey")]
pub async fn complete_post(
    request: Json<WebauthnRegisterRequest>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp.or(UserAuthGuard::Handoff))?;
    let WebauthnRegisterRequest {
        challenge_token,
        device_response_json: c_response,
    } = request.into_inner();

    let challenge_data = Challenge::unseal(&state.challenge_sealing_key, &challenge_token)?;
    let reg_state = challenge_data.data;
    let webauthn = WebauthnConfig::new(&state.config);
    let result = webauthn.verify_challenge(reg_state, c_response)?;

    let vault_id = user_auth.user_vault_id().clone();
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            Vault::lock(conn, &vault_id)?;

            let did_use_passkey = user_auth.did_use_passkey(conn)?;
            let creds = WebauthnCredential::list(conn, &vault_id)?;
            if !creds.is_empty() && !did_use_passkey {
                // Don't allow replacing a passkey unless you logged in with a passkey.
                // Otherwise could replace a passkey using a SIM swap
                return Err(ErrorWithCode::CannotRegisterPasskey.into());
            }

            let ie = CreateInsightEvent::from(insights).insert_with_conn(conn)?;
            let credential = result.save_credential(conn, &user_auth, ie.id)?;

            let auth_event = user_auth
                .auth_events
                .first()
                .ok_or(AssertionError("No auth events found for user"))?;
            let existing_auth_event = AuthEvent::get(conn, &auth_event.id)?;

            // record our registration of a passkey as an auth event
            // this is done here for (a) consistency with SMS first-time registration/auth
            // and (b) so we can later link a device attestation to this passkey
            // TODO should we be storing this in the auth session and reporting at the end of an
            // auth session all of the credentials used?
            let args = NewAuthEventArgs {
                vault_id: vault_id.clone(),
                scoped_vault_id: user_auth.scoped_user_id(),
                insight_event_id: Some(credential.insight_event_id),
                kind: AuthEventKind::Passkey,
                webauthn_credential_id: Some(credential.id),
                created_at: Utc::now(),
                // Use same scope as any of the auth events on this auth token
                scope: existing_auth_event.scope,
                // This API is only used to add the primary passkey
                new_auth_method_action: Some(ActionKind::AddPrimary),
            };
            AuthEvent::save(args, conn)?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}
