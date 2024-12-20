use crate::GetIdentifyChallengeArgs;
use crate::IdentifyChallengeContext;
use crate::IdentifyLookupId;
use crate::UserAuthMethodsContext;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::AssociatedAuthEvent;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::session::user::UserSessionBuilder;
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::headers::SandboxId;
use api_core::utils::identify::AuthMethod;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::IdentifiedUser;
use api_wire_types::IdentifyId;
use api_wire_types::IdentifyRequest;
use api_wire_types::IdentifyResponse;
use db::models::auth_event::AuthEvent;
use db::models::tenant::Tenant;
use itertools::chain;
use itertools::Itertools;
use newtypes::ChallengeKind;
use newtypes::IdentifyScope;
use newtypes::PreviewApi::SmsLinkAuthentication;
use newtypes::SessionAuthToken;
use newtypes::UserAuthScope;
use newtypes::VaultId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Tries to identify an existing user by either phone number or email. If the user is found, returns available challenge kinds."
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
) -> ApiResponse<IdentifyResponse> {
    let IdentifyRequest {
        identifier,
        email,
        phone_number,
        scope,
    } = request.into_inner();
    // TODO remove identifier
    tracing::info!(tenant_id=?ob_context.as_ref().map(|ob| &ob.playbook().tenant_id), has_identifier=%identifier.is_some(), "Identifier provided");

    let user_auth = user_auth.map(|ua| ua.check_guard(Any)).transpose()?;
    let is_from_api = user_auth.as_ref().is_some_and(|ua| ua.is_from_api());

    if let Some(ob) = ob_context.as_ref() {
        let user_is_live = (user_auth.as_ref())
            .map(|ua| ua.user.is_live)
            .unwrap_or(sandbox_id.is_none());
        if ob.playbook().is_live != user_is_live {
            return BadRequestInto("Sandbox ID must be provided if and only if using a sandbox playbook");
        }
    }

    // Look up existing user vault by identifier
    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.clone())),
        phone_number.as_ref().map(|e| IdentifyId::PhoneNumber(e.clone())),
        identifier,
    ]
    .into_iter()
    .flatten()
    .collect_vec();

    // Get the Playbook from either user auth or obc auth, preferring to extract from the auth token
    let playbook = (user_auth.as_ref().and_then(|ua| ua.playbook.as_ref()))
        .or(ob_context.as_ref().map(|ob| ob.playbook()))
        .cloned();

    let identifier = match (user_auth.as_ref(), identifiers) {
        (Some(user_auth), _) => {
            IdentifyLookupId::User(user_auth.user_vault_id.clone(), user_auth.su_id.clone())
        }
        (None, identifiers) if !identifiers.is_empty() => IdentifyLookupId::Pii(identifiers),
        _ => return Err(ErrorWithCode::OnlyOneIdentifier.into()),
    };

    let args = GetIdentifyChallengeArgs {
        identifier,
        playbook,
        sandbox_id: sandbox_id.0,
        root_span,
        kba_dis: user_auth.as_ref().map(|ua| ua.data.kba.as_ref()).unwrap_or(&[]),
    };
    let Some(ctx) = crate::get_identify_challenge_context(&state, args).await? else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Ok(IdentifyResponse::default());
    };

    let IdentifyChallengeContext {
        ctx,
        tenant,
        sv,
        can_initiate_signup_challenge,
        matching_fps,
    } = ctx;

    let UserAuthMethodsContext {
        is_vault_unverified,
        auth_methods: ams,
        vw,
    } = ctx;

    let ob_config_auth_context = ob_context.map(|c| c.ob_config_auth_context()).unwrap_or_default();
    let (token, token_scopes) = if let Some(user_auth) = user_auth {
        // If the user was identified by an auth token, mutate the existing auth token with any metadata
        // from the onboarding session token
        let scopes = user_auth.scopes.clone();
        let session = UserSessionBuilder::from_existing(&user_auth, scope.into())?
            .with_context(ob_config_auth_context)
            .finish()?;
        let session_key = state.session_sealing_key.clone();
        let (auth_token, _) = state
            .db_query(move |conn| user_auth.create_derived(conn, &session_key, session, None))
            .await?;
        (auth_token, scopes)
    } else {
        // Otherwise, make a new identified token
        let purpose = scope.into();
        let context = NewUserSessionContext {
            su_id: sv.map(|sv| sv.id),
            ..ob_config_auth_context
        };
        let (token, _, scopes) =
            create_identified_token(&state, &vw.vault.id, context, scope, purpose, vec![]).await?;
        (token, scopes)
    };

    let scrubbed_phone = ams.iter().find_map(|am| am.phone()).map(|p| p.scrubbed());
    // When we are identifying a user via API-created auth token, provide the scrubbed phone and email
    let scrubbed_email = if is_from_api {
        ams.iter().find_map(|am| am.email()).map(|p| p.scrubbed())
    } else {
        None
    };

    let tenant = tenant.as_ref();
    let (has_syncable_passkey, available_challenge_kinds, auth_methods) = serialize_auth_methods(ams, tenant);

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
    Ok(response)
}

