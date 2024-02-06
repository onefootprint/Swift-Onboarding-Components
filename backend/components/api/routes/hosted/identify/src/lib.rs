#![recursion_limit = "256"]

use api_core::{
    auth::{ob_config::ObConfigAuth, user::CheckedUserAuthContext},
    errors::{error_with_code::ErrorWithCode, ApiResult},
    telemetry::RootSpan,
    utils::{
        identify::{get_user_challenge_context, UserChallengeContext},
        sms::PhoneEmailChallengeState,
    },
    State,
};
use api_wire_types::IdentifyId;
use db::{
    errors::OptionalExtension,
    models::{scoped_vault::ScopedVault, tenant::Tenant},
};
use newtypes::{SandboxId, VaultId};
use paperclip::actix::{web, Apiv2Schema};
use strum::EnumDiscriminants;
use webauthn_rs_core::proto::{AuthenticationState, Base64UrlSafeData};

#[allow(clippy::module_inception)]
pub mod identify;
mod kba;
pub mod login_challenge;
pub mod signup_challenge;
pub mod verify;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: VaultId,
    #[serde(default)]
    pub non_synced_cred_ids: Vec<Base64UrlSafeData>,
}

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(identify::post)
        .service(login_challenge::post)
        .service(signup_challenge::post)
        .service(kba::post)
        .service(verify::post);
}

// TODO unnecessary wrapper
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ChallengeState {
    data: ChallengeData,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, EnumDiscriminants)]
pub enum ChallengeData {
    Sms(PhoneEmailChallengeState),
    #[serde(alias = "Biometric")] // TODO: drop this alias after challenges expire
    Passkey(BiometricChallengeState),
    Email(PhoneEmailChallengeState),
}

pub struct GetIdentifyChallengeArgs {
    pub user_auth: Option<CheckedUserAuthContext>,
    pub identifier: Option<IdentifyId>,
    pub sandbox_id: Option<SandboxId>,
    pub obc: Option<ObConfigAuth>,
    pub root_span: RootSpan,
}

pub struct IdentifyChallengeContext {
    pub ctx: UserChallengeContext,
    pub tenant: Option<Tenant>,
    pub sv: Option<ScopedVault>,
    /// When true, allowed to create a new user via a signup challenge even when there's already
    /// an existing user with this contact info.
    /// Generally, a user can make a new vault IF they're not in a context logging into a tenant
    /// that they've already onboarded onto
    pub can_initiate_signup_challenge: bool,
}

#[tracing::instrument(skip_all)]
async fn get_identify_challenge_context(
    state: &State,
    args: GetIdentifyChallengeArgs,
) -> ApiResult<Option<IdentifyChallengeContext>> {
    let GetIdentifyChallengeArgs {
        user_auth,
        identifier,
        sandbox_id,
        obc,
        root_span,
    } = args;

    // Look up existing user vault by identifier
    let t_id = obc.as_ref().map(|obc| &obc.tenant().id);
    let (existing_user_id, sv_id) = match (user_auth.as_ref(), identifier) {
        // Identified via phone or email
        (None, Some(id)) => {
            let Some(existing) = state.find_vault(id, sandbox_id, t_id).await? else {
                return Ok(None);
            };
            existing
        }
        // Identified via auth token
        (Some(auth), None) => (auth.user.clone().id, auth.scoped_user_id()),
        // Require one of user_auth or identifier
        (None, None) | (Some(_), Some(_)) => return Err(ErrorWithCode::OnlyOneIdentifier.into()),
    };

    // Record some properties on the root span
    root_span.record("vault_id", existing_user_id.to_string());
    let v_id = existing_user_id.clone();
    let (tenant, sv) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Add some log fields to the root span. Prefer info from the sv_id, otherwise look
            // through the obc
            let (tenant, sv) = if let Some(sv_id) = sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                root_span.record("tenant_id", sv.tenant_id.to_string());
                root_span.record("is_live", sv.is_live);
                root_span.record("fp_id", sv.fp_id.to_string());
                let tenant = Tenant::get(conn, &sv.tenant_id)?;
                (Some(tenant), Some(sv))
            } else if let Some(obc) = obc {
                root_span.record("tenant_id", obc.tenant().id.to_string());
                root_span.record("is_live", obc.ob_config().is_live);
                let t_id = &obc.tenant().id;
                // If there's already a SV for this (user, tenant) pair, log the fp_id
                let sv = ScopedVault::get(conn, (&v_id, t_id)).optional()?;
                if let Some(sv) = sv.as_ref() {
                    root_span.record("fp_id", sv.fp_id.to_string());
                }
                let tenant = Tenant::get(conn, t_id)?;
                (Some(tenant), sv)
            } else {
                (None, None)
            };
            Ok((tenant, sv))
        })
        .await?;
    let sv_id = sv.as_ref().map(|sv| sv.id.clone());
    let ctx = get_user_challenge_context(state, existing_user_id, sv_id, user_auth).await?;
    let can_initiate_signup_challenge = tenant.is_some() && sv.is_none();
    let ctx = IdentifyChallengeContext {
        ctx,
        tenant,
        sv,
        can_initiate_signup_challenge,
    };
    Ok(Some(ctx))
}
