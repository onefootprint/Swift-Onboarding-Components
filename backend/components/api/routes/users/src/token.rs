use crate::auth::tenant::CheckTenantGuard;
use crate::types::ApiResponse;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEvent;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::user::allowed_user_scopes;
use api_core::config::LinkKind;
use api_core::errors::ValidationError;
use api_core::utils::actix::OptionalJson;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::token::create_token;
use api_core::utils::token::CreateTokenArgs;
use api_core::utils::token::CreateTokenResult;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_wire_types::CreateTokenRequest;
use api_wire_types::CreateTokenResponse;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEventArgs;
use db::models::scoped_vault::ScopedVault;
use feature_flag::BoolFlag;
use itertools::Itertools;
use newtypes::AuthEventKind;
use newtypes::IdentifyScope;
use newtypes::PreviewApi;
use newtypes::RequestedTokenScope;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js's KYC and KYB SDKs to bootstrap a user's onboarding with known information. Re-auth will be required with Footprint. More detailed documentation can be found [here](https://docs.onefootprint.com/integrate/user-specific-sessions).",
    tags(Users, Preview)
)]
#[post("/users/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: OptionalJson<CreateTokenRequest, true>,
    auth: SecretTenantAuthContext,
) -> ApiResponse<CreateTokenResponse> {
    auth.check_preview_guard(PreviewApi::CreateUserToken)?;
    let auth = auth.check_guard(TenantGuard::AuthToken)?;
    let CreateTokenRequest {
        kind,
        key,
        fp_bid,
        third_party_auth,
        limit_auth_methods,
        ttl_min,
    } = request.0.unwrap_or_default();
    let third_party_auth = third_party_auth.unwrap_or(false);
    let kind = if let Some(kind) = kind {
        kind
    } else if auth.tenant().id.is_apiture() || auth.tenant().id.is_coast() {
        // Apiture is the only real tenant that has started using the old serialization that doesn't
        // provide a kind. They were just in pilot, so don't want to make a bad impression by
        // breaking their proof of concept app or asking them to update now.
        // Will rm when they are contracted
        tracing::error!("Apiture used legacy serialization in POST /users/<>/token");
        if key.is_some() {
            TokenOperationKind::Onboard
        } else {
            TokenOperationKind::User
        }
    } else {
        return Err(ValidationError("Missing field kind").into());
    };
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    // Only allow certain tenants to create third-party auth
    let can_provide_3p_auth = auth.tenant().is_demo_tenant
        || state
            .ff_client
            .flag(BoolFlag::CanProvideThirdPartyAuth(&tenant_id));
    if third_party_auth && !can_provide_3p_auth {
        return Err(ValidationError("You are not able to provide third-party authentication.").into());
    }

    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let su = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            if third_party_auth {
                // Trust that the tenant has authenticated this user already. Only certain tenants
                // are permissioned to provide us with third-party auth.
                // We'll still portablize users with third-part auth (TODO if there's not already
                // a portable vault for the phone number)
                let args = NewAuthEventArgs {
                    vault_id: su.vault_id.clone(),
                    scoped_vault_id: Some(su.id.clone()),
                    insight_event_id: None,
                    kind: AuthEventKind::ThirdParty,
                    webauthn_credential_id: None,
                    created_at: Utc::now(),
                    scope: IdentifyScope::Onboarding,
                    new_auth_method_action: None,
                };
                AuthEvent::save(args, conn)?;
            }

            // TODO put this behind a feature gate
            let implied_auth_events = {
                // As customers start to use us for auth, there will be situations in which:
                // - The user logs into/creates an account at, say, Grid using the Footprint auth component.
                // - The user then signs up for a credit card with Grid, which requires KYC through the
                //   Footprint verify component. When this happens, we want to avoid the user needing to
                //   re-log in inside the Footprint verify component with an SMS OTP since they just did that
                //   a few minutes ago.
                // We could achieve this behavior by having the tenant physically pass us some
                // proof that the user already logged into Grid.
                // But for a better ergonomic experience, we inherit "implied" auth events -
                // if Grid generates a token to launch the user into the Footprint verify component,
                // we already have server-side state that says that the user already authenticated
                // with Grid in the last hour, so there's no need for physical token exchange.

                // Don't allow inheriting auth if the user token has more permissions than the tenant.
                // This notably makes the experience worse for users who are one-clicking onto a tenant
                // who uses us for both auth and verify.
                // The problem is user-specific tokens in one-click scenarios have more permissions
                // than the tenant (since we're prefilling info that was added by other tenants).
                // Tenant who use us for auth AND verify get to see a user-specific token - so we have
                // to disallow them from using that token to see information they don't have permission
                // to see.
                // In the future, we will try to improve that experience by having the auth component
                // leave a token inside domain-scoped local storage in the browser. The tenant will
                // never see this intermediate token. The verify component can pick this up as proof
                // that the user authed directly with Footprint, and this will be used to step up the
                // token to have permissions to see one-click prefill data.
                let portable_vw = VaultWrapper::<Any>::build_portable(conn, &su.vault_id)?;
                // This is an approximation of portable_vw.get_data_to_prefill - we can't use that
                // since we don't know the playbook the user is onboarding onto.
                // This is might be overly restrictive now - we won't allow inheriting auth if there is
                // any portable data added by another tenant.
                let has_prefill_data = portable_vw
                    .populated_dis()
                    .into_iter()
                    .filter_map(|di| portable_vw.get_lifetime(&di))
                    .any(|dl| dl.scoped_vault_id != su.id);
                let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &su.id)?;
                let can_auto_authorize = vw.can_auto_authorize(has_prefill_data);

                if can_auto_authorize {
                    AuthEvent::list_recent(conn, &su.id)?
                } else {
                    vec![]
                }
            };
            tracing::info!(num_events=%implied_auth_events.len(), %tenant_id, %is_live, "Creating token with implied auth events");
            let kinds = implied_auth_events.iter().map(|e| e.kind).collect();
            // All auth events associated with the token made here are implicit
            let auth_events = implied_auth_events
                .into_iter()
                .map(|e| AssociatedAuthEvent::implicit(e.id))
                .collect_vec();

            // Request Onboarding scopes, but if the user hasn't authed to the tenant recently, we
            // will be granted no scopes and the user will be required to re-auth
            let scopes = allowed_user_scopes(kinds, RequestedTokenScope::Onboarding, false);

            let args = CreateTokenArgs {
                su,
                kind,
                key,
                fp_bid,
                scopes,
                auth_events,
                limit_auth_methods,
            };
            let ttl_min = ttl_min.unwrap_or(60);
            const MAX_TTL: u32 = 60 * 24;
            if !(1..=MAX_TTL).contains(&ttl_min) {
                return ValidationError("Token must have a TTL for at least one minute and at most one day")
                    .into();
            }
            let CreateTokenResult {
                token,
                session,
                wfr: _,
            } = create_token(conn, &session_key, args, Duration::minutes(ttl_min as i64))?;
            Ok((token, session))
        })
        .await?;

    let link_kind = LinkKind::from_token_kind(&kind);
    let link = state.config.service_config.generate_link(link_kind, &token);
    let expires_at = session.expires_at;
    let response = CreateTokenResponse {
        token,
        link,
        expires_at,
    };
    Ok(response)
}
