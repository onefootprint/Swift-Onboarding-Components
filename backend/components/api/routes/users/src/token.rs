use crate::auth::tenant::CheckTenantGuard;
use crate::types::ApiResponse;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEvent;
use api_core::auth::tenant::TenantApiKey;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::AuthError;
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
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js's KYC and KYB SDKs to bootstrap a user's onboarding with known information. Re-auth will be required with Footprint. More detailed documentation can be found [here](https://docs.onefootprint.com/articles/integrate/user-specific-sessions).",
    tags(Users, PublicApi)
)]
#[post("/users/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: OptionalJson<CreateTokenRequest, true>,
    auth: TenantApiKey,
) -> ApiResponse<CreateTokenResponse> {
    let auth = auth.check_guard(TenantGuard::AuthToken)?;
    let tenant = auth.tenant().clone();
    let CreateTokenRequest {
        kind,
        key,
        fp_bid,
        use_third_party_auth,
        use_implicit_auth,
        limit_auth_methods,
        ttl_min,
        allow_reonboard,
    } = request.0.unwrap_or_default();
    let allow_reonboard = allow_reonboard.unwrap_or(true);

    let kind = if let Some(kind) = kind {
        kind
    } else if tenant.id.is_apiture() {
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

    let use_implicit_auth = use_implicit_auth.unwrap_or_else(|| {
        // These tenants were using implicit auth before we required them to explicitly request it. Will
        // keep doing this until they pass in the flag.
        let is_legacy_tenant = tenant.id.is_fractional() || tenant.id.is_coba() || tenant.id.is_grid();
        if is_legacy_tenant {
            tracing::info!(tenant_id=%tenant.id, "Implicitly enabling use_implicit_auth");
        };
        is_legacy_tenant
    });


    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    // Only allow certain tenants to create third-party auth
    let can_provide_3p_auth = auth.tenant().is_demo_tenant
        || state
            .ff_client
            .flag(BoolFlag::CanProvideThirdPartyAuth(&tenant.id));
    if use_third_party_auth && !can_provide_3p_auth {
        return Err(ValidationError("You are not provisioned to provide third-party authentication.").into());
    }
    if use_implicit_auth && !auth.tenant().can_access_preview(&PreviewApi::ImplicitAuth) {
        return Err(AuthError::CannotAccessPreviewApi.into());
    }

    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let su = ScopedVault::get(conn, (&fp_id, &tenant.id, is_live))?;
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &su.id)?;

            let third_party_auth_event = if use_third_party_auth {
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
                let ae = AuthEvent::save(args, conn)?;
                Some(ae)
            } else {
                None
            };

            // As customers start to use us for auth, there will be situations in which:
            // - The user logs into/creates an account at, say, Grid using the Footprint auth component.
            // - The user then signs up for a credit card with Grid, which requires KYC through the Footprint
            //   verify component. When this happens, we want to avoid the user needing to re-log in inside
            //   the Footprint verify component with an SMS OTP since they just did that a few minutes ago.
            // We could achieve this behavior by having the our SDK physically pass us some
            // proof that the user already logged into Grid.
            // But for a better ergonomic experience, we inherit "implied" auth events -
            // if Grid generates a token to launch the user into the Footprint verify component,
            // we already have server-side state that says that the user already authenticated
            // with Grid in the last hour, so there's no need for physical token exchange.

            // There is some risk that an implied auth token could end up registering other auth
            // credentials for a user. So for now, we will limit implied auth to _only_ work for users
            // who only have an account at this tenant.
            // Maybe we can open this up when we have a better distinction around (1) vaulting PII and (2)
            // creating a login method.
            let can_use_implicit_auth = if use_implicit_auth {
                let only_sv = ScopedVault::list(conn, &su.vault_id)?
                    .iter()
                    .all(|sv| sv.tenant_id == tenant.id);
                let can_decrypt_all_dis = vw.populated_dis().into_iter().all(|di| vw.tenant_can_decrypt(di));
                only_sv && can_decrypt_all_dis
            } else {
                false
            };
            let implicit_auth_events = if can_use_implicit_auth {
                AuthEvent::list_recent(conn, &su.id)?
            } else {
                // Regardless of whether implicit auth is enabled, if 3p auth was used, we should inherit the event
                third_party_auth_event.into_iter().collect()
            };
            tracing::info!(num_events=%implicit_auth_events.len(), tenant_id=%tenant.id, %is_live, "Creating token with implied auth events");
            let kinds = implicit_auth_events.iter().map(|e| e.kind).collect();
            // All auth events associated with the token made here are implicit
            let auth_events = implicit_auth_events
                .into_iter()
                .map(|e| AssociatedAuthEvent::implicit(e.id))
                .collect_vec();

            // Request Onboarding scopes, but if the user hasn't authed to the tenant recently, we
            // will be granted no scopes and the user will be required to re-auth
            let scopes = allowed_user_scopes(kinds, RequestedTokenScope::Onboarding, false);

            let ttl_min = ttl_min.unwrap_or(60);
            const MAX_TTL: u32 = 60 * 24;
            if !(1..=MAX_TTL).contains(&ttl_min) {
                return ValidationError("Token must have a TTL for at least one minute and at most one day")
                    .into();
            }
            let args = CreateTokenArgs {
                vw: &vw,
                kind,
                key,
                fp_bid,
                scopes,
                auth_events,
                limit_auth_methods,
                allow_reonboard,
            };
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
