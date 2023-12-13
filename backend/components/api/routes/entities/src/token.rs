use crate::auth::tenant::CheckTenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionArgs;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::user::allowed_user_scopes;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::errors::ValidationError;
use api_core::utils::actix::OptionalJson;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::CreateTokenRequest;
use api_wire_types::CreateTokenResponse;
use api_wire_types::TokenOperationKind;
use chrono::Duration;
use chrono::Utc;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::NewAuthEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::models::workflow_request::WorkflowRequest;
use feature_flag::BoolFlag;
use macros::route_alias;
use newtypes::AuthEventKind;
use newtypes::IdentifyScope;
use newtypes::ObConfigurationKind;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/users/{fp_id}/token",
    tags(Users, Preview),
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information. Re-auth will be required if the user hasn't logged into your tenant recently.",
))]
// TODO probably don't need the entities route
#[api_v2_operation(
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information. Re-auth will be required if the user hasn't logged into your tenant recently.",
    tags(Entities, Private)
)]
#[post("/entities/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: OptionalJson<CreateTokenRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<CreateTokenResponse> {
    let auth = auth.check_guard(TenantGuard::AuthToken)?;
    // TODO add preview guard?
    let CreateTokenRequest {
        kind,
        key,
        third_party_auth,
    } = request.0.unwrap_or_default();
    let third_party_auth = third_party_auth.unwrap_or(false);
    // For backcompat
    let kind = kind.unwrap_or(if key.is_some() {
        TokenOperationKind::Onboard
    } else {
        TokenOperationKind::User
    });
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    // Only allow certain tenants to create third-party auth
    let can_provide_3p_auth = auth.tenant().is_demo_tenant
        || state
            .feature_flag_client
            .flag(BoolFlag::CanProvideThirdPartyAuth(&tenant_id));
    if third_party_auth && !can_provide_3p_auth {
        return Err(ValidationError("You are not able to provide third-party authentication.").into());
    }

    let (token, session) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &sv.vault_id)?;
            if vault.kind != VaultKind::Person {
                return Err(ValidationError("Cannot create a token for a non-person vault").into());
            }

            if third_party_auth {
                // Trust that the tenant has authenticated this user already. Only certain tenants
                // are permissioned to provide us with third-party auth.
                // We'll still portablize users with third-part auth (TODO if there's not already
                // a portable vault for the phone number)
                NewAuthEvent {
                    vault_id: sv.vault_id.clone(),
                    scoped_vault_id: Some(sv.id.clone()),
                    insight_event_id: None,
                    kind: AuthEventKind::ThirdParty,
                    webauthn_credential_id: None,
                    created_at: Utc::now(),
                    scope: IdentifyScope::Onboarding,
                }
                .create(conn)?;
            }

            let (inherited_auth_events, can_auto_authorize) = {
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
                let portable_vw = VaultWrapper::<Any>::build_portable(conn, &sv.vault_id)?;
                // This is an approximation of portable_vw.get_data_to_prefill - we can't use that
                // since we don't know the playbook the user is onboarding onto.
                // This is might be overly restrictive now - we won't allow inheriting auth if there is
                // any portable data added by another tenant.
                let has_prefill_data = portable_vw
                    .populated_dis()
                    .into_iter()
                    .filter_map(|di| portable_vw.get_lifetime(di))
                    .any(|dl| dl.scoped_vault_id != sv.id);
                let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
                let can_auto_authorize = vw.can_auto_authorize(has_prefill_data);

                let inherited_auth_events = if can_auto_authorize {
                    AuthEvent::list_recent(conn, &sv.id)?
                } else {
                    vec![]
                };
                (inherited_auth_events, can_auto_authorize)
            };
            let kinds = inherited_auth_events.iter().map(|e| e.kind).collect();
            // Request Onboarding scopes, but if the user hasn't authed to the tenant recently, we
            // will be granted no scopes and the user will be required to re-auth
            let scopes = allowed_user_scopes(kinds, IdentifyScope::Onboarding, true);
            let duration = Duration::hours(1);

            // Determine arguments for the auth token based on the requested operation
            let (obc_id, wfr_id) = match kind {
                TokenOperationKind::User => {
                    if key.is_some() {
                        return Err(ValidationError(
                            "Cannot provide playbook key for operation of kind user",
                        )
                        .into());
                    }
                    (None, None)
                }
                TokenOperationKind::Inherit => {
                    if key.is_some() {
                        return Err(ValidationError(
                            "Cannot provide playbook key for operation of kind inherit",
                        )
                        .into());
                    }
                    // Inherit the WorkflowRequest
                    let wfr = WorkflowRequest::get_active(conn, &sv.id)?
                        .ok_or(ValidationError("No outstanding info is requested from this user"))?;
                    // Do we want to replace the obc.id on the auth token?
                    (Some(wfr.ob_configuration_id), Some(wfr.id))
                }
                TokenOperationKind::Reonboard => {
                    if key.is_some() {
                        return Err(ValidationError(
                            "Cannot provide playbook key for operation of kind reonboard",
                        )
                        .into());
                    }
                    let (_, obc) = Workflow::latest(conn, &sv.id, true)?.ok_or(ValidationError(
                        "Cannot reonboard user - user has no complete onboardings.",
                    ))?;
                    (Some(obc.id), None)
                }
                TokenOperationKind::Onboard => {
                    let key = key.ok_or(ValidationError(
                        "key must be provided for a token of kind onboard",
                    ))?;
                    let (obc, _) = ObConfiguration::get(conn, (&key, &tenant_id, is_live))?;
                    if obc.kind == ObConfigurationKind::Auth {
                        return Err(OnboardingError::CannotOnboardOntoAuthPlaybook.into());
                    }
                    (Some(obc.id), None)
                }
            };

            let args = UserSessionArgs {
                su_id: Some(sv.id),
                obc_id,
                is_from_api: true,
                is_implied_auth: can_auto_authorize,
                wfr_id,
                ..Default::default()
            };
            let event_ids = inherited_auth_events.into_iter().map(|e| e.id).collect();
            let data = UserSession::make(sv.vault_id, args, scopes, event_ids)?;
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, session))
        })
        .await?;

    let expires_at = session.expires_at;
    let link = state.config.service_config.generate_verify_link(&token, "user");
    let response = CreateTokenResponse {
        token,
        link,
        expires_at,
    };
    ResponseData::ok(response).json()
}