pub(super) fn serialize_auth_methods(
    ams: Vec<AuthMethod>,
    tenant: Option<&Tenant>,
) -> (bool, Vec<ChallengeKind>, Vec<api_wire_types::IdentifyAuthMethod>) {
    let has_syncable_passkey = ams
        .iter()
        .flat_map(|am| am.passkeys())
        .any(|cred| cred.backup_state);
    let tenant_supports_sms_link = tenant.is_some_and(|t| t.can_access_preview(&SmsLinkAuthentication));
    let available_challenge_kinds = ams
        .iter()
        .filter(|m| m.can_initiate_login_challenge)
        .flat_map(|m| m.kind().supported_challenge_kinds(tenant_supports_sms_link))
        .collect_vec();
    let auth_methods = ams
        .into_iter()
        .map(|m| api_wire_types::IdentifyAuthMethod {
            kind: m.kind(),
            is_verified: m.is_verified,
        })
        .collect();
    (has_syncable_passkey, available_challenge_kinds, auth_methods)
}

/// Creates an identified, unauthed token for the provided vault ID.
/// The token may either explicitly specify a sv_id when vault has already onboarded onto the
/// tenant, or it may specify a playbook id onto which the vault will be onboarded after they
/// complete the auth.
pub(super) async fn create_identified_token(
    state: &State,
    v_id: &VaultId,
    context: NewUserSessionContext,
    scope: IdentifyScope,
    purpose: TokenCreationPurpose,
    explicit_auth_events: Vec<AuthEvent>,
) -> FpResult<(SessionAuthToken, AuthSession, Vec<UserAuthScope>)> {
    let session_key = state.session_sealing_key.clone();
    let v_id = v_id.clone();
    // Add metadata from the onboarding session token
    let token = state
        .db_query(move |conn| {
            let identify_session_scope = (matches!(purpose, TokenCreationPurpose::IdentifySession))
                .then_some(UserAuthScope::IdentifySession);
            let ae_kinds = explicit_auth_events.iter().map(|ae| ae.kind).collect_vec();
            let explicit_auth = !explicit_auth_events.is_empty();
            let scopes = allowed_user_scopes(ae_kinds, scope.into(), explicit_auth);
            let scopes = chain!(scopes, identify_session_scope).collect_vec();

            let purposes = chain!(
                // TODO we should migrate the BO tokens to use these new un-authed, identified tokens.
                // Then the purpose here would come from the SecondayBo token. But for now, we'll just
                // manually add this purpose to keep track of when the auth session is for a secondary BO.
                (context.bo_id.is_some()).then_some(TokenCreationPurpose::SecondaryBo),
                Some(purpose),
            )
            .collect();

            let aes = explicit_auth_events
                .into_iter()
                .map(|ae| AssociatedAuthEvent::explicit(ae.id))
                .collect_vec();

            let session = UserSessionBuilder::new(v_id, purposes)
                .with_context(context)
                .add_scopes(scopes.clone())
                .add_auth_events(aes)
                .finish()?;
            let duration = scope.token_ttl();
            let (token, session) = AuthSession::create_sync(conn, &session_key, session, duration)?;
            Ok((token, session, scopes))
        })
        .await?;
    Ok(token)
}
