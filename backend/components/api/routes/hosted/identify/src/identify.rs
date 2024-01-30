use std::str::FromStr;

use crate::{IdentifyChallengeContext, UserChallengeContext, VaultIdentifier};

use api_core::{
    auth::{
        ob_config::ObConfigAuth,
        session::user::{NewUserSessionArgs, NewUserSessionContext, UserSession},
        user::UserAuthContext,
        Any,
    },
    errors::{challenge::ChallengeError, ApiResult},
    telemetry::RootSpan,
    types::{JsonApiResponse, ResponseData},
    utils::{headers::SandboxId, session::AuthSession},
    State,
};
use api_wire_types::{IdentifyRequest, IdentifyResponse};
use newtypes::{email::Email, DataIdentifier, IdentityDataKind as IDK, PhoneNumber};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Tries to identify an existing user by either phone number or email. If the user \
    is found, returns available challenge kinds."
)]
#[actix::post("/hosted/identify")]
pub async fn post(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
    // When provided, is used to identify the currently authed user. Will generate a challenge
    // for the authed user
    user_auth: Option<UserAuthContext>,
    root_span: RootSpan,
) -> JsonApiResponse<IdentifyResponse> {
    let IdentifyRequest { identifier, scope } = request.into_inner();
    let user_auth = user_auth.map(|ua| ua.check_guard(Any)).transpose()?;
    let provided_token = user_auth.as_ref().map(|ua| ua.auth_token.clone());
    let is_from_api = user_auth.as_ref().is_some_and(|ua| ua.purpose.is_from_api());

    // Require one of user_auth or identifier
    let identifier = match (user_auth, identifier) {
        (Some(user_auth), None) => VaultIdentifier::AuthenticatedId(user_auth),
        (None, Some(id)) => VaultIdentifier::IdentifyId(id, sandbox_id.0),
        (None, None) | (Some(_), Some(_)) => return Err(ChallengeError::OnlyOneIdentifier.into()),
    };

    // Look up existing user vault by identifier
    let Some(ctx) =
        crate::get_identify_challenge_context(&state, identifier, ob_context.clone(), root_span).await?
    else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return ResponseData::ok(IdentifyResponse::default()).json();
    };

    let IdentifyChallengeContext { ctx, tenant: _, sv } = ctx;
    let UserChallengeContext {
        webauthn_creds,
        available_challenge_kinds,
        is_vault_unverified,
        auth_methods,
        vw,
    } = ctx;

    let v_id = vw.vault.id.clone();
    let token = if let Some(token) = provided_token {
        // Don't issue a new identified token
        Some(token)
    } else if let Some(scope) = scope {
        // In a newer verision of this API, we're going to start issuing an "identified" but
        // unauthed token as soon as the user is located.
        // Eventually, this will be the only option
        let session_key = state.session_sealing_key.clone();
        let token = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let context = NewUserSessionContext {
                    su_id: sv.map(|sv| sv.id),
                    obc_id: ob_context.map(|obc| obc.ob_config().id.clone()),
                    ..Default::default()
                };
                let args = NewUserSessionArgs {
                    user_vault_id: v_id,
                    purpose: scope.into(),
                    context,
                    scopes: vec![],
                    auth_events: vec![],
                };
                let data = UserSession::make(args)?;
                let duration = scope.token_ttl();
                let (token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
                Ok(token)
            })
            .await??;
        Some(token)
    } else {
        None
    };

    let (scrubbed_phone, scrubbed_email) = if is_from_api {
        // When we are identifying a user via API-created auth token, provide the scrubbed phone and email
        let dis = vec![
            DataIdentifier::Id(IDK::PhoneNumber),
            DataIdentifier::Id(IDK::Email),
        ];
        let values = vw.decrypt_unchecked(&state.enclave_client, &dis).await?;
        let phone = values.get_di(IDK::PhoneNumber).ok();
        let scrubbed_phone = phone
            .and_then(|p| PhoneNumber::parse(p).ok())
            .map(|p| p.scrubbed());
        let email = values.get_di(IDK::Email).ok();
        let scrubbed_email = email
            .and_then(|p| Email::from_str(p.leak()).ok())
            .map(|email| email.scrubbed());
        (scrubbed_phone, scrubbed_email)
    } else {
        (None, None)
    };

    let auth_methods = auth_methods
        .into_iter()
        .map(|m| api_wire_types::IdentifyAuthMethod {
            kind: m.kind,
            is_verified: m.is_verified,
        })
        .collect();

    let has_syncable_pass_key = webauthn_creds.iter().any(|cred| cred.backup_state);
    let response = IdentifyResponse {
        is_unverified: is_vault_unverified,
        token,
        user_found: true,
        auth_methods,
        available_challenge_kinds: Some(available_challenge_kinds),
        has_syncable_pass_key,
        scrubbed_phone,
        scrubbed_email,
    };
    ResponseData::ok(response).json()
}
