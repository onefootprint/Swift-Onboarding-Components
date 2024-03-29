use std::str::FromStr;

use crate::{GetIdentifyChallengeArgs, IdentifyChallengeContext, UserChallengeContext};

use api_core::{
    auth::{
        ob_config::ObConfigAuth,
        session::user::{NewUserSessionArgs, NewUserSessionContext, UserSession},
        user::UserAuthContext,
        Any,
    },
    errors::ApiResult,
    telemetry::RootSpan,
    types::{JsonApiResponse, ResponseData},
    utils::{headers::SandboxId, session::AuthSession},
    State,
};
use api_wire_types::{IdentifiedUser, IdentifyId, IdentifyRequest, IdentifyResponse};
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::{
    email::Email, DataIdentifier, IdentifyScope, IdentityDataKind as IDK, PhoneNumber, SessionAuthToken,
    UserAuthScope, VaultId,
};
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
    let IdentifyRequest {
        identifier,
        email,
        phone_number,
        scope,
    } = request.into_inner();
    if identifier.is_some() {
        tracing::info!(tenant_id=?ob_context.as_ref().map(|ob| &ob.ob_config().tenant_id), "Identifier provided");
    };
    let scope = if let Some(scope) = scope {
        tracing::info!("Scope provided");
        scope
    } else {
        // TODO should deprecate this branch when all client SDKs are updated to use /hosted/identify/lite
        tracing::info!(tenant_id=?ob_context.as_ref().map(|ob| &ob.ob_config().tenant_id), "Scope not provided");
        IdentifyScope::Onboarding
    };
    let user_auth = user_auth.map(|ua| ua.check_guard(Any)).transpose()?;
    let is_from_api = user_auth.as_ref().is_some_and(|ua| ua.purpose.is_from_api());

    // Look up existing user vault by identifier
    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.clone())),
        phone_number.as_ref().map(|e| IdentifyId::PhoneNumber(e.clone())),
        identifier,
    ]
    .into_iter()
    .flatten()
    .collect_vec();
    let args = GetIdentifyChallengeArgs {
        user_auth: user_auth.clone(),
        identifiers,
        sandbox_id: sandbox_id.0,
        obc: ob_context.clone(),
        root_span,
    };
    let Some(ctx) = crate::get_identify_challenge_context(&state, args).await? else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return ResponseData::ok(IdentifyResponse::default()).json();
    };

    let IdentifyChallengeContext {
        ctx,
        tenant: _,
        sv,
        can_initiate_signup_challenge,
        matching_fps,
    } = ctx;
    let UserChallengeContext {
        webauthn_creds,
        available_challenge_kinds,
        is_vault_unverified,
        auth_methods,
        vw,
    } = ctx;

    let v_id = vw.vault.id.clone();
    let (token, token_scopes) = if let Some(user_auth) = user_auth {
        // Don't issue a new identified token
        (user_auth.auth_token, user_auth.data.session.scopes)
    } else {
        create_identified_token(&state, v_id, scope, sv, ob_context).await?
    };
    let token_scopes = token_scopes.into_iter().map(|x| x.into()).collect();

    let dis = vec![
        DataIdentifier::Id(IDK::PhoneNumber),
        DataIdentifier::Id(IDK::Email),
    ];
    let values = vw.decrypt_unchecked(&state.enclave_client, &dis).await?;
    let phone = values.get_di(IDK::PhoneNumber).ok();
    let scrubbed_phone = phone
        .and_then(|p| PhoneNumber::parse(p).ok())
        .map(|p| p.scrubbed());
    let scrubbed_email = if is_from_api {
        // When we are identifying a user via API-created auth token, provide the scrubbed phone and email
        let email = values.get_di(IDK::Email).ok();
        let scrubbed_email = email
            .and_then(|p| Email::from_str(p.leak()).ok())
            .map(|email| email.scrubbed());
        scrubbed_email
    } else {
        None
    };

    let auth_methods = auth_methods
        .into_iter()
        .map(|m| api_wire_types::IdentifyAuthMethod {
            kind: m.kind,
            is_verified: m.is_verified,
        })
        .collect();

    let has_syncable_passkey = webauthn_creds.iter().any(|cred| cred.backup_state);
    let user = IdentifiedUser {
        token,
        token_scopes,
        available_challenge_kinds,
        auth_methods,
        has_syncable_passkey,
        is_unverified: is_vault_unverified,
        can_initiate_signup_challenge,
        scrubbed_phone,
        scrubbed_email,
        matching_fps,
    };
    let response = IdentifyResponse {
        user: Some(user.clone()),
    };
    ResponseData::ok(response).json()
}

/// Creates an identified, unauthed token for the provided vault ID.
/// The token may either explicitly specify a sv_id when vault has already onboarded onto the tenant,
/// or it may specify a playbook id onto which the vault will be onboarded after they complete the auth.
pub(super) async fn create_identified_token(
    state: &State,
    v_id: VaultId,
    scope: IdentifyScope,
    sv: Option<ScopedVault>,
    ob_context: Option<ObConfigAuth>,
) -> ApiResult<(SessionAuthToken, Vec<UserAuthScope>)> {
    let session_key = state.session_sealing_key.clone();
    let token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scopes = vec![];
            // TODO we should migrate the BO tokens to use these new un-authed, identified tokens
            let bo = ob_context.as_ref().and_then(|obc| obc.business_owner()).cloned();
            let sb = if let Some(bo) = bo.as_ref() {
                if let Some(obc) = ob_context.as_ref() {
                    let sb = ScopedVault::get(conn, (&bo.business_vault_id, &obc.tenant().id))?;
                    Some(sb)
                } else {
                    None
                }
            } else {
                None
            };
            let context = NewUserSessionContext {
                su_id: sv.map(|sv| sv.id),
                sb_id: sb.map(|sb| sb.id),
                bo_id: bo.map(|bo| bo.id),
                obc_id: ob_context.map(|obc| obc.ob_config().id.clone()),
                ..Default::default()
            };
            let args = NewUserSessionArgs {
                user_vault_id: v_id,
                purpose: scope.into(),
                context,
                scopes: scopes.clone(),
                auth_events: vec![],
            };
            let data = UserSession::make(args)?;
            let duration = scope.token_ttl();
            let (token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((token, scopes))
        })
        .await?;
    Ok(token)
}
